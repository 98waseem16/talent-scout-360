
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('Starting job expiration check...');

    // Mark jobs as expired where expires_at is in the past
    const { data, error } = await supabase
      .from('job_postings')
      .update({ is_expired: true })
      .lt('expires_at', new Date().toISOString())
      .eq('is_expired', false)
      .select('id, title, company, expires_at');

    if (error) {
      console.error('Error marking jobs as expired:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const expiredCount = data?.length || 0;
    console.log(`Successfully marked ${expiredCount} jobs as expired`);
    
    if (expiredCount > 0) {
      console.log('Expired jobs:', data.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        expired_on: job.expires_at
      })));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        expired_jobs_count: expiredCount,
        expired_jobs: data || []
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in mark-expired-jobs function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
