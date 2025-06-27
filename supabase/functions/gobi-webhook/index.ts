
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

  try {
    console.log('=== GOBI WEBHOOK RECEIVED ===');
    
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

    const { task_id, status, result, error } = await req.json();
    console.log('Webhook payload:', { task_id, status, result: result ? 'present' : 'null', error });

    // Find the scraping job by gobi_task_id
    const { data: scrapingJob, error: fetchError } = await supabaseClient
      .from('scraping_jobs')
      .select('*')
      .eq('gobi_task_id', task_id)
      .single();

    if (fetchError || !scrapingJob) {
      console.error('Scraping job not found:', fetchError);
      return new Response(JSON.stringify({ error: 'Scraping job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found scraping job:', scrapingJob.id);

    // Process based on status
    if (status === 'completed' && result) {
      console.log('Processing completed task with results');
      
      const jobs = result.jobs || [];
      const jobsFound = jobs.length;
      let jobsCreated = 0;

      // Create job postings from results
      if (jobs.length > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const jobRecords = jobs.map((job: any) => ({
          title: job.title || 'Untitled Position',
          company: job.company || 'Unknown Company',
          location: job.location || 'Not specified',
          type: job.type || 'Full-time',
          salary: job.salary || 'Not specified',
          description: job.description || 'No description available',
          requirements: job.requirements || [],
          benefits: job.benefits || [],
          responsibilities: job.responsibilities || [],
          logo: job.logo || '/placeholder.svg',
          featured: false,
          application_url: job.application_url || job.url || '',
          is_draft: true,
          source_url: job.url,
          scraped_at: new Date().toISOString(),
          scraping_job_id: scrapingJob.id,
          expires_at: expiresAt.toISOString(),
          is_expired: false,
          posted: new Date().toISOString(),
          department: job.department,
          seniority_level: job.seniority_level,
          salary_range: job.salary_range,
          equity: job.equity,
          remote_onsite: job.remote_onsite,
          work_hours: job.work_hours,
          visa_sponsorship: job.visa_sponsorship,
          hiring_urgency: job.hiring_urgency
        }));

        const { data: createdJobs, error: createError } = await supabaseClient
          .from('job_postings')
          .insert(jobRecords)
          .select('id');

        if (createError) {
          console.error('Error creating job postings:', createError);
        } else {
          jobsCreated = createdJobs?.length || 0;
          console.log('Created job postings:', jobsCreated);
        }
      }

      // Update scraping job status
      const { error: updateError } = await supabaseClient
        .from('scraping_jobs')
        .update({
          status: 'completed',
          jobs_found: jobsFound,
          jobs_created: jobsCreated,
          completed_at: new Date().toISOString()
        })
        .eq('id', scrapingJob.id);

      if (updateError) {
        console.error('Error updating scraping job:', updateError);
      }

      console.log('Webhook processing completed successfully');
      
    } else if (status === 'failed' || error) {
      console.log('Processing failed task');
      
      // Update scraping job as failed
      const { error: updateError } = await supabaseClient
        .from('scraping_jobs')
        .update({
          status: 'failed',
          error_message: error || 'Task failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', scrapingJob.id);

      if (updateError) {
        console.error('Error updating failed scraping job:', updateError);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
