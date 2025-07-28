import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  priority: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

const CATEGORY_CONFIG = [
  { slug: 'engineering', department: 'Engineering' },
  { slug: 'design', department: 'Design' },
  { slug: 'product', department: 'Product' },
  { slug: 'marketing', department: 'Marketing' },
  { slug: 'sales', department: 'Sales' },
  { slug: 'operations', department: 'Operations' },
  { slug: 'finance', department: 'Finance' },
  { slug: 'legal', department: 'Legal' },
  { slug: 'hr', department: 'People & HR' },
  { slug: 'customer-success', department: 'Customer Success' },
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Use the production domain
    const baseUrl = 'https://www.notcorporate.com';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const urls: SitemapUrl[] = [
      // Core pages
      {
        loc: baseUrl,
        lastmod: currentDate,
        priority: '1.0',
        changefreq: 'daily'
      },
      {
        loc: `${baseUrl}/jobs`,
        lastmod: currentDate,
        priority: '0.9',
        changefreq: 'hourly'
      },
      {
        loc: `${baseUrl}/post-job`,
        lastmod: currentDate,
        priority: '0.8',
        changefreq: 'monthly'
      }
    ];

    // Add category pages
    CATEGORY_CONFIG.forEach(category => {
      urls.push({
        loc: `${baseUrl}/jobs?category=${category.slug}`,
        lastmod: currentDate,
        priority: '0.7',
        changefreq: 'daily'
      });
    });

    // Fetch all published, non-expired jobs
    const { data: jobs, error } = await supabaseClient
      .from('job_postings')
      .select('id, updated_at')
      .eq('is_draft', false)
      .eq('is_expired', false)
      .order('updated_at', { ascending: false });

    if (!error && jobs) {
      // Add individual job pages
      jobs.forEach(job => {
        urls.push({
          loc: `${baseUrl}/jobs/${job.id}`,
          lastmod: job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : currentDate,
          priority: '0.6',
          changefreq: 'weekly'
        });
      });
    }

    // Generate XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})