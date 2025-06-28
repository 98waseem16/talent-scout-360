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

    // Get configuration values
    const { data: config } = await supabaseClient
      .from('scraping_config')
      .select('key, value')
      .in('key', ['task_timeout_minutes', 'max_retries', 'circuit_breaker_threshold']);

    const defaultTimeoutMinutes = config?.find(c => c.key === 'task_timeout_minutes')?.value || 30;
    const maxRetries = config?.find(c => c.key === 'max_retries')?.value || 3;

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
      .or(`retry_count.is.null,retry_count.lt.${maxRetries}`) // Use dynamic max retries
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

        // Calculate timeout for this task
        const taskTimeoutMinutes = job.task_timeout_minutes || defaultTimeoutMinutes;
        const timeoutAt = new Date(Date.now() + taskTimeoutMinutes * 60 * 1000).toISOString();

        // Mark job as running with retry count and timeout
        await supabaseClient
          .from('scraping_jobs')
          .update({ 
            status: 'running',
            started_at: new Date().toISOString(),
            timeout_at: timeoutAt
          })
          .eq('id', job.id);

        // Create detailed prompt for Gobi API with the new comprehensive prompt
        const companyName = job.career_page_sources.company_name || 'Unknown Company';
        const careersUrl = job.career_page_sources.url;
        
        const prompt = `You are an expert web scraper. Visit ${careersUrl} and extract comprehensive job information using an adaptive approach.

MISSION: COMPREHENSIVE EXTRACTION of all job listings using the best available strategy.

ADAPTIVE EXTRACTION STRATEGY:
1. ANALYZE the career page structure and identify all job listings
2. ATTEMPT to visit individual job pages if they are accessible and contain additional detail
3. FALLBACK to extracting comprehensive information from the main careers page if individual pages are not accessible
4. EXTRACT the most complete information available regardless of the page structure

EXTRACTION APPROACH:
- First, scan the main career page and identify ALL job listing opportunities
- Try to access individual job detail pages where links are available and functional
- If individual job pages are not accessible or don't provide additional details, extract comprehensive information from the main page
- Look for expandable sections, additional details, and comprehensive information wherever it's available
- Focus on gathering complete job information rather than following a rigid extraction path

REQUIRED JSON OUTPUT STRUCTURE:
{
  "jobs": [
    {
      "title": "Complete job title",
      "company": "Extract from website",
      "location": "Detailed location (city, state, country, remote options)",
      "description": "Comprehensive job description with all available details",
      "responsibilities": [
        "Extract all key responsibilities and duties",
        "Include day-to-day activities and expectations",
        "Capture growth and learning opportunities"
      ],
      "requirements": [
        "Extract all required qualifications", 
        "Include education, experience, technical skills",
        "Separate must-have from nice-to-have requirements"
      ],
      "benefits": [
        "Extract comprehensive benefits package",
        "Include health, dental, vision, retirement",
        "Capture perks, vacation, professional development",
        "Include equity, bonuses, and compensation details"
      ],
      "url": "Direct link to individual job posting or main careers page",
      "type": "EXACTLY one of: Full-time|Part-time|Contract|Remote",
      "salary": "Detailed salary information if available",
      "department": "EXACTLY one of: Engineering|Sales|Marketing|Product|Design|Operations|HR|Finance|Legal|Customer Support|Other",
      "seniority_level": "EXACTLY one of: Entry-Level|Junior|Mid-Level|Senior|Lead|Principal|Director|VP|C-Level|Internship|Who Cares",
      "team_size": "EXACTLY one of: 1-10|11-50|51-200|201-500|500+",
      "remote_onsite": "EXACTLY one of: Fully Remote|Hybrid|Onsite",
      "work_hours": "EXACTLY one of: Flexible|Fixed|Async Work",
      "visa_sponsorship": true/false,
      "equity": "EXACTLY one of: None|0.1%-0.5%|0.5%-1%|1%+ (use 'None' if equity compensation is not specified, not available, or not mentioned)",
      "salary_range": "EXACTLY one of: Negotiable|$40K-$60K|$60K-$80K|$80K-$120K|$120K+",
      "investment_stage": "EXACTLY one of: Bootstrapped|Pre-Seed|Seed|Series A|Series B|Series C+|Pre-IPO|Public",
      "revenue_model": "EXACTLY one of: Subscription|Marketplace|SaaS|Enterprise|Ads|E-commerce|Other",
      "hiring_urgency": "EXACTLY one of: Immediate Hire|Within a Month|Open to Future Applicants"
    }
  ]
}

CRITICAL FIELD EXTRACTION RULES:
- type: Must be exactly one of: "Full-time", "Part-time", "Contract", "Remote" (normalize variations like "Full time" → "Full-time")
- department: Map job functions intelligently (Software Engineer → "Engineering", Support → "Customer Support"). If unclear, use "Other"
- seniority_level: Extract from titles and job descriptions. Use "Entry-Level" for entry positions, "Mid-Level" for mid positions
- team_size: Estimate based on company info or descriptions. If unknown, use "1-10" for startups, "11-50" for small companies
- remote_onsite: Use "Fully Remote" for remote work, "Onsite" for office-based, "Hybrid" for mixed
- work_hours: Use "Flexible" if flexible hours mentioned, "Fixed" for standard hours, "Async Work" for async-friendly roles
- equity: CRITICAL - Must return exactly one of: "None", "0.1%-0.5%", "0.5%-1%", "1%+"
  * If equity is not mentioned, not specified, or not available → use "None"
  * If equity mentions small percentages (0.1-0.5%) → use "0.1%-0.5%"
  * If equity mentions medium percentages (0.5-1%) → use "0.5%-1%"
  * If equity mentions higher percentages (1%+) → use "1%+"
  * Examples: "equity package available" → "None", "0.25% equity" → "0.1%-0.5%", "up to 2%" → "1%+"
- salary_range: Estimate based on salary info. If no salary info, use "Negotiable"
- investment_stage: Research company stage. If unknown, use "Bootstrapped" for small companies
- revenue_model: Determine from company description. If unclear, use "Other"
- hiring_urgency: Use "Immediate Hire" for urgent roles, "Within a Month" for standard hiring, "Open to Future Applicants" as default
- responsibilities/requirements/benefits: Extract from all available sections
- Look for expandable content sections and extract details where available

VALIDATION REQUIREMENTS:
- Every field must use EXACTLY the specified values - no variations allowed
- If unsure about a constrained field value, prefer "Other" where available, otherwise use the most conservative option
- Every job MUST have title and comprehensive description
- Extract comprehensive information from whatever source is available (main page or individual pages)
- Skip navigation elements, headers, footer content
- Focus on job-specific content only

ADAPTIVE EXTRACTION RULES:
- Prioritize extracting complete job information over rigid page navigation requirements
- Use the best available source of information (main page comprehensive listings vs individual pages)
- Extract detailed information from expandable sections where available
- Include company culture and growth opportunity details when present
- Focus on data quality and completeness rather than specific extraction methodology

Return ONLY the JSON structure with comprehensive job data. Extract the most complete information available using the most effective strategy for the specific career page structure.`;

        // Prepare Gobi API payload with updated output schema
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
                    company: { type: "string" },
                    location: { type: "string" },
                    description: { type: "string" },
                    responsibilities: { type: "array", items: { type: "string" } },
                    requirements: { type: "array", items: { type: "string" } },
                    benefits: { type: "array", items: { type: "string" } },
                    url: { type: "string" },
                    type: { type: "string", enum: ["Full-time", "Part-time", "Contract", "Remote"] },
                    salary: { type: "string" },
                    department: { type: "string", enum: ["Engineering", "Sales", "Marketing", "Product", "Design", "Operations", "HR", "Finance", "Legal", "Customer Support", "Other"] },
                    seniority_level: { type: "string", enum: ["Entry-Level", "Junior", "Mid-Level", "Senior", "Lead", "Principal", "Director", "VP", "C-Level", "Internship", "Who Cares"] },
                    team_size: { type: "string", enum: ["1-10", "11-50", "51-200", "201-500", "500+"] },
                    remote_onsite: { type: "string", enum: ["Fully Remote", "Hybrid", "Onsite"] },
                    work_hours: { type: "string", enum: ["Flexible", "Fixed", "Async Work"] },
                    visa_sponsorship: { type: "boolean" },
                    equity: { type: "string", enum: ["None", "0.1%-0.5%", "0.5%-1%", "1%+"] },
                    salary_range: { type: "string", enum: ["Negotiable", "$40K-$60K", "$60K-$80K", "$80K-$120K", "$120K+"] },
                    investment_stage: { type: "string", enum: ["Bootstrapped", "Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Pre-IPO", "Public"] },
                    revenue_model: { type: "string", enum: ["Subscription", "Marketplace", "SaaS", "Enterprise", "Ads", "E-commerce", "Other"] },
                    hiring_urgency: { type: "string", enum: ["Immediate Hire", "Within a Month", "Open to Future Applicants"] }
                  },
                  required: ["title", "company", "location", "description", "type", "department", "seniority_level", "team_size", "remote_onsite", "work_hours", "visa_sponsorship", "equity", "salary_range", "investment_stage", "revenue_model", "hiring_urgency"]
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
                      company: jobData.company || companyName,
                      location: jobData.location || 'Location not specified',
                      type: jobData.type || 'Full-time',
                      salary: jobData.salary || 'Salary not specified',
                      description: jobData.description || 'No description available',
                      requirements: jobData.requirements || [],
                      responsibilities: jobData.responsibilities || [],
                      benefits: jobData.benefits || [],
                      application_url: jobData.url || careersUrl,
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
            
          // Note: The polling function will handle completion checking
          
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
