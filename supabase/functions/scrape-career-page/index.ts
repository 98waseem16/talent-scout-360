
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
  result?: JobData[];
  error_message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, companyName, scrapingJobId } = await req.json()

    if (!url) {
      throw new Error('URL is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update scraping job status to running
    await supabase
      .from('scraping_jobs')
      .update({ status: 'running' })
      .eq('id', scrapingJobId)

    console.log(`Starting to scrape: ${url}`)

    // Get Gobi.ai API key
    const gobiApiKey = Deno.env.get('GOBI_API_KEY')
    if (!gobiApiKey) {
      throw new Error('Gobi API key not configured')
    }

    // Define the structured output schema for job data
    const outputSchema = {
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
              url: { type: "string" },
              type: { type: "string" },
              salary: { type: "string" }
            },
            required: ["title"],
            additionalProperties: false
          }
        }
      },
      required: ["jobs"],
      additionalProperties: false
    }

    // Create detailed prompt for job extraction
    const prompt = `Visit the career page at ${url} and extract all job listings. 
    
    For each job posting found, extract:
    - title: The job title (required)
    - company: Company name (use "${companyName || 'from the website'}" if not found)
    - location: Job location (city, state, remote, etc.)
    - description: Brief job description or summary
    - url: Direct link to the job posting if available, otherwise use the career page URL
    - type: Employment type (Full-time, Part-time, Contract, Remote, Internship, etc.)
    - salary: Salary information if mentioned
    
    Return ONLY valid job postings, ignore navigation elements, headers, footers, or other non-job content.
    If no jobs are found, return an empty jobs array.
    
    Return the data as structured JSON matching the provided schema.`

    // Call Gobi.ai API with structured output
    const gobiResponse = await fetch('https://gobii.ai/api/v1/tasks/browser-use/', {
      method: 'POST',
      headers: {
        'X-Api-Key': gobiApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        output_schema: outputSchema,
        wait: 300 // Wait up to 5 minutes for completion
      })
    })

    if (!gobiResponse.ok) {
      throw new Error(`Gobi API error: ${gobiResponse.status} ${gobiResponse.statusText}`)
    }

    const gobiData: GobiResponse = await gobiResponse.json()
    console.log('Gobi response:', JSON.stringify(gobiData, null, 2))

    // Handle different response statuses
    if (gobiData.status === 'failed') {
      throw new Error(`Scraping failed: ${gobiData.error_message || 'Unknown error'}`)
    }

    if (gobiData.status === 'in_progress') {
      // Update job status to indicate it's still processing
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

    // Extract jobs from structured response
    let jobs: JobData[] = []
    if (gobiData.status === 'completed' && gobiData.result) {
      if (Array.isArray(gobiData.result)) {
        jobs = gobiData.result
      } else if (gobiData.result.jobs && Array.isArray(gobiData.result.jobs)) {
        jobs = gobiData.result.jobs
      }
    }

    console.log(`Found ${jobs.length} jobs`)

    // Process and save jobs to Supabase
    let jobsCreated = 0
    const createdJobs = []

    for (const job of jobs) {
      if (!job.title || job.title.trim() === '') continue // Skip jobs without titles

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
          is_draft: true, // Create as drafts for review
          posted: new Date().toISOString()
        }

        const { data: createdJob, error: insertError } = await supabase
          .from('job_postings')
          .insert(jobData)
          .select()
          .single()

        if (insertError) {
          console.error('Error inserting job:', insertError)
          continue
        }

        createdJobs.push(createdJob)
        jobsCreated++
      } catch (jobError) {
        console.error('Error processing job:', jobError)
        continue
      }
    }

    // Update scraping job with results
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'completed',
        jobs_found: jobs.length,
        jobs_created: jobsCreated,
        completed_at: new Date().toISOString()
      })
      .eq('id', scrapingJobId)

    // Update source last_scraped_at
    await supabase
      .from('career_page_sources')
      .update({ 
        last_scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('url', url)

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
    console.error('Scraping error:', error)

    // Update scraping job with error if scrapingJobId exists
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        const { scrapingJobId } = body

        if (scrapingJobId) {
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
          const supabase = createClient(supabaseUrl, supabaseKey)

          await supabase
            .from('scraping_jobs')
            .update({
              status: 'failed',
              error_message: error.message,
              completed_at: new Date().toISOString()
            })
            .eq('id', scrapingJobId)
        }
      } catch (updateError) {
        console.error('Error updating failed job:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        message: 'Scraping failed. Please check the URL and try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
