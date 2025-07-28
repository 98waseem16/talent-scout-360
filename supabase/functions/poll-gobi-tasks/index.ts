
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
        // Try the result endpoint to get actual extracted data
        const statusUrl = `https://gobii.ai/api/v1/tasks/browser-use/${job.gobi_task_id}/result`
        console.log(`Checking result at: ${statusUrl}`)
        
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
          console.log('Complete status data:', JSON.stringify(statusData, null, 2))
          
          let jobsFound = 0;
          let jobsCreated = 0;
          
          try {
            // Validate response structure before processing
            if (!statusData.result || !statusData.result.jobs || !Array.isArray(statusData.result.jobs)) {
              console.error(`Invalid Gobi response structure for job ${job.id}:`, statusData);
              throw new Error('Invalid Gobi response: missing or invalid jobs array');
            }

            const jobsData = statusData.result.jobs;
            jobsFound = jobsData.length;
            console.log(`Found ${jobsFound} jobs to import`);
            
            if (jobsFound === 0) {
              console.warn(`No jobs found in completed Gobi response for job ${job.id}`);
            }
              
            // Import jobs to the job_postings table
            for (const [index, jobData] of jobsData.entries()) {
              try {
                console.log(`Importing job ${index + 1}/${jobsFound}:`, {
                  title: jobData.title,
                  url: jobData.url,
                  equity: jobData.equity,
                  salary_range: jobData.salary_range,
                  investment_stage: jobData.investment_stage
                });

                // Validate required fields
                if (!jobData.title || !jobData.company || !jobData.description) {
                  console.error(`Skipping job ${index + 1} - missing required fields:`, {
                    title: !!jobData.title,
                    company: !!jobData.company,
                    description: !!jobData.description
                  });
                  continue;
                }

                // Ensure application_url is valid - prefer job-specific URL over careers page
                const careersUrl = job.career_page_sources?.url || '';
                const applicationUrl = jobData.url && jobData.url !== careersUrl && jobData.url.startsWith('http') 
                  ? jobData.url 
                  : careersUrl;

                console.log(`Using application URL: ${applicationUrl}`);

                const { error: insertError } = await supabase
                  .from('job_postings')
                  .insert({
                    title: jobData.title,
                    company: jobData.company || job.career_page_sources?.company_name || 'Unknown Company',
                    location: jobData.location || 'Location not specified',
                    type: jobData.type || 'Full-time',
                    salary: jobData.salary || 'Salary not specified',
                    description: jobData.description,
                    requirements: Array.isArray(jobData.requirements) ? jobData.requirements : [],
                    responsibilities: Array.isArray(jobData.responsibilities) ? jobData.responsibilities : [],
                    benefits: Array.isArray(jobData.benefits) ? jobData.benefits : [],
                    application_url: applicationUrl,
                    department: jobData.department || 'Other',
                    seniority_level: jobData.seniority_level || 'Mid-Level',
                    team_size: jobData.team_size || '1-10',
                    remote_onsite: jobData.remote_onsite || 'Onsite',
                    work_hours: jobData.work_hours || 'Fixed',
                    visa_sponsorship: jobData.visa_sponsorship || false,
                    equity: (jobData.equity && jobData.equity !== 'None') ? jobData.equity : null,
                    salary_range: (jobData.salary_range && jobData.salary_range !== 'Negotiable') ? jobData.salary_range : null,
                    investment_stage: (jobData.investment_stage && jobData.investment_stage !== 'Bootstrapped') ? jobData.investment_stage : null,
                    revenue_model: (jobData.revenue_model && jobData.revenue_model !== 'Other') ? jobData.revenue_model : null,
                    hiring_urgency: (jobData.hiring_urgency && jobData.hiring_urgency !== 'Open to Future Applicants') ? jobData.hiring_urgency : null,
                    source_url: careersUrl,
                    scraping_job_id: job.id,
                    scraped_at: new Date().toISOString(),
                    posted: new Date().toISOString(),
                    is_draft: true, // Mark as draft for review
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                    logo: '' // Will be filled later
                  });

                if (!insertError) {
                  jobsCreated++;
                  console.log(`Successfully imported job: ${jobData.title}`);
                } else {
                  console.error(`Error inserting job ${jobData.title}:`, insertError);
                }
              } catch (jobError) {
                console.error(`Error processing job ${index + 1} (${jobData.title}):`, jobError);
              }
            }
          } catch (parseError) {
            console.error(`Error parsing results for job ${job.id}:`, parseError);
            // Mark as failed if we can't parse the results
            await supabase
              .from('scraping_jobs')
              .update({
                status: 'failed',
                error_message: `Failed to parse Gobi results: ${parseError.message}`,
                completed_at: new Date().toISOString()
              })
              .eq('id', job.id);
            processedJobs++;
            continue;
          }

          console.log(`Successfully imported ${jobsCreated} jobs`);

          // Update the scraping job as completed
          await supabase
            .from('scraping_jobs')
            .update({
              status: 'completed',
              task_data: statusData,
              jobs_found: jobsFound,
              jobs_created: jobsCreated,
              completed_at: new Date().toISOString()
            })
            .eq('id', job.id);

          recoveredJobs++
          
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
