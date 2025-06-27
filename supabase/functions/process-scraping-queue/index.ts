
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

        // Prepare webhook URL - using current domain
        const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/gobi-webhook`;

        // Submit to Gobi API with enhanced payload
        const gobiPayload = {
          input: {
            url: job.career_page_sources.url,
            company_name: job.career_page_sources.company_name || 'Unknown Company'
          },
          webhook_url: webhookUrl,
          max_pages: 20,
          timeout: 300000, // 5 minutes
          extract_detailed_info: true,
          click_job_links: true,
          priority: job.priority || 0,
          metadata: {
            job_id: job.id,
            batch_id: job.batch_id
          }
        };

        console.log('Submitting to Gobi with payload:', { 
          url: gobiPayload.input.url, 
          webhook_url: gobiPayload.webhook_url,
          priority: gobiPayload.priority 
        });

        const gobiResponse = await fetch('https://api.gobi.ai/v1/jobs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gobiApiKey}`,
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

        console.log(`Gobi task created for job ${job.id}:`, gobiResult.id || gobiResult.task_id);

        // Update job with Gobi task ID
        await supabaseClient
          .from('scraping_jobs')
          .update({
            gobi_task_id: gobiResult.id || gobiResult.task_id,
            webhook_url: webhookUrl,
            task_data: gobiResult,
            retry_count: 0 // Reset retry count on successful submission
          })
          .eq('id', job.id);

        processed++;
        console.log(`Successfully submitted job ${job.id} to Gobi`);

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
