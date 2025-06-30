
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

    console.log('Starting Gobi task polling...')

    // Get running jobs that need to be polled
    const { data: runningJobs, error: fetchError } = await supabase
      .from('scraping_jobs')
      .select(`
        *,
        career_page_sources(url, company_name)
      `)
      .eq('status', 'running')
      .not('gobi_task_id', 'is', null)
      .or('last_polled_at.is.null,last_polled_at.lt.' + new Date(Date.now() - 2 * 60 * 1000).toISOString())

    if (fetchError) {
      console.error('Error fetching running jobs:', fetchError)
      return new Response('Error fetching jobs', { status: 500, headers: corsHeaders })
    }

    if (!runningJobs || runningJobs.length === 0) {
      console.log('No jobs to poll')
      return new Response('No jobs to poll', { status: 200, headers: corsHeaders })
    }

    console.log(`Polling ${runningJobs.length} jobs`)

    for (const job of runningJobs) {
      console.log(`Polling job ${job.id} with Gobi task ${job.gobi_task_id}`)
      
      try {
        // PHASE 2: Modified polling - NO JOB CREATION, only status updates and stuck task detection
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
        console.log(`Task ${job.gobi_task_id} status:`, statusData.status)

        // Update last polled time
        await supabase
          .from('scraping_jobs')
          .update({
            last_polled_at: new Date().toISOString(),
            gobi_status_checked_at: new Date().toISOString()
          })
          .eq('id', job.id)

        // Log status history
        await supabase
          .from('task_status_history')
          .insert({
            scraping_job_id: job.id,
            status: statusData.status,
            gobi_response: statusData,
            checked_at: new Date().toISOString()
          })

        // PHASE 3: Enhanced stuck task detection
        if (statusData.status === 'running') {
          const startedAt = new Date(job.started_at)
          const timeoutMinutes = job.task_timeout_minutes || 30
          const isStuck = Date.now() - startedAt.getTime() > timeoutMinutes * 60 * 1000

          if (isStuck) {
            console.log(`Task ${job.gobi_task_id} appears stuck, marking as failed`)
            
            await supabase
              .from('scraping_jobs')
              .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                error_message: `Task timed out after ${timeoutMinutes} minutes`
              })
              .eq('id', job.id)
          }
        } else if (statusData.status === 'completed') {
          // PHASE 2: Webhook-only processing - Don't create jobs here
          // Just ensure the webhook will handle it, or mark as completed if webhook missed it
          console.log(`Task ${job.gobi_task_id} completed - webhook should handle job creation`)
          
          // Check if webhook already processed this
          const { data: existingJobs } = await supabase
            .from('job_postings')
            .select('id')
            .eq('scraping_job_id', job.id)

          if (!existingJobs || existingJobs.length === 0) {
            console.log(`No jobs found for completed task ${job.gobi_task_id} - webhook may have missed it`)
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
            } catch (webhookError) {
              console.error('Failed to trigger webhook backup:', webhookError)
            }
          } else {
            console.log(`Jobs already exist for task ${job.gobi_task_id}`)
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

      } catch (error) {
        console.error(`Error polling job ${job.id}:`, error)
      }
    }

    // PHASE 3: Health check monitoring
    const { data: healthStats } = await supabase
      .from('scraping_jobs')
      .select('status')
      
    if (healthStats) {
      const stats = healthStats.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log('Job processing health stats:', stats)
      
      // Log monitoring data
      await supabase
        .from('queue_monitoring')
        .insert({
          queue_size: stats.pending || 0,
          processed_jobs: stats.completed || 0,
          failed_jobs: stats.failed || 0,
          trigger_source: 'polling_health_check'
        })
    }

    console.log('Polling completed')
    return new Response('Polling completed', { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error('Error in polling function:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
