
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
    const triggerSource = requestBody.trigger || 'automatic'

    console.log('=== GOBI POLLING STARTED ===', { specificJobId, triggerSource })

    // EMERGENCY FIX: Simplified job querying without broken references
    let jobsQuery = supabase
      .from('scraping_jobs')
      .select(`
        *,
        career_page_sources(url, company_name)
      `)
      .eq('status', 'running')
      .not('gobi_task_id', 'is', null)

    if (specificJobId) {
      jobsQuery = jobsQuery.eq('id', specificJobId)
    } else {
      // Only poll jobs that haven't been checked recently (2 minutes)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
      jobsQuery = jobsQuery.or(`last_polled_at.is.null,last_polled_at.lt.${twoMinutesAgo}`)
    }

    const { data: runningJobs, error: fetchError } = await jobsQuery

    if (fetchError) {
      console.error('Error fetching running jobs:', fetchError)
      return new Response('Error fetching jobs', { status: 500, headers: corsHeaders })
    }

    if (!runningJobs || runningJobs.length === 0) {
      console.log('No jobs to poll')
      return new Response(JSON.stringify({ success: true, processed: 0 }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${runningJobs.length} jobs to poll`)
    let processedJobs = 0
    let recoveredJobs = 0

    for (const job of runningJobs) {
      console.log(`Polling job ${job.id} with task ${job.gobi_task_id}`)
      
      try {
        // Check Gobi API status
        const response = await fetch(`https://api.gobi.ai/v1/task/${job.gobi_task_id}/status`, {
          headers: {
            'Authorization': `Bearer ${gobiApiKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          console.log(`Failed to get status for task ${job.gobi_task_id}: ${response.status}`)
          continue
        }

        const statusData: GobiStatusResponse = await response.json()
        console.log(`Task ${job.gobi_task_id} status: ${statusData.status}`)

        // Update last polled time
        await supabase
          .from('scraping_jobs')
          .update({
            last_polled_at: new Date().toISOString(),
            gobi_status_checked_at: new Date().toISOString()
          })
          .eq('id', job.id)

        // Enhanced timeout detection
        const startedAt = new Date(job.started_at)
        const hoursRunning = (Date.now() - startedAt.getTime()) / (1000 * 60 * 60)
        const timeoutMinutes = job.task_timeout_minutes || 15
        const isTimedOut = Date.now() - startedAt.getTime() > timeoutMinutes * 60 * 1000
        const isVeryOld = hoursRunning > 2

        if (statusData.status === 'running' && (isTimedOut || isVeryOld)) {
          const reason = isVeryOld ? 
            `Job running for ${hoursRunning.toFixed(1)} hours - force recovery` : 
            `Task timed out after ${timeoutMinutes} minutes`
          
          console.log(`Recovering stuck job: ${reason}`)
          
          await supabase
            .from('scraping_jobs')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: reason
            })
            .eq('id', job.id)

          // Log recovery
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
          
        } else if (statusData.status === 'completed') {
          console.log(`Task ${job.gobi_task_id} completed - checking for jobs`)
          
          // Check if webhook already processed this
          const { data: existingJobs } = await supabase
            .from('job_postings')
            .select('id')
            .eq('scraping_job_id', job.id)

          if (!existingJobs || existingJobs.length === 0) {
            console.log('Webhook missed completion - triggering backup processing')
            
            // Trigger webhook as backup
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
              
              console.log('✅ Triggered webhook backup processing')
              recoveredJobs++
              
              // Log recovery
              await supabase
                .from('job_recovery_log')
                .insert({
                  scraping_job_id: job.id,
                  recovery_action: 'webhook_backup_trigger',
                  old_status: 'running',
                  new_status: 'completed',
                  recovery_reason: 'Webhook missed completion, triggered backup processing'
                })
              
            } catch (webhookError) {
              console.error('Failed to trigger webhook backup:', webhookError)
            }
          } else {
            console.log('Jobs already exist - webhook processed correctly')
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
        }

        processedJobs++

      } catch (error) {
        console.error(`Error polling job ${job.id}:`, error)
      }
    }

    console.log(`✅ Polling completed: processed ${processedJobs}, recovered ${recoveredJobs}`)
    
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
    console.error('Polling function error:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
