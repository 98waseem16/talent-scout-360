
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();
  let polledTasks = 0;
  let completedTasks = 0;
  let failedTasks = 0;

  try {
    console.log('=== POLLING GOBI TASKS ===');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const gobiApiKey = Deno.env.get('GOBI_API_KEY');
    if (!gobiApiKey) {
      throw new Error('GOBI_API_KEY not configured');
    }

    // Get configuration values
    const { data: config } = await supabaseClient
      .from('scraping_config')
      .select('key, value')
      .in('key', ['poll_interval_seconds', 'gobi_api_timeout_seconds']);

    const pollInterval = config?.find(c => c.key === 'poll_interval_seconds')?.value || 120;
    const apiTimeout = config?.find(c => c.key === 'gobi_api_timeout_seconds')?.value || 60;

    // Find running tasks that need status polling (older than poll interval)
    const pollThreshold = new Date(Date.now() - pollInterval * 1000).toISOString();
    
    const { data: runningTasks, error: fetchError } = await supabaseClient
      .from('scraping_jobs')
      .select(`
        *,
        career_page_sources!inner(url, company_name)
      `)
      .eq('status', 'running')
      .not('gobi_task_id', 'is', null)
      .or(`last_polled_at.is.null,last_polled_at.lt.${pollThreshold}`)
      .order('started_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('Error fetching running tasks:', fetchError);
      throw fetchError;
    }

    if (!runningTasks || runningTasks.length === 0) {
      console.log('No running tasks need polling');
      return new Response(JSON.stringify({ 
        message: 'No tasks to poll', 
        polledTasks: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${runningTasks.length} running tasks to poll`);

    // Poll each task status from Gobi
    for (const task of runningTasks) {
      try {
        console.log(`Polling task ${task.id} with Gobi task ID: ${task.gobi_task_id}`);
        
        const pollStartTime = Date.now();
        
        // Poll Gobi API for task status
        const gobiResponse = await fetch(`https://gobii.ai/api/v1/tasks/browser-use/${task.gobi_task_id}/result/`, {
          method: 'GET',
          headers: {
            'X-Api-Key': gobiApiKey,
            'User-Agent': 'Supabase-Function/1.0'
          },
          signal: AbortSignal.timeout(apiTimeout * 1000),
        });

        const responseTime = Date.now() - pollStartTime;
        const responseText = await gobiResponse.text();
        
        console.log(`Gobi poll response for task ${task.id}: ${gobiResponse.status}`);

        // Update last polled timestamp
        await supabaseClient
          .from('scraping_jobs')
          .update({ 
            last_polled_at: new Date().toISOString(),
            gobi_status_checked_at: new Date().toISOString()
          })
          .eq('id', task.id);

        let gobiResult;
        try {
          gobiResult = JSON.parse(responseText);
        } catch (e) {
          console.error(`Invalid JSON response for task ${task.id}:`, responseText);
          continue;
        }

        // Log status check to history
        await supabaseClient
          .from('task_status_history')
          .insert({
            scraping_job_id: task.id,
            status: gobiResult.status || 'unknown',
            gobi_response: gobiResult,
            response_time_ms: responseTime
          });

        if (gobiResult.status === 'completed') {
          console.log(`Task ${task.id} completed, processing results`);
          
          let jobsCreated = 0;
          let jobsFound = 0;

          if (gobiResult.result && gobiResult.result.jobs) {
            const jobsData = gobiResult.result.jobs;
            jobsFound = jobsData.length;
            
            // Create job postings from the scraped data
            for (const jobData of jobsData) {
              try {
                const { error: insertError } = await supabaseClient
                  .from('job_postings')
                  .insert({
                    title: jobData.title || 'Untitled Position',
                    company: jobData.company || task.career_page_sources.company_name,
                    location: jobData.location || 'Location not specified',
                    type: jobData.type || 'Full-time',
                    salary: jobData.salary || 'Salary not specified',
                    description: jobData.description || 'No description available',
                    requirements: jobData.requirements || [],
                    responsibilities: jobData.responsibilities || [],
                    benefits: jobData.benefits || [],
                    application_url: jobData.url || task.career_page_sources.url,
                    department: jobData.department || 'Other',
                    seniority_level: jobData.seniority_level || 'Mid-Level',
                    team_size: jobData.team_size || '1-10',
                    remote_onsite: jobData.remote_onsite || 'Onsite',
                    work_hours: jobData.work_hours || 'Fixed',
                    visa_sponsorship: jobData.visa_sponsorship || false,
                    equity: jobData.equity || 'None',
                    salary_range: jobData.salary_range || 'Negotiable',
                    investment_stage: jobData.investment_stage || 'Bootstrapped',
                    revenue_model: jobData.revenue_model || 'Other',
                    hiring_urgency: jobData.hiring_urgency || 'Open to Future Applicants',
                    source_url: task.career_page_sources.url,
                    scraping_job_id: task.id,
                    scraped_at: new Date().toISOString(),
                    is_draft: true,
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    logo: ''
                  });

                if (!insertError) {
                  jobsCreated++;
                }
              } catch (jobError) {
                console.error(`Error creating job from task ${task.id}:`, jobError);
              }
            }
          }

          // Mark task as completed
          await supabaseClient
            .from('scraping_jobs')
            .update({
              status: 'completed',
              task_data: gobiResult,
              jobs_found: jobsFound,
              jobs_created: jobsCreated,
              completed_at: new Date().toISOString()
            })
            .eq('id', task.id);

          completedTasks++;
          console.log(`Task ${task.id} completed: ${jobsCreated}/${jobsFound} jobs created`);

        } else if (gobiResult.status === 'failed') {
          console.log(`Task ${task.id} failed`);
          
          await supabaseClient
            .from('scraping_jobs')
            .update({
              status: 'failed',
              task_data: gobiResult,
              error_message: gobiResult.error || 'Task failed in Gobi',
              completed_at: new Date().toISOString()
            })
            .eq('id', task.id);

          failedTasks++;

        } else if (gobiResult.status === 'in_progress') {
          console.log(`Task ${task.id} still in progress`);
          // Task is still running, just update the polling timestamp
          
        } else {
          console.log(`Task ${task.id} has unknown status: ${gobiResult.status}`);
        }

        polledTasks++;

      } catch (error) {
        console.error(`Error polling task ${task.id}:`, error);
        
        // Log error to history
        await supabaseClient
          .from('task_status_history')
          .insert({
            scraping_job_id: task.id,
            status: 'poll_error',
            gobi_response: { error: error.message },
            response_time_ms: null
          });
      }

      // Small delay between polls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const processingTime = Date.now() - startTime;
    console.log(`Task polling completed. Polled: ${polledTasks}, Completed: ${completedTasks}, Failed: ${failedTasks}, Time: ${processingTime}ms`);

    return new Response(JSON.stringify({ 
      message: 'Task polling completed',
      polledTasks,
      completedTasks,
      failedTasks,
      processingTime
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Task polling error:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
