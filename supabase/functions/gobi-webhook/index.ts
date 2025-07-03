
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
      department?: string;
      seniority_level?: string;
      remote_onsite?: string;
      equity?: string;
      visa_sponsorship?: boolean;
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
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const payload: GobiWebhookPayload = await req.json()

    console.log('=== GOBI WEBHOOK RECEIVED ===')
    console.log('Task ID:', payload.task_id)
    console.log('Status:', payload.status)
    console.log('Jobs found:', payload.result?.jobs?.length || 0)

    // EMERGENCY FIX: Remove broken processing_locked_at references
    // Find the scraping job by task_id
    const { data: scrapingJob, error: fetchError } = await supabase
      .from('scraping_jobs')
      .select(`
        *,
        career_page_sources(url, company_name)
      `)
      .eq('gobi_task_id', payload.task_id)
      .single()

    if (fetchError) {
      console.error('Error finding scraping job:', fetchError)
      return new Response('Scraping job not found', { status: 404, headers: corsHeaders })
    }

    console.log('Found scraping job:', scrapingJob.id)

    if (payload.status === 'completed' && payload.result?.jobs) {
      console.log(`Processing ${payload.result.jobs.length} jobs from webhook`)
      
      let jobsCreated = 0
      const errors: string[] = []

      // Process each job - simplified logic matching the working edge function
      for (const job of payload.result.jobs) {
        try {
          console.log(`Creating job: ${job.title} at ${job.company}`)
          
          // EMERGENCY FIX: Use exact same job creation logic as working edge function
          const { error: insertError } = await supabase
            .from('job_postings')
            .insert({
              title: job.title || 'Untitled Position',
              company: job.company || 'Unknown Company',
              location: job.location || 'Remote',
              type: job.type || 'Full-time',
              salary: job.salary || 'Competitive',
              description: job.description || 'No description available',
              responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
              requirements: Array.isArray(job.requirements) ? job.requirements : [],
              benefits: Array.isArray(job.benefits) ? job.benefits : [],
              logo: job.logo || '',
              featured: false,
              application_url: job.application_url || '',
              user_id: null, // System created
              department: job.department,
              seniority_level: job.seniority_level,
              remote_onsite: job.remote_onsite,
              equity: job.equity,
              visa_sponsorship: job.visa_sponsorship,
              is_draft: true, // Always create as draft
              scraped_at: new Date().toISOString(),
              scraping_job_id: scrapingJob.id,
              source_url: scrapingJob.career_page_sources?.url,
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            })

          if (insertError) {
            console.error(`Failed to insert job ${job.title}:`, insertError)
            errors.push(`${job.title}: ${insertError.message}`)
          } else {
            jobsCreated++
            console.log(`✅ Successfully created job: ${job.title}`)
          }
        } catch (error) {
          console.error(`Exception creating job ${job.title}:`, error)
          errors.push(`${job.title}: ${(error as Error).message}`)
        }
      }

      // Update scraping job status
      const { error: updateError } = await supabase
        .from('scraping_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          jobs_found: payload.result.jobs.length,
          jobs_created: jobsCreated,
          error_message: errors.length > 0 ? `Some jobs failed: ${errors.join('; ')}` : null
        })
        .eq('id', scrapingJob.id)

      if (updateError) {
        console.error('Error updating scraping job:', updateError)
      }

      // Update webhook health on success
      await supabase
        .from('webhook_health')
        .upsert({
          webhook_type: 'gobi-webhook',
          last_received_at: new Date().toISOString(),
          is_active: true,
          failure_count: 0,
          updated_at: new Date().toISOString()
        })

      console.log(`✅ Webhook completed: ${jobsCreated} jobs created, ${errors.length} errors`)
      
      return new Response(JSON.stringify({
        success: true,
        jobs_created: jobsCreated,
        errors: errors.length
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } else if (payload.status === 'failed') {
      console.log('Job failed, updating status')
      
      // Update scraping job as failed
      const { error: updateError } = await supabase
        .from('scraping_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: payload.result?.error || 'Job failed without specific error'
        })
        .eq('id', scrapingJob.id)

      if (updateError) {
        console.error('Error updating failed job:', updateError)
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Job marked as failed'
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response('Unknown status', { status: 400, headers: corsHeaders })

  } catch (error) {
    console.error('Webhook error:', error)
    
    // Update webhook health on failure
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
      
      await supabase
        .from('webhook_health')
        .upsert({
          webhook_type: 'gobi-webhook',
          failure_count: 1,
          is_active: false,
          updated_at: new Date().toISOString()
        })
    } catch (healthError) {
      console.error('Failed to update webhook health:', healthError)
    }
    
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
