import { supabase } from '@/integrations/supabase/client';
import { CATEGORY_CONFIG } from '@/lib/categories';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  priority: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = window.location.origin;
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

  try {
    // Fetch all published, non-expired jobs
    const { data: jobs, error } = await supabase
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
  } catch (error) {
    console.error('Error fetching jobs for sitemap:', error);
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
};