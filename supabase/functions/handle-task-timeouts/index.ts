
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();
  let timedOutTasks = 0;

  try {
    console.log('=== HANDLING TASK TIMEOUTS ===');
    
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

    // Get timeout configuration
    const { data: config } = await supabaseClient
      .from('scraping_config')
      .select('key, value')
      .eq('key', 'task_timeout_minutes');

    const defaultTimeoutMinutes = config?.[0]?.value || 30;

    // Find running tasks that have exceeded their timeout
    const { data: timedOutRunningTasks, error: fetchError } = await supabaseClient
      .from('scraping_jobs')
      .select(`
        *,
        career_page_sources!inner(url, company_name)
      `)
      .eq('status', 'running')
      .or(`timeout_at.lt.${new Date().toISOString()},and(timeout_at.is.null,started_at.lt.${new Date(Date.now() - defaultTimeoutMinutes * 60 * 1000).toISOString()})`)
      .order('started_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching timed out tasks:', fetchError);
      throw fetchError;
    }

    if (!timedOutRunningTasks || timedOutRunningTasks.length === 0) {
      console.log('No timed out tasks found');
      return new Response(JSON.stringify({ 
        message: 'No timed out tasks', 
        timedOutTasks: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${timedOutRunningTasks.length} timed out tasks`);

    // Process each timed out task
    for (const task of timedOutRunningTasks) {
      try {
        const taskAge = Date.now() - new Date(task.started_at).getTime();
        const taskAgeMinutes = Math.floor(taskAge / (1000 * 60));
        
        console.log(`Timing out task ${task.id} (${taskAgeMinutes} minutes old)`);

        // Log timeout to history
        await supabaseClient
          .from('task_status_history')
          .insert({
            scraping_job_id: task.id,
            status: 'timeout',
            gobi_response: {
              reason: 'Task exceeded timeout threshold',
              age_minutes: taskAgeMinutes,
              timeout_threshold_minutes: task.task_timeout_minutes || defaultTimeoutMinutes
            },
            response_time_ms: null
          });

        // Mark task as failed due to timeout
        await supabaseClient
          .from('scraping_jobs')
          .update({
            status: 'failed',
            error_message: `Task timed out after ${taskAgeMinutes} minutes (threshold: ${task.task_timeout_minutes || defaultTimeoutMinutes} minutes)`,
            completed_at: new Date().toISOString()
          })
          .eq('id', task.id);

        timedOutTasks++;
        console.log(`Task ${task.id} marked as timed out`);

      } catch (error) {
        console.error(`Error timing out task ${task.id}:`, error);
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`Timeout handling completed. Timed out: ${timedOutTasks}, Time: ${processingTime}ms`);

    return new Response(JSON.stringify({ 
      message: 'Timeout handling completed',
      timedOutTasks,
      processingTime
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Timeout handling error:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
