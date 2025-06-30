
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GobiWebhookPayload {
  task_id: string;
  status: 'completed' | 'failed';
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const payload: GobiWebhookPayload = await req.json()
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2))

    // Find the scraping job by Gobi task ID
    const { data: scrapingJob, error: findError } = await supabase
      .from('scraping_jobs')
      .select(`
        *,
        career_page_sources(url, company_name)
      `)
      .eq('gobi_task_id', payload.task_id)
      .single()

    if (findError) {
      console.error('Error finding scraping job:', findError)
      return new Response('Scraping job not found', { 
        status: 404, 
        headers: corsHeaders 
      })
    }

    console.log('Found scraping job:', scrapingJob.id)

    // PHASE 2: Implement processing lock to prevent race conditions
    const lockId = `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Try to acquire processing lock
    const { data: lockResult, error: lockError } = await supabase
      .from('scraping_jobs')
      .update({
        processing_locked_at: new Date().toISOString(),
        processing_locked_by: lockId
      })
      .eq('id', scrapingJob.id)
      .is('processing_locked_at', null) // Only update if not already locked
      .select()

    if (lockError || !lockResult || lockResult.length === 0) {
      console.log('Job already being processed by another function, skipping')
      return new Response('Job already being processed', { 
        status: 200, 
        headers: corsHeaders 
      })
    }

    console.log('Acquired processing lock:', lockId)

    // Update job status based on webhook result
    if (payload.status === 'completed' && payload.result?.jobs) {
      const jobs = payload.result.jobs
      console.log(`Processing ${jobs.length} jobs from webhook`)

      // PHASE 2: Idempotency check - verify no jobs already exist for this scraping job
      const { data: existingJobs, error: existingError } = await supabase
        .from('job_postings')
        .select('id')
        .eq('scraping_job_id', scrapingJob.id)

      if (existingError) {
        console.error('Error checking existing jobs:', existingError)
      } else if (existingJobs && existingJobs.length > 0) {
        console.log(`Jobs already exist for scraping job ${scrapingJob.id}, skipping creation`)
        
        // Update status to completed and release lock
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            jobs_found: jobs.length,
            jobs_created: existingJobs.length,
            processing_locked_at: null,
            processing_locked_by: null
          })
          .eq('id', scrapingJob.id)

        return new Response('Jobs already processed', { 
          status: 200, 
          headers: corsHeaders 
        })
      }

      // Create job postings
      const jobPostings = jobs.map(job => {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        return {
          title: job.title || 'Untitled Position',
          company: job.company || scrapingJob.career_page_sources?.company_name || 'Unknown Company',
          location: job.location || 'Location TBD',
          description: job.description || 'No description provided',
          requirements: job.requirements || [],
          benefits: job.benefits || [],
          responsibilities: job.responsibilities || [],
          salary: job.salary || 'Competitive',
          type: job.type || 'Full-time',
          application_url: job.application_url || '',
          logo: job.logo || '/placeholder.svg',
          featured: false,
          is_draft: true,
          scraping_job_id: scrapingJob.id,
          source_url: scrapingJob.career_page_sources?.url || '',
          expires_at: expiresAt.toISOString(),
          is_expired: false,
          posted: new Date().toISOString(),
          scraped_at: new Date().toISOString()
        }
      })

      console.log(`Creating ${jobPostings.length} job postings`)

      // Insert job postings with error handling for duplicates
      const { data: createdJobs, error: insertError } = await supabase
        .from('job_postings')
        .insert(jobPostings)
        .select('id')

      let jobsCreated = 0
      if (insertError) {
        console.error('Error creating job postings:', insertError)
        // If it's a unique constraint violation, that's expected and okay
        if (insertError.code === '23505') {
          console.log('Some jobs already exist (duplicate prevention working)')
          // Count how many jobs exist for this scraping job
          const { data: existingCount } = await supabase
            .from('job_postings')
            .select('id', { count: 'exact', head: true })
            .eq('scraping_job_id', scrapingJob.id)
          jobsCreated = existingCount || 0
        }
      } else {
        jobsCreated = createdJobs?.length || 0
        console.log(`Successfully created ${jobsCreated} job postings`)
      }

      // Update scraping job status
      const { error: updateError } = await supabase
        .from('scraping_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          jobs_found: jobs.length,
          jobs_created: jobsCreated,
          processing_locked_at: null,
          processing_locked_by: null
        })
        .eq('id', scrapingJob.id)

      if (updateError) {
        console.error('Error updating scraping job:', updateError)
      }

      console.log('Webhook processing completed successfully')

    } else if (payload.status === 'failed') {
      console.log('Job failed, updating status')
      
      // Update job status to failed and release lock
      const { error: updateError } = await supabase
        .from('scraping_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: payload.result?.error || 'Job failed without specific error',
          processing_locked_at: null,
          processing_locked_by: null
        })
        .eq('id', scrapingJob.id)

      if (updateError) {
        console.error('Error updating failed job:', updateError)
      }
    }

    return new Response('Webhook processed successfully', { 
      status: 200, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})
