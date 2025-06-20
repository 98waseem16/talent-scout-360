
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

    // Call Gobi.ai API (you'll need to add your Gobi API key as a secret)
    const gobiApiKey = Deno.env.get('GOBI_API_KEY')
    if (!gobiApiKey) {
      throw new Error('Gobi API key not configured')
    }

    const gobiResponse = await fetch('https://api.gobi.ai/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gobiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        prompt: `Extract job listings from this career page. Return a JSON array where each job has these fields: title (required), company, location, description, url (direct link to job), type (Full-time/Part-time/Contract), salary. Only return valid job postings, ignore navigation elements, headers, footers. Return clean, structured data as JSON array.`,
        format: 'json'
      })
    })

    if (!gobiResponse.ok) {
      throw new Error(`Gobi API error: ${gobiResponse.statusText}`)
    }

    const gobiData = await gobiResponse.json()
    let jobs: JobData[] = []

    try {
      // Parse the JSON response from Gobi
      jobs = Array.isArray(gobiData.data) ? gobiData.data : JSON.parse(gobiData.data || '[]')
    } catch (parseError) {
      console.error('Failed to parse Gobi response:', parseError)
      jobs = []
    }

    console.log(`Found ${jobs.length} jobs`)

    // Process and save jobs to Supabase
    let jobsCreated = 0
    const createdJobs = []

    for (const job of jobs) {
      if (!job.title) continue // Skip jobs without titles

      try {
        const jobData = {
          title: job.title,
          company: job.company || companyName || new URL(url).hostname,
          location: job.location || '',
          description: job.description || '',
          salary: job.salary || '',
          type: job.type || 'Full-time',
          responsibilities: [],
          requirements: [],
          benefits: [],
          logo: '/placeholder.svg',
          application_url: job.url || url,
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
        jobsCreated: jobsCreated
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
