
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

    const payload = await req.json();
    const { task_id, status, result, error: taskError, metadata } = payload;
    
    console.log('Webhook payload:', { 
      task_id, 
      status, 
      result: result ? 'present' : 'null', 
      error: taskError ? 'present' : 'null',
      metadata: metadata ? 'present' : 'null'
    });

    // Find the scraping job by gobi_task_id
    const { data: scrapingJob, error: fetchError } = await supabaseClient
      .from('scraping_jobs')
      .select('*')
      .eq('gobi_task_id', task_id)
      .single();

    if (fetchError || !scrapingJob) {
      console.error('Scraping job not found for task_id:', task_id, fetchError);
      return new Response(JSON.stringify({ error: 'Scraping job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found scraping job:', scrapingJob.id);

    // Process based on status
    if (status === 'completed' && result) {
      console.log('Processing completed task with results');
      
      const jobs = result.jobs || result.data || [];
      const jobsFound = jobs.length;
      let jobsCreated = 0;

      console.log(`Found ${jobsFound} jobs in result`);

      // Create job postings from results with enhanced data mapping
      if (jobs.length > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const jobRecords = jobs.map((job: any) => {
          console.log('Processing job:', job.title || 'Untitled');
          
          return {
            title: job.title || job.position || 'Untitled Position',
            company: job.company || job.company_name || 'Unknown Company',
            location: job.location || job.city || 'Not specified',
            type: job.type || job.employment_type || 'Full-time',
            salary: job.salary || job.compensation || 'Not specified',
            description: job.description || job.job_description || 'No description available',
            requirements: Array.isArray(job.requirements) ? job.requirements : 
                         (job.requirements ? [job.requirements] : []),
            benefits: Array.isArray(job.benefits) ? job.benefits : 
                     (job.benefits ? [job.benefits] : []),
            responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : 
                            (job.responsibilities ? [job.responsibilities] : []),
            logo: job.logo || '/placeholder.svg',
            featured: false,
            application_url: job.application_url || job.apply_url || job.url || '',
            is_draft: true,
            source_url: job.url || job.job_url,
            scraped_at: new Date().toISOString(),
            scraping_job_id: scrapingJob.id,
            expires_at: expiresAt.toISOString(),
            is_expired: false,
            posted: job.posted_date ? new Date(job.posted_date).toISOString() : new Date().toISOString(),
            department: job.department || job.team,
            seniority_level: job.seniority_level || job.level,
            salary_range: job.salary_range,
            equity: job.equity,
            remote_onsite: job.remote_onsite || job.work_type,
            work_hours: job.work_hours || job.schedule,
            visa_sponsorship: job.visa_sponsorship || false,
            hiring_urgency: job.hiring_urgency || job.urgency
          };
        });

        const { data: createdJobs, error: createError } = await supabaseClient
          .from('job_postings')
          .insert(jobRecords)
          .select('id');

        if (createError) {
          console.error('Error creating job postings:', createError);
          // Don't throw here, still mark job as completed but with reduced success
          jobsCreated = 0;
        } else {
          jobsCreated = createdJobs?.length || 0;
          console.log('Successfully created job postings:', jobsCreated);
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

      console.log(`Webhook processing completed successfully: ${jobsFound} found, ${jobsCreated} created`);
      
    } else if (status === 'failed' || taskError) {
      console.log('Processing failed task:', taskError);
      
      // Update scraping job as failed
      const { error: updateError } = await supabaseClient
        .from('scraping_jobs')
        .update({
          status: 'failed',
          error_message: taskError || 'Task failed without specific error',
          completed_at: new Date().toISOString()
        })
        .eq('id', scrapingJob.id);

      if (updateError) {
        console.error('Error updating failed scraping job:', updateError);
      }
    } else if (status === 'running' || status === 'processing') {
      console.log('Task is still running, no action needed');
      // Job is already marked as running, no update needed
    } else {
      console.log('Unknown status received:', status);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
