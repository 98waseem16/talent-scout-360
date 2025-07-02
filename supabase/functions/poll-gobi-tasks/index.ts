
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GobiStatusResponse {
  status: 'running' | 'completed' | 'failed';
  result?: {
    jobs?: Array<{
      title: string;
      company: string;
      location: string;
      description?: string;
      requirements?: string[];
      benefits?: string[];
      responsibilities?: string[];
      salary?: string;
      type?: string;
      application_url?: string;
      logo?: string;
    }>;
    error?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const gobiApiKey = Deno.env.get('GOBI_API_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const requestBody = await req.json().catch(() => ({}))
    const specificJobId = requestBody.specific_job_id
    const triggerSource = requestBody.trigger || 'manual'

    console.log('Starting Gobi task polling...', { specificJobId, triggerSource })

    // PHASE 1: Handle specific job polling (for manual checks)
    let jobsQuery = supabase
      .from('scraping_jobs')
      .select(`
        *,
        career_page_sources(url, company_name)
      `)
      .eq('status', 'running')
      .not('gobi_task_id', 'is', null)

    if (specificJobId) {
      // Manual check for specific job
      jobsQuery = jobsQuery.eq('id', specificJobId)
    } else {
      // Automatic polling - only poll jobs that haven't been checked recently
      jobsQuery = jobsQuery.or('last_polled_at.is.null,last_polled_at.lt.' + new Date(Date.now() - 2 * 60 * 1000).toISOString())
    }

    const { data: runningJobs, error: fetchError } = await jobsQuery

    if (fetchError) {
      console.error('Error fetching running jobs:', fetchError)
      return new Response('Error fetching jobs', { status: 500, headers: corsHeaders })
    }

    if (!runningJobs || runningJobs.length === 0) {
      console.log('No jobs to poll')
      return new Response('No jobs to poll', { status: 200, headers: corsHeaders })
    }

    console.log(`Polling ${runningJobs.length} jobs`)
    let processedJobs = 0
    let recoveredJobs = 0

    for (const job of runningJobs) {
      console.log(`Polling job ${job.id} with Gobi task ${job.gobi_task_id}`)
      
      try {
        const startTime = Date.now()
        const response = await fetch(`https://api.gobi.ai/v1/task/${job.gobi_task_id}/status`, {
          headers: {
            'Authorization': `Bearer ${gobiApiKey}`,
            'Content-Type': 'application/json'
          }
        })
        const responseTime = Date.now() - startTime

        if (!response.ok) {
          console.log(`Failed to get status for task ${job.gobi_task_id}: ${response.status}`)
          continue
        }

        const statusData: GobiStatusResponse = await response.json()
        console.log(`Task ${job.gobi_task_id} status:`, statusData.status)

        // Update last polled time
        await supabase
          .from('scraping_jobs')
          .update({
            last_polled_at: new Date().toISOString(),
            gobi_status_checked_at: new Date().toISOString()
          })
          .eq('id', job.id)

        // PHASE 2: Enhanced logging with response time
        await supabase
          .from('task_status_history')
          .insert({
            scraping_job_id: job.id,
            status: statusData.status,
            gobi_response: statusData,
            checked_at: new Date().toISOString(),
            response_time_ms: responseTime
          })

        // PHASE 2: Improved stuck detection with force recovery for very old jobs
        const startedAt = new Date(job.started_at)
        const hoursRunning = (Date.now() - startedAt.getTime()) / (1000 * 60 * 60)
        
        if (statusData.status === 'running') {
          const timeoutMinutes = job.task_timeout_minutes || 15 // Reduced from 30 to 15 minutes
          const isStuck = Date.now() - startedAt.getTime() > timeoutMinutes * 60 * 1000
          const isVeryOld = hoursRunning > 2 // Force recover jobs older than 2 hours

          if (isStuck || isVeryOld) {
            const reason = isVeryOld ? `Job running for ${hoursRunning.toFixed(1)} hours - force recovery` : `Task timed out after ${timeoutMinutes} minutes`
            console.log(`Task ${job.gobi_task_id} recovery needed: ${reason}`)
            
            await supabase
              .from('scraping_jobs')
              .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                error_message: reason
              })
              .eq('id', job.id)

            // PHASE 3: Log recovery action
            await supabase
              .from('job_recovery_log')
              .insert({
                scraping_job_id: job.id,
                recovery_action: 'timeout_recovery',
                old_status: 'running',
                new_status: 'failed',
                recovery_reason: reason
              })

            recoveredJobs++
          }
        } else if (statusData.status === 'completed') {
          console.log(`Task ${job.gobi_task_id} completed - processing results`)
          
          // Check if webhook already processed this
          const { data: existingJobs } = await supabase
            .from('job_postings')
            .select('id')
            .eq('scraping_job_id', job.id)

          if (!existingJobs || existingJobs.length === 0) {
            console.log(`No jobs found for completed task ${job.gobi_task_id} - webhook missed it, triggering backup processing`)
            
            // PHASE 2: Webhook health monitoring
            await supabase
              .from('webhook_health')
              .update({
                failure_count: supabase.sql`failure_count + 1`,
                updated_at: new Date().toISOString()
              })
              .eq('webhook_type', 'gobi-webhook')

            // Trigger webhook processing as backup
            try {
              await fetch(`${supabaseUrl}/functions/v1/gobi-webhook`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseServiceRoleKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  task_id: job.gobi_task_id,
                  status: 'completed',
                  result: statusData.result
                })
              })
              console.log('Triggered webhook processing as backup')
              
              // PHASE 3: Log recovery action
              await supabase
                .from('job_recovery_log')
                .insert({
                  scraping_job_id: job.id,
                  recovery_action: 'webhook_backup_trigger',
                  old_status: 'running',
                  new_status: 'completed',
                  recovery_reason: 'Webhook missed completion, triggered backup processing'
                })

              recoveredJobs++
            } catch (webhookError) {
              console.error('Failed to trigger webhook backup:', webhookError)
            }
          } else {
            console.log(`Jobs already exist for task ${job.gobi_task_id} - webhook processed correctly`)
            
            // Update webhook health on success
            await supabase
              .from('webhook_health')
              .update({
                last_received_at: new Date().toISOString(),
                is_active: true,
                updated_at: new Date().toISOString()
              })
              .eq('webhook_type', 'gobi-webhook')
          }
        } else if (statusData.status === 'failed') {
          console.log(`Task ${job.gobi_task_id} failed`)
          
          await supabase
            .from('scraping_jobs')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: statusData.result?.error || 'Task failed without specific error'
            })
            .eq('id', job.id)

          // PHASE 3: Log failure
          await supabase
            .from('job_recovery_log')
            .insert({
              scraping_job_id: job.id,
              recovery_action: 'status_sync',
              old_status: 'running',
              new_status: 'failed',
              recovery_reason: 'Synced failed status from Gobi API'
            })
        }

        processedJobs++

      } catch (error) {
        console.error(`Error polling job ${job.id}:`, error)
      }
    }

    // PHASE 2: Enhanced health monitoring
    const { data: healthStats } = await supabase
      .from('scraping_jobs')
      .select('status')
      
    if (healthStats) {
      const stats = healthStats.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log('Job processing health stats:', stats)
      
      // Log monitoring data with enhanced metrics
      await supabase
        .from('queue_monitoring')
        .insert({
          queue_size: stats.pending || 0,
          processed_jobs: stats.completed || 0,
          failed_jobs: stats.failed || 0,
          processing_time_ms: Date.now() - (req as any).startTime || 0,
          trigger_source: `polling_${triggerSource}`
        })
    }

    console.log(`Polling completed: processed ${processedJobs} jobs, recovered ${recoveredJobs} jobs`)
    
    return new Response(JSON.stringify({
      success: true,
      processed: processedJobs,
      recovered: recoveredJobs,
      trigger: triggerSource
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in polling function:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
