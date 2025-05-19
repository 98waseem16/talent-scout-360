
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log(`Scraping job URL: ${url}`);

    // Extract domain from URL
    const domain = new URL(url).hostname;

    // Basic scraping logic - this could be enhanced with more sophisticated techniques
    // or integrated with an external service
    const jobData = await scrapeJobData(url, domain);
    
    if (!jobData) {
      return new Response(
        JSON.stringify({ error: 'Failed to extract job data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      return new Response(
        JSON.stringify({ error: 'Failed to create draft job', details: jobInsertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the scraping job with the job ID
    const { error: updateError } = await supabaseClient
      .from('scraping_jobs')
      .update({ 
        results: jobData,
        status: 'completed',
        target_job_id: jobInsertData.id,
        updated_at: new Date().toISOString()
      })
      .eq('url', url);

    if (updateError) {
      console.error('Error updating scraping job:', updateError);
    }

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

// Function to scrape job data from a URL
async function scrapeJobData(url: string, domain: string) {
  console.log(`Starting to scrape ${url}`);
  
  try {
    // Fetch the page content
    const response = await fetch(url);
    const html = await response.text();
    
    // Basic HTML parsing
    const title = extractContent(html, /<title>(.*?)<\/title>/i, 'Job Title');
    
    // Extract company name
    let company = extractContent(html, /<meta\s+property="og:site_name"\s+content="([^"]+)"/i, '');
    if (!company) {
      company = domain.replace(/www\.|\.com|\.org|\.net|\.io/g, '').split('.')[0];
      company = company.charAt(0).toUpperCase() + company.slice(1);
    }
    
    // Extract other job details
    const description = extractContent(html, /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>(.*?)<\/div>/is, 'Job description not available');
    
    // Parse the content into structured data
    const parsedData = parseJobContent(description);
    
    return {
      title: cleanText(title),
      company: cleanText(company),
      location: parsedData.location || 'Remote',
      type: parsedData.type || 'Full-time',
      salary: parsedData.salary || 'Competitive',
      description: cleanText(description),
      requirements: parsedData.requirements || [],
      responsibilities: parsedData.responsibilities || [],
      benefits: parsedData.benefits || [],
      logo: extractImageUrl(html) || 'https://placehold.co/400',
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

// Extract content using regex
function extractContent(html: string, regex: RegExp, defaultValue: string): string {
  const match = html.match(regex);
  return match && match[1] ? match[1] : defaultValue;
}

// Extract image URL (for company logo)
function extractImageUrl(html: string): string | null {
  const logoRegex = /<meta\s+property="og:image"\s+content="([^"]+)"/i;
  const logoMatch = html.match(logoRegex);
  
  if (logoMatch && logoMatch[1]) {
    return logoMatch[1];
  }
  
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/i;
  const imgMatch = html.match(imgRegex);
  
  return imgMatch ? imgMatch[1] : null;
}

// Clean HTML text
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Parse job content to extract structured data
function parseJobContent(content: string) {
  const result = {
    location: '',
    type: '',
    salary: '',
    requirements: [] as string[],
    responsibilities: [] as string[],
    benefits: [] as string[]
  };
  
  // Basic extraction logic - this could be enhanced with AI or more sophisticated techniques
  // Extract location
  const locationMatch = content.match(/location:\s*([^,\.]+)/i) || 
                        content.match(/based in\s*([^,\.]+)/i);
  if (locationMatch) {
    result.location = locationMatch[1].trim();
  }
  
  // Extract job type
  const typeMatch = content.match(/job type:\s*([^,\.]+)/i) ||
                    content.match(/(full-time|part-time|contract|freelance|remote)/i);
  if (typeMatch) {
    result.type = typeMatch[1].trim();
  }
  
  // Extract salary
  const salaryMatch = content.match(/salary:\s*([^,\.]+)/i) ||
                      content.match(/\$\s*(\d+[kK]?\s*-\s*\d+[kK]?)/);
  if (salaryMatch) {
    result.salary = salaryMatch[1].trim();
  }
  
  // Extract requirements, responsibilities, and benefits
  const sections = content.split(/<h\d>|<strong>|<b>|\n\n/);
  
  for (const section of sections) {
    const lowerSection = section.toLowerCase();
    
    if (lowerSection.includes('requirement') || lowerSection.includes('qualification')) {
      const items = extractListItems(section);
      if (items.length > 0) {
        result.requirements = items;
      }
    } else if (lowerSection.includes('responsibilit') || lowerSection.includes('what you'll do')) {
      const items = extractListItems(section);
      if (items.length > 0) {
        result.responsibilities = items;
      }
    } else if (lowerSection.includes('benefit') || lowerSection.includes('offer') || lowerSection.includes('perks')) {
      const items = extractListItems(section);
      if (items.length > 0) {
        result.benefits = items;
      }
    }
  }
  
  // If no structured data was found, create some basic items
  if (result.requirements.length === 0) {
    result.requirements = ['Experience with relevant skills', 'Strong communication abilities'];
  }
  
  if (result.responsibilities.length === 0) {
    result.responsibilities = ['Contribute to team projects', 'Collaborate with other departments'];
  }
  
  if (result.benefits.length === 0) {
    result.benefits = ['Competitive compensation', 'Professional development opportunities'];
  }
  
  return result;
}

// Extract list items from content
function extractListItems(content: string): string[] {
  const items: string[] = [];
  
  // Check for HTML list items
  const listItemMatches = content.match(/<li>(.*?)<\/li>/g);
  if (listItemMatches) {
    listItemMatches.forEach(match => {
      const cleanItem = cleanText(match);
      if (cleanItem) {
        items.push(cleanItem);
      }
    });
  }
  
  // Check for bullet points (•, -, *)
  if (items.length === 0) {
    const bulletMatches = content.match(/[•\-\*]\s+(.*?)(?=\n[•\-\*]|\n\n|$)/g);
    if (bulletMatches) {
      bulletMatches.forEach(match => {
        const cleanItem = cleanText(match.substring(2));
        if (cleanItem) {
          items.push(cleanItem);
        }
      });
    }
  }
  
  // If no list items found, try to extract sentences
  if (items.length === 0) {
    const sentences = content.match(/[^\.!\?]+[\.!\?]+/g);
    if (sentences && sentences.length > 1) {
      sentences.slice(0, 5).forEach(sentence => {
        const cleanSentence = cleanText(sentence);
        if (cleanSentence && cleanSentence.length > 20) {
          items.push(cleanSentence);
        }
      });
    }
  }
  
  return items.slice(0, 5);  // Limit to 5 items
}
