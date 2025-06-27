
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();
  let processed = 0;
  let failed = 0;
  let queueSize = 0;

  try {
    console.log('=== PROCESSING SCRAPING QUEUE ===');
    
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

    // Get total queue size for monitoring
    const { count: totalPending } = await supabaseClient
      .from('scraping_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    queueSize = totalPending || 0;
    console.log(`Total pending jobs in queue: ${queueSize}`);

    // Get pending scraping jobs ordered by priority and creation time with exponential backoff
    const { data: pendingJobs, error: fetchError } = await supabaseClient
      .from('scraping_jobs')
      .select(`
        *,
        career_page_sources!inner(url, company_name)
      `)
      .eq('status', 'pending')
      .or(`retry_count.is.null,retry_count.lt.${3}`) // Only jobs that haven't exceeded max retries
      .order('priority', { ascending: false })
      .order('started_at', { ascending: true })
      .limit(3); // Reduced batch size for better reliability

    if (fetchError) {
      console.error('Error fetching pending jobs:', fetchError);
      throw fetchError;
    }

    if (!pendingJobs || pendingJobs.length === 0) {
      console.log('No pending jobs found');
      
      // Record monitoring data
      await supabaseClient
        .from('queue_monitoring')
        .insert({
          processed_jobs: 0,
          failed_jobs: 0,
          queue_size: queueSize,
          processing_time_ms: Date.now() - startTime,
          trigger_source: 'cron'
        });

      return new Response(JSON.stringify({ message: 'No pending jobs', processed: 0, queueSize }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${pendingJobs.length} pending jobs to process`);

    // Process each job with enhanced error handling
    for (const job of pendingJobs) {
      try {
        console.log(`Processing job ${job.id} for URL: ${job.career_page_sources.url}`);

        // Check if job should be delayed due to exponential backoff
        const retryCount = job.retry_count || 0;
        if (retryCount > 0) {
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 300000); // Max 5 min delay
          const timeSinceLastAttempt = Date.now() - new Date(job.started_at).getTime();
          
          if (timeSinceLastAttempt < backoffDelay) {
            console.log(`Job ${job.id} in backoff period, skipping for now`);
            continue;
          }
        }

        // Mark job as running with retry count
        await supabaseClient
          .from('scraping_jobs')
          .update({ 
            status: 'running',
            started_at: new Date().toISOString()
          })
          .eq('id', job.id);

        // Create detailed prompt for Gobi API
        const companyName = job.career_page_sources.company_name || 'Unknown Company';
        const careersUrl = job.career_page_sources.url;
        
        const prompt = `Please scrape the career page at ${careersUrl} for ${companyName}. 

Extract all job listings and return them as a JSON array. For each job, extract:
- title: Job title
- location: Job location (city, state, country or "Remote")
- type: Employment type (Full-time, Part-time, Contract, Internship)
- salary: Salary range if available
- description: Job description
- requirements: List of requirements/qualifications
- responsibilities: List of key responsibilities
- benefits: List of benefits if mentioned
- application_url: Direct link to apply for the job
- department: Department or team if specified
- seniority_level: Experience level (Entry, Mid, Senior, Executive)

Navigate through pagination if there are multiple pages of jobs. Click on individual job listings to get detailed information when needed.

Return the data in this exact JSON format:
{
  "jobs": [
    {
      "title": "Software Engineer",
      "location": "San Francisco, CA",
      "type": "Full-time",
      "salary": "$120,000 - $180,000",
      "description": "Job description here...",
      "requirements": ["Requirement 1", "Requirement 2"],
      "responsibilities": ["Responsibility 1", "Responsibility 2"],
      "benefits": ["Benefit 1", "Benefit 2"],
      "application_url": "https://...",
      "department": "Engineering",
      "seniority_level": "Mid"
    }
  ]
}`;

        // Prepare Gobi API payload
        const gobiPayload = {
          prompt: prompt,
          wait: 120, // Wait up to 2 minutes for synchronous response
          output_schema: {
            type: "object",
            properties: {
              jobs: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    location: { type: "string" },
                    type: { type: "string" },
                    salary: { type: "string" },
                    description: { type: "string" },
                    requirements: { type: "array", items: { type: "string" } },
                    responsibilities: { type: "array", items: { type: "string" } },
                    benefits: { type: "array", items: { type: "string" } },
                    application_url: { type: "string" },
                    department: { type: "string" },
                    seniority_level: { type: "string" }
                  },
                  required: ["title", "location", "type", "description"]
                }
              }
            },
            required: ["jobs"],
            additionalProperties: false
          }
        };

        console.log('Submitting to Gobi with URL:', careersUrl);

        const gobiResponse = await fetch('https://gobii.ai/api/v1/tasks/browser-use/', {
          method: 'POST',
          headers: {
            'X-Api-Key': gobiApiKey,
            'Content-Type': 'application/json',
            'User-Agent': 'Supabase-Function/1.0'
          },
          body: JSON.stringify(gobiPayload),
        });

        const responseText = await gobiResponse.text();
        console.log(`Gobi API Response Status: ${gobiResponse.status}`);
        console.log(`Gobi API Response: ${responseText}`);

        if (!gobiResponse.ok) {
          throw new Error(`Gobi API error: ${gobiResponse.status} ${gobiResponse.statusText} - ${responseText}`);
        }

        let gobiResult;
        try {
          gobiResult = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`Invalid JSON response from Gobi: ${responseText}`);
        }

        console.log(`Gobi task created for job ${job.id}:`, gobiResult.id);

        // Handle both synchronous and asynchronous responses
        if (gobiResult.status === 'completed') {
          // Synchronous completion - process the results immediately
          console.log(`Job ${job.id} completed synchronously`);
          
          let jobsData = [];
          let jobsFound = 0;
          let jobsCreated = 0;

          try {
            if (gobiResult.result && gobiResult.result.jobs) {
              jobsData = gobiResult.result.jobs;
              jobsFound = jobsData.length;
              
              // Create job postings from the scraped data
              for (const jobData of jobsData) {
                try {
                  const { error: insertError } = await supabaseClient
                    .from('job_postings')
                    .insert({
                      title: jobData.title || 'Untitled Position',
                      company: companyName,
                      location: jobData.location || 'Location not specified',
                      type: jobData.type || 'Full-time',
                      salary: jobData.salary || 'Salary not specified',
                      description: jobData.description || 'No description available',
                      requirements: jobData.requirements || [],
                      responsibilities: jobData.responsibilities || [],
                      benefits: jobData.benefits || [],
                      application_url: jobData.application_url || careersUrl,
                      department: jobData.department || null,
                      seniority_level: jobData.seniority_level || null,
                      source_url: careersUrl,
                      scraping_job_id: job.id,
                      scraped_at: new Date().toISOString(),
                      is_draft: true, // Mark as draft for review
                      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                      logo: '' // Will be filled later
                    });

                  if (!insertError) {
                    jobsCreated++;
                  } else {
                    console.error(`Error inserting job ${jobData.title}:`, insertError);
                  }
                } catch (jobError) {
                  console.error(`Error processing job ${jobData.title}:`, jobError);
                }
              }
            }
          } catch (parseError) {
            console.error(`Error parsing Gobi result for job ${job.id}:`, parseError);
          }

          // Update job as completed
          await supabaseClient
            .from('scraping_jobs')
            .update({
              status: 'completed',
              gobi_task_id: gobiResult.id,
              task_data: gobiResult,
              jobs_found: jobsFound,
              jobs_created: jobsCreated,
              completed_at: new Date().toISOString(),
              retry_count: 0
            })
            .eq('id', job.id);

          console.log(`Job ${job.id} completed: ${jobsCreated}/${jobsFound} jobs created`);
          
        } else if (gobiResult.status === 'in_progress') {
          // Asynchronous processing - store task ID for later polling
          console.log(`Job ${job.id} is processing asynchronously`);
          
          await supabaseClient
            .from('scraping_jobs')
            .update({
              gobi_task_id: gobiResult.id,
              task_data: gobiResult,
              retry_count: 0
            })
            .eq('id', job.id);
            
          // Note: We'll need a separate function to poll for completion
          // For now, we'll leave the job in 'running' status
          
        } else {
          throw new Error(`Unexpected Gobi status: ${gobiResult.status}`);
        }

        processed++;
        console.log(`Successfully processed job ${job.id}`);

      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        failed++;
        
        // Enhanced retry logic with exponential backoff
        const newRetryCount = (job.retry_count || 0) + 1;
        const maxRetries = job.max_retries || 3;
        const shouldFail = newRetryCount >= maxRetries;
        
        await supabaseClient
          .from('scraping_jobs')
          .update({
            status: shouldFail ? 'failed' : 'pending',
            retry_count: newRetryCount,
            error_message: shouldFail ? error.message : `Retry ${newRetryCount}/${maxRetries}: ${error.message}`,
            completed_at: shouldFail ? new Date().toISOString() : null
          })
          .eq('id', job.id);

        if (shouldFail) {
          console.log(`Job ${job.id} failed permanently after ${newRetryCount} retries`);
        } else {
          console.log(`Job ${job.id} will be retried (attempt ${newRetryCount}/${maxRetries})`);
        }
      }

      // Rate limiting: small delay between submissions
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Record monitoring data
    const processingTime = Date.now() - startTime;
    await supabaseClient
      .from('queue_monitoring')
      .insert({
        processed_jobs: processed,
        failed_jobs: failed,
        queue_size: queueSize,
        processing_time_ms: processingTime,
        trigger_source: 'cron'
      });

    console.log(`Queue processing completed. Processed: ${processed}/${pendingJobs.length}, Failed: ${failed}, Queue Size: ${queueSize}, Time: ${processingTime}ms`);

    return new Response(JSON.stringify({ 
      message: 'Queue processed', 
      processed,
      failed,
      total: pendingJobs.length,
      queueSize,
      processingTime
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Queue processing error:', error);
    
    // Record error in monitoring
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabaseClient
        .from('queue_monitoring')
        .insert({
          processed_jobs: processed,
          failed_jobs: failed + 1,
          queue_size: queueSize,
          processing_time_ms: Date.now() - startTime,
          trigger_source: 'cron'
        });
    } catch (monitoringError) {
      console.error('Failed to record monitoring data:', monitoringError);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
