import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobData {
  title: string;
  company: string;
  location?: string;
  description?: string;
  url?: string;
  type?: string;
  salary?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  department?: string;
  seniority_level?: string;
  team_size?: string;
  remote_onsite?: string;
  work_hours?: string;
  visa_sponsorship?: boolean;
  equity?: string;
  salary_range?: string;
  investment_stage?: string;
  revenue_model?: string;
  hiring_urgency?: string;
}

interface GobiResponse {
  id: string;
  status: 'completed' | 'failed' | 'in_progress';
  result?: any;
  error_message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let scrapingJobId = null;

  try {
    const { url, companyName, scrapingJobId: jobId } = await req.json()
    scrapingJobId = jobId;

    console.log('=== SCRAPING REQUEST START ===');
    console.log('URL:', url);
    console.log('Company Name:', companyName);
    console.log('Scraping Job ID:', scrapingJobId);

    if (!url) {
      throw new Error('URL is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Supabase client initialized');

    // Update scraping job status to running
    console.log('Updating scraping job status to running...');
    const { error: updateError } = await supabase
      .from('scraping_jobs')
      .update({ status: 'running' })
      .eq('id', scrapingJobId)

    if (updateError) {
      console.error('Error updating scraping job status:', updateError);
      throw new Error(`Failed to update job status: ${updateError.message}`);
    }

    console.log('Scraping job status updated successfully');

    // Get Gobi.ai API key
    const gobiApiKey = Deno.env.get('GOBI_API_KEY')
    console.log('Gobi API key exists:', !!gobiApiKey);
    console.log('Gobi API key length:', gobiApiKey?.length || 0);

    if (!gobiApiKey) {
      throw new Error('Gobi API key not configured')
    }

    // Create comprehensive prompt for deep job extraction
    const prompt = `You are an expert web scraper tasked with extracting comprehensive job information from a career page. Visit ${url} and perform DEEP EXTRACTION of all job listings.

MISSION: Extract COMPLETE job information for each position by:
1. First, identify all job listings on the main career page
2. For each job found, click through to the individual job posting page to get FULL details
3. Extract comprehensive information for each job (not just basic summaries)

CRITICAL EXTRACTION REQUIREMENTS:

For each job posting, extract ALL available information in this EXACT JSON structure:

{
  "jobs": [
    {
      "title": "Full job title",
      "company": "${companyName || 'Extract from website'}",
      "location": "Full location details (city, state, remote options, hybrid details)",
      "description": "COMPLETE job description (extract the full text, not a summary)",
      "responsibilities": [
        "Extract each responsibility as separate array item",
        "Include ALL responsibilities listed"
      ],
      "requirements": [
        "Extract each requirement as separate array item", 
        "Include education, experience, skills, certifications"
      ],
      "benefits": [
        "Extract each benefit as separate array item",
        "Include salary, health, vacation, equity, perks"
      ],
      "url": "Direct link to individual job posting",
      "type": "MUST be exactly one of: Full-time|Part-time|Contract|Remote|Freelance|Internship",
      "salary": "Full salary information if available",
      "department": "Engineering|Sales|Marketing|Product|Design|Operations|HR|Finance|Legal|Other",
      "seniority_level": "Entry|Junior|Mid|Senior|Lead|Principal|Director|VP|C-Level",
      "team_size": "Size of team or department if mentioned",
      "remote_onsite": "Remote|Hybrid|On-site",
      "work_hours": "Full-time|Part-time|Flexible|Specific hours if mentioned",
      "visa_sponsorship": true/false,
      "equity": "Equity details if mentioned",
      "salary_range": "Salary range if different from salary field",
      "investment_stage": "Seed|Series A|Series B|Series C|Pre-IPO|Public|Other",
      "revenue_model": "Revenue model if company info available",
      "hiring_urgency": "Immediate|Within 30 days|Within 90 days|Not specified"
    }
  ]
}

DEEP EXTRACTION STRATEGY:
1. ALWAYS click through to individual job posting pages - don't just scrape the listings page
2. Look for detailed job descriptions, not just summaries
3. Extract requirements and responsibilities as separate detailed arrays
4. Find salary/compensation information wherever it appears
5. Look for company culture, benefits, and perks sections
6. Identify department/team information
7. Determine seniority level from title and description
8. Check for remote work policies and visa sponsorship info

FIELD STANDARDIZATION RULES:
- type: Convert variations like "Full time" → "Full-time", "Fully Remote" → "Remote"
- department: Map job functions to standard categories (Software Engineer → Engineering)
- seniority_level: Extract from titles (Senior Software Engineer → Senior)
- remote_onsite: Look for remote work policies and classify accurately
- visa_sponsorship: Look for H1B, work authorization, or sponsorship mentions

CONTENT RECOGNITION:
- Job descriptions: Extract the complete description, not summaries
- Responsibilities: Look for "What you'll do", "Responsibilities", "Day-to-day" sections
- Requirements: Find "Requirements", "Qualifications", "What we're looking for" sections  
- Benefits: Extract from "Benefits", "What we offer", "Perks", compensation sections
- Company info: Look for "About us", company stage, team size information

QUALITY ASSURANCE:
- Ensure every job has a meaningful title and description
- Validate that type field only uses the 6 specified values
- Don't include navigation elements, headers, or non-job content
- If no jobs found, return empty jobs array
- Extract at least 5-10 data points per job when available

DEEP CRAWLING INSTRUCTIONS:
- Spend time on each individual job page to get complete information
- Don't rush - thorough extraction is more valuable than speed
- If a job page has expandable sections, click to expand them
- Look for PDF job descriptions or additional detail links
- Extract company culture and team information when available

Return ONLY the JSON structure above with comprehensive job data. The goal is to populate a complete job board with rich, detailed information that job seekers need to make informed decisions.`;

    console.log('Calling Gobi.ai API with enhanced prompt...');
    console.log('Enhanced prompt length:', prompt.length);

    // Call Gobi.ai API with increased timeout for deep crawling
    const gobiResponse = await fetch('https://gobii.ai/api/v1/tasks/browser-use/', {
      method: 'POST',
      headers: {
        'X-Api-Key': gobiApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        wait: 180 // Increased to 3 minutes for deep crawling
      })
    })

    console.log('Gobi API response status:', gobiResponse.status);
    console.log('Gobi API response headers:', Object.fromEntries(gobiResponse.headers.entries()));

    if (!gobiResponse.ok) {
      const errorText = await gobiResponse.text();
      console.error('Gobi API error response:', errorText);
      throw new Error(`Gobi API error: ${gobiResponse.status} ${gobiResponse.statusText} - ${errorText}`)
    }

    const gobiData: GobiResponse = await gobiResponse.json()
    console.log('=== GOBI API RESPONSE ===');
    console.log('Response status:', gobiData.status);
    console.log('Response ID:', gobiData.id);
    console.log('Full response:', JSON.stringify(gobiData, null, 2));

    // Handle different response statuses
    if (gobiData.status === 'failed') {
      console.error('Gobi scraping failed:', gobiData.error_message);
      throw new Error(`Scraping failed: ${gobiData.error_message || 'Unknown error'}`)
    }

    if (gobiData.status === 'in_progress') {
      console.log('Scraping still in progress, updating job status...');
      await supabase
        .from('scraping_jobs')
        .update({
          status: 'running',
          error_message: 'Deep crawling in progress. This may take longer due to comprehensive extraction.'
        })
        .eq('id', scrapingJobId)

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Deep crawling is in progress. Please check the recent jobs list for updates.',
          status: 'in_progress'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Extract jobs from response - handle multiple possible formats
    let jobs: JobData[] = []
    console.log('=== EXTRACTING JOBS FROM RESPONSE ===');
    
    if (gobiData.status === 'completed' && gobiData.result) {
      console.log('Gobi result type:', typeof gobiData.result);
      console.log('Gobi result structure:', JSON.stringify(gobiData.result, null, 2));

      // Try different extraction methods
      if (Array.isArray(gobiData.result)) {
        console.log('Result is array, using directly');
        jobs = gobiData.result;
      } else if (gobiData.result.jobs && Array.isArray(gobiData.result.jobs)) {
        console.log('Result has jobs array property');
        jobs = gobiData.result.jobs;
      } else if (typeof gobiData.result === 'string') {
        console.log('Result is string, attempting to parse JSON');
        try {
          const parsed = JSON.parse(gobiData.result);
          if (Array.isArray(parsed)) {
            jobs = parsed;
          } else if (parsed.jobs && Array.isArray(parsed.jobs)) {
            jobs = parsed.jobs;
          }
        } catch (parseError) {
          console.error('Failed to parse result string as JSON:', parseError);
        }
      } else if (gobiData.result.content) {
        console.log('Result has content property, checking structure');
        try {
          const content = typeof gobiData.result.content === 'string' 
            ? JSON.parse(gobiData.result.content) 
            : gobiData.result.content;
          
          if (Array.isArray(content)) {
            jobs = content;
          } else if (content.jobs && Array.isArray(content.jobs)) {
            jobs = content.jobs;
          }
        } catch (parseError) {
          console.error('Failed to parse content:', parseError);
        }
      }
    }

    console.log('=== JOBS EXTRACTION COMPLETE ===');
    console.log('Total jobs found:', jobs.length);
    if (jobs.length > 0) {
      console.log('First job sample:', JSON.stringify(jobs[0], null, 2));
    }

    // Validate and clean job types as a safety net
    const validJobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Freelance', 'Internship'];
    
    jobs = jobs.map(job => {
      let cleanType = job.type || 'Full-time';
      
      // Normalize common variations
      if (cleanType.toLowerCase().includes('full') && cleanType.toLowerCase().includes('time')) {
        cleanType = 'Full-time';
      } else if (cleanType.toLowerCase().includes('part') && cleanType.toLowerCase().includes('time')) {
        cleanType = 'Part-time';
      } else if (cleanType.toLowerCase().includes('remote')) {
        cleanType = 'Remote';
      } else if (cleanType.toLowerCase().includes('contract')) {
        cleanType = 'Contract';
      } else if (cleanType.toLowerCase().includes('freelance')) {
        cleanType = 'Freelance';
      } else if (cleanType.toLowerCase().includes('intern')) {
        cleanType = 'Internship';
      } else if (!validJobTypes.includes(cleanType)) {
        console.log(`Invalid job type "${cleanType}" found, defaulting to "Full-time"`);
        cleanType = 'Full-time';
      }
      
      return {
        ...job,
        type: cleanType
      };
    });

    // Process and save jobs to Supabase with enhanced data mapping
    let jobsCreated = 0
    const createdJobs = []

    console.log('=== PROCESSING ENHANCED JOBS FOR DATABASE ===');

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      console.log(`Processing enhanced job ${i + 1}/${jobs.length}:`, job.title || 'No title');

      if (!job.title || job.title.trim() === '') {
        console.log(`Skipping job ${i + 1}: No title`);
        continue;
      }

      try {
        // Enhanced job data mapping with comprehensive fields
        const jobData = {
          title: job.title.trim(),
          company: job.company?.trim() || companyName || new URL(url).hostname,
          location: job.location?.trim() || '',
          description: job.description?.trim() || '',
          salary: job.salary?.trim() || '',
          type: job.type?.trim() || 'Full-time',
          
          // Enhanced field mapping
          responsibilities: Array.isArray(job.responsibilities) ? 
            job.responsibilities.filter(r => r && r.trim()) : [],
          requirements: Array.isArray(job.requirements) ? 
            job.requirements.filter(r => r && r.trim()) : [],
          benefits: Array.isArray(job.benefits) ? 
            job.benefits.filter(b => b && b.trim()) : [],
          
          // Additional comprehensive fields
          department: job.department?.trim() || null,
          seniority_level: job.seniority_level?.trim() || null,
          team_size: job.team_size?.trim() || null,
          remote_onsite: job.remote_onsite?.trim() || null,
          work_hours: job.work_hours?.trim() || null,
          visa_sponsorship: job.visa_sponsorship === true || job.visa_sponsorship === 'true',
          equity: job.equity?.trim() || null,
          salary_range: job.salary_range?.trim() || null,
          investment_stage: job.investment_stage?.trim() || null,
          revenue_model: job.revenue_model?.trim() || null,
          hiring_urgency: job.hiring_urgency?.trim() || null,
          
          // Standard fields
          logo: '/placeholder.svg',
          application_url: job.url?.trim() || url,
          source_url: url,
          scraped_at: new Date().toISOString(),
          scraping_job_id: scrapingJobId,
          is_draft: true,
          posted: new Date().toISOString()
        }

        console.log(`Inserting enhanced job ${i + 1} with comprehensive data:`, {
          title: jobData.title,
          department: jobData.department,
          seniority_level: jobData.seniority_level,
          responsibilities_count: jobData.responsibilities.length,
          requirements_count: jobData.requirements.length,
          benefits_count: jobData.benefits.length
        });
        
        const { data: createdJob, error: insertError } = await supabase
          .from('job_postings')
          .insert(jobData)
          .select()
          .single()

        if (insertError) {
          console.error(`Error inserting enhanced job ${i + 1}:`, insertError);
          continue
        }

        console.log(`Enhanced job ${i + 1} inserted successfully with ID:`, createdJob.id);
        createdJobs.push(createdJob)
        jobsCreated++
      } catch (jobError) {
        console.error(`Error processing enhanced job ${i + 1}:`, jobError);
        continue
      }
    }

    console.log('=== DATABASE OPERATIONS COMPLETE ===');
    console.log('Jobs created:', jobsCreated);

    // Update scraping job with results
    console.log('Updating scraping job with final results...');
    const { error: finalUpdateError } = await supabase
      .from('scraping_jobs')
      .update({
        status: 'completed',
        jobs_found: jobs.length,
        jobs_created: jobsCreated,
        completed_at: new Date().toISOString()
      })
      .eq('id', scrapingJobId)

    if (finalUpdateError) {
      console.error('Error updating final job status:', finalUpdateError);
    }

    // Update source last_scraped_at
    console.log('Updating source last_scraped_at...');
    const { error: sourceUpdateError } = await supabase
      .from('career_page_sources')
      .update({ 
        last_scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('url', url)

    if (sourceUpdateError) {
      console.error('Error updating source:', sourceUpdateError);
    }

    console.log('=== SCRAPING COMPLETE ===');
    console.log('Success! Enhanced jobs found:', jobs.length, 'Enhanced jobs created:', jobsCreated);

    return new Response(
      JSON.stringify({
        success: true,
        jobs: createdJobs,
        jobsFound: jobs.length,
        jobsCreated: jobsCreated,
        message: `Successfully scraped ${jobs.length} jobs with comprehensive details and created ${jobsCreated} enhanced job drafts.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('=== SCRAPING ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);

    // Update scraping job with error if scrapingJobId exists
    if (scrapingJobId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        console.log('Updating scraping job with error status...');
        const { error: updateError } = await supabase
          .from('scraping_jobs')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', scrapingJobId)

        if (updateError) {
          console.error('Error updating failed job status:', updateError);
        }
      } catch (updateError) {
        console.error('Error updating failed job:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        message: 'Scraping failed. Please check the logs and try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
