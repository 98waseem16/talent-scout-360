
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

    // Query jobs that need polling
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
      // Reduced timeout from 2 minutes to 1 minute for faster polling
      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString()
      jobsQuery = jobsQuery.or(`last_polled_at.is.null,last_polled_at.lt.${oneMinuteAgo}`)
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
        // CRITICAL FIX: Use the correct Gobi API endpoint that matches the submit endpoint
        const statusUrl = `https://gobii.ai/api/v1/tasks/browser-use/${job.gobi_task_id}`
        console.log(`Checking status at: ${statusUrl}`)
        
        const response = await fetch(statusUrl, {
          headers: {
            'X-Api-Key': gobiApiKey,
            'Content-Type': 'application/json'
          }
        })

        console.log(`Response status: ${response.status}`)

        if (!response.ok) {
          console.log(`Failed to get status for task ${job.gobi_task_id}: ${response.status}`)
          
          // Log the failed attempt
          await supabase
            .from('task_status_history')
            .insert({
              scraping_job_id: job.id,
              status: 'polling_failed',
              gobi_response: { error: `HTTP ${response.status}`, url: statusUrl },
              response_time_ms: null
            })
          
          continue
        }

        const statusData: GobiStatusResponse = await response.json()
        console.log(`Task ${job.gobi_task_id} status: ${statusData.status}`, statusData)

        // Log the status check
        await supabase
          .from('task_status_history')
          .insert({
            scraping_job_id: job.id,
            status: statusData.status,
            gobi_response: statusData,
            response_time_ms: null
          })

        // Update last polled time
        await supabase
          .from('scraping_jobs')
          .update({
            last_polled_at: new Date().toISOString(),
            gobi_status_checked_at: new Date().toISOString()
          })
          .eq('id', job.id)

        // Enhanced timeout detection - reduced from 15 to 5 minutes
        const startedAt = new Date(job.started_at)
        const hoursRunning = (Date.now() - startedAt.getTime()) / (1000 * 60 * 60)
        const timeoutMinutes = job.task_timeout_minutes || 5
        const isTimedOut = Date.now() - startedAt.getTime() > timeoutMinutes * 60 * 1000
        const isVeryOld = hoursRunning > 1

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
          console.log(`Task ${job.gobi_task_id} completed - processing results`)
          
          // Process the completed job directly here instead of relying on webhook
          if (statusData.result?.jobs && statusData.result.jobs.length > 0) {
            console.log(`Found ${statusData.result.jobs.length} jobs to import`)
            
            // Create job postings as drafts
            const jobPostings = statusData.result.jobs.map(jobData => ({
              title: jobData.title,
              company: jobData.company,
              location: jobData.location,
              description: jobData.description || '',
              requirements: jobData.requirements || [],
              responsibilities: jobData.responsibilities || [],
              benefits: jobData.benefits || [],
              salary: jobData.salary || 'Not specified',
              type: jobData.type || 'Full-time',
              application_url: jobData.application_url,
              logo: jobData.logo || '/placeholder.svg',
              posted: new Date().toISOString(),
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
              is_draft: true,
              scraped_at: new Date().toISOString(),
              scraping_job_id: job.id,
              source_url: job.career_page_sources.url
            }))

            const { data: insertedJobs, error: insertError } = await supabase
              .from('job_postings')
              .insert(jobPostings)
              .select()

            if (insertError) {
              console.error('Error inserting job postings:', insertError)
              throw insertError
            }

            console.log(`Successfully imported ${insertedJobs?.length || 0} jobs`)

            // Update scraping job status
            await supabase
              .from('scraping_jobs')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                jobs_found: statusData.result.jobs.length,
                jobs_created: insertedJobs?.length || 0
              })
              .eq('id', job.id)

            recoveredJobs++
          } else {
            console.log('No jobs found in completed task')
            
            await supabase
              .from('scraping_jobs')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                jobs_found: 0,
                jobs_created: 0,
                error_message: 'No jobs found on the page'
              })
              .eq('id', job.id)
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
        
        // Log the error
        await supabase
          .from('task_status_history')
          .insert({
            scraping_job_id: job.id,
            status: 'polling_error',
            gobi_response: { error: error.message },
            response_time_ms: null
          })
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
