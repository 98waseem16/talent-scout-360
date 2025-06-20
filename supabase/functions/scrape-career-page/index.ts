
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobData {
  title: string;
  company: string;
  location?: string;
  description?: string;
  url?: string;
  type?: string;
  salary?: string;
}

interface GobiResponse {
  id: string;
  status: 'completed' | 'failed' | 'in_progress';
  result?: any;
  error_message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let scrapingJobId = null;

  try {
    const { url, companyName, scrapingJobId: jobId } = await req.json()
    scrapingJobId = jobId;

    console.log('=== SCRAPING REQUEST START ===');
    console.log('URL:', url);
    console.log('Company Name:', companyName);
    console.log('Scraping Job ID:', scrapingJobId);

    if (!url) {
      throw new Error('URL is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Supabase client initialized');

    // Update scraping job status to running
    console.log('Updating scraping job status to running...');
    const { error: updateError } = await supabase
      .from('scraping_jobs')
      .update({ status: 'running' })
      .eq('id', scrapingJobId)

    if (updateError) {
      console.error('Error updating scraping job status:', updateError);
      throw new Error(`Failed to update job status: ${updateError.message}`);
    }

    console.log('Scraping job status updated successfully');

    // Get Gobi.ai API key
    const gobiApiKey = Deno.env.get('GOBI_API_KEY')
    console.log('Gobi API key exists:', !!gobiApiKey);
    console.log('Gobi API key length:', gobiApiKey?.length || 0);

    if (!gobiApiKey) {
      throw new Error('Gobi API key not configured')
    }

    // Create detailed prompt for job extraction
    const prompt = `Please visit the career page at ${url} and extract all job listings.

For each job posting found, extract the following information:
- title: The job title (required)
- company: Company name (use "${companyName || 'from the website'}" if not found)
- location: Job location (city, state, remote, etc.)
- description: Brief job description or summary
- url: Direct link to the job posting if available, otherwise use the career page URL
- type: Employment type (Full-time, Part-time, Contract, Remote, Internship, etc.)
- salary: Salary information if mentioned

Return ONLY valid job postings. Ignore navigation elements, headers, footers, or other non-job content.
If no jobs are found, return an empty jobs array.

Please return the data in this exact JSON format:
{
  "jobs": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "Location",
      "description": "Job description",
      "url": "Job URL",
      "type": "Job Type",
      "salary": "Salary info"
    }
  ]
}`;

    console.log('Calling Gobi.ai API...');
    console.log('Prompt length:', prompt.length);

    // Call Gobi.ai API
    const gobiResponse = await fetch('https://gobii.ai/api/v1/tasks/browser-use/', {
      method: 'POST',
      headers: {
        'X-Api-Key': gobiApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        wait: 120 // Reduced from 300 to 120 seconds (2 minutes)
      })
    })

    console.log('Gobi API response status:', gobiResponse.status);
    console.log('Gobi API response headers:', Object.fromEntries(gobiResponse.headers.entries()));

    if (!gobiResponse.ok) {
      const errorText = await gobiResponse.text();
      console.error('Gobi API error response:', errorText);
      throw new Error(`Gobi API error: ${gobiResponse.status} ${gobiResponse.statusText} - ${errorText}`)
    }

    const gobiData: GobiResponse = await gobiResponse.json()
    console.log('=== GOBI API RESPONSE ===');
    console.log('Response status:', gobiData.status);
    console.log('Response ID:', gobiData.id);
    console.log('Full response:', JSON.stringify(gobiData, null, 2));

    // Handle different response statuses
    if (gobiData.status === 'failed') {
      console.error('Gobi scraping failed:', gobiData.error_message);
      throw new Error(`Scraping failed: ${gobiData.error_message || 'Unknown error'}`)
    }

    if (gobiData.status === 'in_progress') {
      console.log('Scraping still in progress, updating job status...');
      await supabase
        .from('scraping_jobs')
        .update({
          status: 'running',
          error_message: 'Scraping is taking longer than expected. Please check back later.'
        })
        .eq('id', scrapingJobId)

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Scraping is still in progress. Please check the recent jobs list for updates.',
          status: 'in_progress'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Extract jobs from response - handle multiple possible formats
    let jobs: JobData[] = []
    console.log('=== EXTRACTING JOBS FROM RESPONSE ===');
    
    if (gobiData.status === 'completed' && gobiData.result) {
      console.log('Gobi result type:', typeof gobiData.result);
      console.log('Gobi result structure:', JSON.stringify(gobiData.result, null, 2));

      // Try different extraction methods
      if (Array.isArray(gobiData.result)) {
        console.log('Result is array, using directly');
        jobs = gobiData.result;
      } else if (gobiData.result.jobs && Array.isArray(gobiData.result.jobs)) {
        console.log('Result has jobs array property');
        jobs = gobiData.result.jobs;
      } else if (typeof gobiData.result === 'string') {
        console.log('Result is string, attempting to parse JSON');
        try {
          const parsed = JSON.parse(gobiData.result);
          if (Array.isArray(parsed)) {
            jobs = parsed;
          } else if (parsed.jobs && Array.isArray(parsed.jobs)) {
            jobs = parsed.jobs;
          }
        } catch (parseError) {
          console.error('Failed to parse result string as JSON:', parseError);
        }
      } else if (gobiData.result.content) {
        console.log('Result has content property, checking structure');
        try {
          const content = typeof gobiData.result.content === 'string' 
            ? JSON.parse(gobiData.result.content) 
            : gobiData.result.content;
          
          if (Array.isArray(content)) {
            jobs = content;
          } else if (content.jobs && Array.isArray(content.jobs)) {
            jobs = content.jobs;
          }
        } catch (parseError) {
          console.error('Failed to parse content:', parseError);
        }
      }
    }

    console.log('=== JOBS EXTRACTION COMPLETE ===');
    console.log('Total jobs found:', jobs.length);
    if (jobs.length > 0) {
      console.log('First job sample:', JSON.stringify(jobs[0], null, 2));
    }

    // Process and save jobs to Supabase
    let jobsCreated = 0
    const createdJobs = []

    console.log('=== PROCESSING JOBS FOR DATABASE ===');

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      console.log(`Processing job ${i + 1}/${jobs.length}:`, job.title || 'No title');

      if (!job.title || job.title.trim() === '') {
        console.log(`Skipping job ${i + 1}: No title`);
        continue;
      }

      try {
        const jobData = {
          title: job.title.trim(),
          company: job.company?.trim() || companyName || new URL(url).hostname,
          location: job.location?.trim() || '',
          description: job.description?.trim() || '',
          salary: job.salary?.trim() || '',
          type: job.type?.trim() || 'Full-time',
          responsibilities: [],
          requirements: [],
          benefits: [],
          logo: '/placeholder.svg',
          application_url: job.url?.trim() || url,
          source_url: url,
          scraped_at: new Date().toISOString(),
          scraping_job_id: scrapingJobId,
          is_draft: true,
          posted: new Date().toISOString()
        }

        console.log(`Inserting job ${i + 1} into database...`);
        const { data: createdJob, error: insertError } = await supabase
          .from('job_postings')
          .insert(jobData)
          .select()
          .single()

        if (insertError) {
          console.error(`Error inserting job ${i + 1}:`, insertError);
          continue
        }

        console.log(`Job ${i + 1} inserted successfully with ID:`, createdJob.id);
        createdJobs.push(createdJob)
        jobsCreated++
      } catch (jobError) {
        console.error(`Error processing job ${i + 1}:`, jobError);
        continue
      }
    }

    console.log('=== DATABASE OPERATIONS COMPLETE ===');
    console.log('Jobs created:', jobsCreated);

    // Update scraping job with results
    console.log('Updating scraping job with final results...');
    const { error: finalUpdateError } = await supabase
      .from('scraping_jobs')
      .update({
        status: 'completed',
        jobs_found: jobs.length,
        jobs_created: jobsCreated,
        completed_at: new Date().toISOString()
      })
      .eq('id', scrapingJobId)

    if (finalUpdateError) {
      console.error('Error updating final job status:', finalUpdateError);
    }

    // Update source last_scraped_at
    console.log('Updating source last_scraped_at...');
    const { error: sourceUpdateError } = await supabase
      .from('career_page_sources')
      .update({ 
        last_scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('url', url)

    if (sourceUpdateError) {
      console.error('Error updating source:', sourceUpdateError);
    }

    console.log('=== SCRAPING COMPLETE ===');
    console.log('Success! Jobs found:', jobs.length, 'Jobs created:', jobsCreated);

    return new Response(
      JSON.stringify({
        success: true,
        jobs: createdJobs,
        jobsFound: jobs.length,
        jobsCreated: jobsCreated,
        message: `Successfully scraped ${jobs.length} jobs and created ${jobsCreated} job drafts.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('=== SCRAPING ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);

    // Update scraping job with error if scrapingJobId exists
    if (scrapingJobId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        console.log('Updating scraping job with error status...');
        const { error: updateError } = await supabase
          .from('scraping_jobs')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', scrapingJobId)

        if (updateError) {
          console.error('Error updating failed job status:', updateError);
        }
      } catch (updateError) {
        console.error('Error updating failed job:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        message: 'Scraping failed. Please check the logs and try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
