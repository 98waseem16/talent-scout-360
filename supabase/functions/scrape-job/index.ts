
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SCRAPING_TIMEOUT_MS = 15000; // 15 second timeout for scraping operations
const MAX_HTML_SIZE = 2000000; // Limit HTML size to prevent memory issues (2MB)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Scrape-job function called");
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { url, userId } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'No URL provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scraping job URL: ${url} for user: ${userId}`);

    // Create scraping job record first to track the request
    const { data: scrapingJob, error: scrapingJobError } = await supabaseClient
      .from('scraping_jobs')
      .insert({
        url,
        selectors: {}, // No selectors needed for this approach
        user_id: userId,
        status: 'running'
      })
      .select()
      .single();
    
    if (scrapingJobError) {
      console.error('Error creating scraping job record:', scrapingJobError);
      return new Response(
        JSON.stringify({ error: 'Failed to create scraping job record', details: scrapingJobError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Scraping job record created with ID: ${scrapingJob.id}`);

    // Extract domain from URL
    let domain = "";
    try {
      domain = new URL(url).hostname;
      console.log(`Extracted domain: ${domain}`);
    } catch (error) {
      console.error(`Invalid URL format: ${url}`, error);
      await updateScrapingJobStatus(supabaseClient, scrapingJob.id, 'failed', { error: 'Invalid URL format' });
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Perform the scraping with timeout
    console.log("Starting scraping operation with timeout");
    let jobData;
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Scraping timeout')), SCRAPING_TIMEOUT_MS);
      });
      jobData = await Promise.race([
        scrapeJobData(url, domain),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Error during scraping operation:', error);
      await updateScrapingJobStatus(supabaseClient, scrapingJob.id, 'failed', { error: error.message });
      return new Response(
        JSON.stringify({ error: `Scraping failed: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!jobData) {
      console.error('No job data extracted');
      await updateScrapingJobStatus(supabaseClient, scrapingJob.id, 'failed', { error: 'Failed to extract job data' });
      return new Response(
        JSON.stringify({ error: 'Failed to extract job data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Job data extracted successfully, creating draft job");
    
    // Insert job as draft
    const { data: jobInsertData, error: jobInsertError } = await supabaseClient
      .from('job_postings')
      .insert({
        title: jobData.title || 'Untitled Position',
        company: jobData.company || 'Unknown Company',
        location: jobData.location || 'Remote',
        type: jobData.type || 'Full-time',
        salary: jobData.salary || 'Competitive',
        description: jobData.description || '',
        requirements: jobData.requirements || [],
        responsibilities: jobData.responsibilities || [],
        benefits: jobData.benefits || [],
        logo: jobData.logo || 'https://placehold.co/400',
        source_url: url,
        is_draft: true,
        user_id: userId
      })
      .select()
      .single();

    if (jobInsertError) {
      console.error('Error creating draft job:', jobInsertError);
      await updateScrapingJobStatus(supabaseClient, scrapingJob.id, 'failed', { error: 'Failed to create draft job' });
      return new Response(
        JSON.stringify({ error: 'Failed to create draft job', details: jobInsertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the scraping job with the job ID
    await updateScrapingJobStatus(
      supabaseClient,
      scrapingJob.id,
      'completed',
      jobData,
      jobInsertData.id
    );
    
    console.log(`Job scraping completed, created job ID: ${jobInsertData.id}`);

    return new Response(
      JSON.stringify({ 
        message: 'Job scraped and draft created successfully', 
        jobId: jobInsertData.id,
        jobData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-job function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to update scraping job status
async function updateScrapingJobStatus(
  supabaseClient,
  jobId: string,
  status: 'pending' | 'running' | 'completed' | 'failed',
  results: any = null,
  targetJobId: string | null = null
) {
  const updateData: any = { 
    status, 
    updated_at: new Date().toISOString()
  };
  
  if (results) {
    updateData.results = results;
  }
  
  if (targetJobId) {
    updateData.target_job_id = targetJobId;
  }
  
  const { error } = await supabaseClient
    .from('scraping_jobs')
    .update(updateData)
    .eq('id', jobId);

  if (error) {
    console.error(`Error updating scraping job ${jobId} to ${status}:`, error);
  } else {
    console.log(`Updated scraping job ${jobId} to ${status}`);
  }
}

// Function to scrape job data from a URL with optimization and proper error handling
async function scrapeJobData(url: string, domain: string) {
  console.log(`Starting to scrape ${url}`);
  
  try {
    // Fetch the page content with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for fetch
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    // Get content type to check if it's HTML
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      throw new Error('URL did not return HTML content');
    }
    
    // Limit HTML size to prevent memory issues
    const text = await response.text();
    const html = text.length > MAX_HTML_SIZE ? text.substring(0, MAX_HTML_SIZE) : text;
    
    console.log(`Fetched HTML content: ${html.length} bytes`);
    
    // Try to identify the job site to use more specific scraping logic
    const jobSite = identifyJobSite(domain);
    console.log(`Identified job site: ${jobSite || 'unknown'}`);
    
    // Extract job details using appropriate scraping logic
    const jobData = extractJobData(html, domain, jobSite);
    console.log("Extracted job data successfully");
    
    return jobData;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw error;
  }
}

// Function to identify common job sites
function identifyJobSite(domain: string): string | null {
  const domainLower = domain.toLowerCase();
  
  if (domainLower.includes('linkedin')) return 'linkedin';
  if (domainLower.includes('indeed')) return 'indeed';
  if (domainLower.includes('glassdoor')) return 'glassdoor';
  if (domainLower.includes('ziprecruiter')) return 'ziprecruiter';
  if (domainLower.includes('monster')) return 'monster';
  if (domainLower.includes('angellist') || domainLower.includes('wellfound')) return 'angellist';
  
  return null;
}

// Extract job data with site-specific strategies
function extractJobData(html: string, domain: string, jobSite: string | null): any {
  // Start with basic extraction that works across most sites
  let title = extractContent(html, /<title[^>]*>(.*?)<\/title>/i, 'Job Title') || '';
  let company = '';
  let location = '';
  let description = '';
  
  // Clean the title (often contains company name and other info)
  title = cleanText(title);
  if (title.includes('|')) {
    const parts = title.split('|');
    title = parts[0].trim();
    if (!company && parts.length > 1) {
      company = parts[1].trim();
    }
  } else if (title.includes('-')) {
    const parts = title.split('-');
    title = parts[0].trim();
    if (!company && parts.length > 1) {
      company = parts[parts.length - 1].trim();
    }
  }
  
  // Try to extract company name if not found
  if (!company) {
    company = extractContent(html, /<meta\s+property="og:site_name"\s+content="([^"]+)"/i, '') ||
              extractContent(html, /<meta\s+name="company"\s+content="([^"]+)"/i, '') ||
              domain.replace(/www\.|\.com|\.org|\.net|\.io/g, '').split('.')[0];
    company = company.charAt(0).toUpperCase() + company.slice(1);
  }
  
  // Try site-specific extraction logic first
  if (jobSite) {
    console.log(`Using ${jobSite}-specific extraction logic`);
    try {
      const siteSpecificData = extractSiteSpecificData(html, jobSite);
      if (siteSpecificData.title) title = siteSpecificData.title;
      if (siteSpecificData.company) company = siteSpecificData.company;
      if (siteSpecificData.location) location = siteSpecificData.location;
      if (siteSpecificData.description) description = siteSpecificData.description;
    } catch (error) {
      console.warn(`Site-specific extraction failed, falling back to generic: ${error.message}`);
    }
  }
  
  // If site-specific extraction didn't work, try generic extraction
  if (!description) {
    description = extractContent(html, /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>(.*?)<\/div>/is, '') ||
                 extractContent(html, /<div[^>]*class="[^"]*description[^"]*"[^>]*>(.*?)<\/div>/is, '') ||
                 extractContent(html, /<section[^>]*class="[^"]*job-description[^"]*"[^>]*>(.*?)<\/section>/is, '');
  }
  
  // Clean and limit description size
  description = cleanText(description);
  if (description.length > 5000) {
    description = description.substring(0, 5000) + '...';
  }
  
  // Extract location
  if (!location) {
    location = extractContent(html, /<meta\s+name="job-location"\s+content="([^"]+)"/i, '') ||
               extractContent(html, /<span[^>]*class="[^"]*location[^"]*"[^>]*>(.*?)<\/span>/i, '') ||
               extractContent(html, /location:\s*([^,\.]+)/i, '') ||
               extractContent(html, /based in\s*([^,\.]+)/i, '') ||
               'Remote';
  }
  
  // Extract job type
  const jobType = extractContent(html, /<meta\s+name="job-type"\s+content="([^"]+)"/i, '') ||
                 extractContent(html, /job type:\s*([^,\.]+)/i, '') ||
                 extractContent(html, /(full-time|part-time|contract|freelance|remote)/i, '') ||
                 'Full-time';
  
  // Extract salary
  const salary = extractContent(html, /<meta\s+name="salary"\s+content="([^"]+)"/i, '') ||
                extractContent(html, /salary:\s*([^,\.]+)/i, '') ||
                extractContent(html, /\$\s*(\d+[kK]?\s*-\s*\d+[kK]?)/i, '') ||
                'Competitive';
  
  // Extract requirements, responsibilities, and benefits
  const requirements = extractListItems(html, 'requirements') || 
                      extractListItems(html, 'qualifications') || 
                      ['Experience with relevant skills', 'Strong communication abilities'];
  
  const responsibilities = extractListItems(html, 'responsibilities') || 
                          extractListItems(html, 'duties') || 
                          ['Contribute to team projects', 'Collaborate with other departments'];
  
  const benefits = extractListItems(html, 'benefits') || 
                  extractListItems(html, 'perks') || 
                  ['Competitive compensation', 'Professional development opportunities'];
  
  // Extract logo
  const logo = extractImageUrl(html) || 'https://placehold.co/400';
  
  return {
    title: cleanText(title),
    company: cleanText(company),
    location: cleanText(location),
    type: cleanText(jobType),
    salary: cleanText(salary),
    description,
    requirements: requirements.slice(0, 10), // Limit to 10 items
    responsibilities: responsibilities.slice(0, 10),
    benefits: benefits.slice(0, 10),
    logo,
  };
}

// Extract content using regex with proper error handling
function extractContent(html: string, regex: RegExp, defaultValue: string): string {
  try {
    const match = html.match(regex);
    return match && match[1] ? match[1] : defaultValue;
  } catch (error) {
    console.warn(`Regex extraction error: ${error.message}`);
    return defaultValue;
  }
}

// Clean HTML text
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp;
    .replace(/&amp;/g, '&') // Replace &amp;
    .replace(/&lt;/g, '<') // Replace &lt;
    .replace(/&gt;/g, '>') // Replace &gt;
    .replace(/&quot;/g, '"') // Replace &quot;
    .replace(/&#39;/g, "'") // Replace &#39;
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

// Extract list items from content
function extractListItems(html: string, sectionName: string): string[] {
  try {
    const items: string[] = [];
    
    // Try to find a section with the given name
    const sectionRegex = new RegExp(`<(?:h\\d|div|section|strong)[^>]*>(?:[^<]*${sectionName}[^<]*)<\/(?:h\\d|div|section|strong)>([\\s\\S]*?)(?:<(?:h\\d|div|section|strong)[^>]*>|$)`, 'i');
    const sectionMatch = html.match(sectionRegex);
    let sectionHtml = sectionMatch && sectionMatch[1] ? sectionMatch[1] : '';
    
    if (!sectionHtml) {
      // If no section found, check for list items with the section name nearby
      const listContext = new RegExp(`(?:[^<]*${sectionName}[^<]*)?(<ul[^>]*>[\\s\\S]*?<\/ul>)`, 'i');
      const listMatch = html.match(listContext);
      sectionHtml = listMatch && listMatch[1] ? listMatch[1] : '';
    }
    
    if (sectionHtml) {
      // Extract list items if found
      const listItemMatches = sectionHtml.match(/<li[^>]*>([\s\S]*?)<\/li>/g);
      if (listItemMatches) {
        listItemMatches.forEach(match => {
          const cleanItem = cleanText(match);
          if (cleanItem && items.length < 10) { // Limit to 10 items for performance
            items.push(cleanItem);
          }
        });
      }
      
      // If no list items found, try to extract bullet points
      if (items.length === 0) {
        const bulletMatches = sectionHtml.match(/[•\-\*]\s+(.*?)(?=\n[•\-\*]|\n\n|$)/g);
        if (bulletMatches) {
          bulletMatches.forEach(match => {
            const cleanItem = cleanText(match.substring(2));
            if (cleanItem && items.length < 10) {
              items.push(cleanItem);
            }
          });
        }
      }
    }
    
    // If still no items, extract from the entire HTML as a fallback
    if (items.length === 0) {
      const allListItems = html.match(/<li[^>]*>([\s\S]*?)<\/li>/g);
      if (allListItems) {
        // Try to find list items that might relate to the section
        const sectionRegex = new RegExp(sectionName, 'i');
        let count = 0;
        for (const item of allListItems) {
          if (count >= 5) break; // Limit to 5 items in this fallback
          const cleanItem = cleanText(item);
          // Only include items that might relate to the section or are substantial
          if ((sectionRegex.test(item) || cleanItem.length > 30) && !items.includes(cleanItem)) {
            items.push(cleanItem);
            count++;
          }
        }
      }
    }
    
    // Generate default items if none found
    if (items.length === 0) {
      if (sectionName.includes('requirement') || sectionName.includes('qualification')) {
        return ['Experience with relevant skills', 'Strong communication abilities', 'Bachelor\'s degree or equivalent experience'];
      } else if (sectionName.includes('responsibilit') || sectionName.includes('duties')) {
        return ['Contribute to team projects', 'Collaborate with other departments', 'Drive innovation in your area of expertise'];
      } else if (sectionName.includes('benefit') || sectionName.includes('perk')) {
        return ['Competitive compensation', 'Professional development opportunities', 'Flexible work arrangements'];
      }
    }
    
    return items;
  } catch (error) {
    console.warn(`Error extracting list items for ${sectionName}: ${error.message}`);
    return [];
  }
}

// Extract image URL (for company logo)
function extractImageUrl(html: string): string | null {
  try {
    // Try to find a logo or company image
    const logoSources = [
      /<meta\s+property="og:image"\s+content="([^"]+)"/i,
      /<link\s+rel="icon"\s+href="([^"]+)"/i,
      /<link\s+rel="shortcut icon"\s+href="([^"]+)"/i,
      /<img[^>]+class="[^"]*logo[^"]*"[^>]+src="([^"]+)"/i,
      /<img[^>]+src="([^"]+logo[^"]+)"[^>]*>/i,
      /<img[^>]+src="([^"]+)"[^>]*class="[^"]*company[^"]*"[^>]*>/i
    ];
    
    for (const regex of logoSources) {
      const match = html.match(regex);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Fallback to first meaningful image
    const imgMatch = html.match(/<img[^>]+src="([^"]+)"[^>]+alt="[^"]+"[^>]*>/i);
    if (imgMatch && imgMatch[1] && !imgMatch[1].includes('tracking') && !imgMatch[1].includes('pixel')) {
      return imgMatch[1];
    }
    
    return null;
  } catch (error) {
    console.warn(`Error extracting image URL: ${error.message}`);
    return null;
  }
}

// Extract data for specific job sites
function extractSiteSpecificData(html: string, jobSite: string): any {
  const data: any = {};
  
  switch(jobSite) {
    case 'linkedin':
      data.title = extractContent(html, /<h1[^>]*class="[^"]*job-title[^"]*"[^>]*>(.*?)<\/h1>/is, '');
      data.company = extractContent(html, /<span[^>]*class="[^"]*company-name[^"]*"[^>]*>(.*?)<\/span>/is, '');
      data.location = extractContent(html, /<span[^>]*class="[^"]*job-location[^"]*"[^>]*>(.*?)<\/span>/is, '');
      data.description = extractContent(html, /<div[^>]*class="[^"]*description[^"]*"[^>]*>(.*?)<\/div>/is, '');
      break;
      
    case 'indeed':
      data.title = extractContent(html, /<h1[^>]*class="[^"]*jobsearch-JobInfoHeader-title[^"]*"[^>]*>(.*?)<\/h1>/is, '');
      data.company = extractContent(html, /<div[^>]*class="[^"]*jobsearch-InlineCompanyName[^"]*"[^>]*>(.*?)<\/div>/is, '');
      data.location = extractContent(html, /<div[^>]*class="[^"]*jobsearch-JobInfoHeader-subtitle[^"]*"[^>]*>(?:.*?)<div[^>]*>(.*?)<\/div>/is, '');
      data.description = extractContent(html, /<div[^>]*id="jobDescriptionText"[^>]*>(.*?)<\/div>/is, '');
      break;
      
    case 'glassdoor':
      data.title = extractContent(html, /<h1[^>]*class="[^"]*job-title[^"]*"[^>]*>(.*?)<\/h1>/is, '');
      data.company = extractContent(html, /<div[^>]*class="[^"]*employerName[^"]*"[^>]*>(.*?)<\/div>/is, '');
      data.location = extractContent(html, /<div[^>]*class="[^"]*location[^"]*"[^>]*>(.*?)<\/div>/is, '');
      data.description = extractContent(html, /<div[^>]*class="[^"]*jobDescriptionContent[^"]*"[^>]*>(.*?)<\/div>/is, '');
      break;
      
    default:
      // No specific extraction, will fall back to generic
      break;
  }
  
  return data;
}
