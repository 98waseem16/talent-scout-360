
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

    // Get pending scraping jobs ordered by priority and creation time
    const { data: pendingJobs, error: fetchError } = await supabaseClient
      .from('scraping_jobs')
      .select(`
        *,
        career_page_sources!inner(url, company_name)
      `)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('started_at', { ascending: true })
      .limit(5); // Process max 5 jobs at a time

    if (fetchError) {
      console.error('Error fetching pending jobs:', fetchError);
      throw fetchError;
    }

    if (!pendingJobs || pendingJobs.length === 0) {
      console.log('No pending jobs found');
      return new Response(JSON.stringify({ message: 'No pending jobs', processed: 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${pendingJobs.length} pending jobs to process`);
    let processed = 0;

    // Process each job
    for (const job of pendingJobs) {
      try {
        console.log(`Processing job ${job.id} for URL: ${job.career_page_sources.url}`);

        // Mark job as running
        await supabaseClient
          .from('scraping_jobs')
          .update({ status: 'running' })
          .eq('id', job.id);

        // Prepare webhook URL
        const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/gobi-webhook`;

        // Submit to Gobi API
        const gobiResponse = await fetch('https://api.gobi.ai/jobs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gobiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: {
              url: job.career_page_sources.url,
              company_name: job.career_page_sources.company_name
            },
            webhook_url: webhookUrl,
            max_pages: 20,
            timeout: 300000,
            extract_detailed_info: true,
            click_job_links: true
          }),
        });

        if (!gobiResponse.ok) {
          throw new Error(`Gobi API error: ${gobiResponse.status} ${gobiResponse.statusText}`);
        }

        const gobiResult = await gobiResponse.json();
        console.log(`Gobi task created for job ${job.id}:`, gobiResult.id);

        // Update job with Gobi task ID
        await supabaseClient
          .from('scraping_jobs')
          .update({
            gobi_task_id: gobiResult.id,
            webhook_url: webhookUrl,
            task_data: gobiResult
          })
          .eq('id', job.id);

        processed++;
        console.log(`Successfully submitted job ${job.id} to Gobi`);

      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        
        // Mark job as failed and increment retry count
        const newRetryCount = (job.retry_count || 0) + 1;
        const shouldFail = newRetryCount >= (job.max_retries || 3);
        
        await supabaseClient
          .from('scraping_jobs')
          .update({
            status: shouldFail ? 'failed' : 'pending',
            retry_count: newRetryCount,
            error_message: shouldFail ? error.message : null,
            completed_at: shouldFail ? new Date().toISOString() : null
          })
          .eq('id', job.id);

        if (shouldFail) {
          console.log(`Job ${job.id} failed after ${newRetryCount} retries`);
        } else {
          console.log(`Job ${job.id} will be retried (attempt ${newRetryCount})`);
        }
      }

      // Small delay between submissions to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Queue processing completed. Processed: ${processed}/${pendingJobs.length}`);

    return new Response(JSON.stringify({ 
      message: 'Queue processed', 
      processed,
      total: pendingJobs.length 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Queue processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
