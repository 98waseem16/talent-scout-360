
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

    // Create enhanced prompt for 5-minute thorough extraction with proper field formatting
    const prompt = `You are an expert web scraper. Visit ${url} and extract comprehensive job information with thorough analysis.

MISSION: COMPREHENSIVE EXTRACTION of all job listings by visiting individual job pages.

ENHANCED EXTRACTION PROCESS (5 minutes available):
1. PHASE 1: Scan the main career page and identify ALL job listing links
2. PHASE 2: Visit each individual job page and perform thorough data extraction
3. PHASE 3: Validate and enrich the extracted data

TIME ALLOCATION:
- You have 5 minutes total for comprehensive extraction
- Spend 30-45 seconds per individual job page for thorough analysis
- Extract detailed information from each job posting
- Look for expandable sections, additional details, and comprehensive benefits

EXTRACTION STRATEGY:
- Click through to EVERY individual job posting page (mandatory)
- Extract comprehensive information including hidden sections
- Look for expandable content sections (click "Show more", "Read more", etc.)
- Check for detailed benefits, compensation, and company culture information
- Extract technical requirements and nice-to-have skills separately
- Look for team information, reporting structure, and growth opportunities

REQUIRED JSON OUTPUT STRUCTURE:
{
  "jobs": [
    {
      "title": "Complete job title",
      "company": "${companyName || 'Extract from website'}",
      "location": "Detailed location (city, state, country, remote options)",
      "description": "Comprehensive job description with all details",
      "responsibilities": [
        "Extract all key responsibilities and duties",
        "Include day-to-day activities and expectations",
        "Capture growth and learning opportunities"
      ],
      "requirements": [
        "Extract all required qualifications", 
        "Include education, experience, technical skills",
        "Separate must-have from nice-to-have requirements"
      ],
      "benefits": [
        "Extract comprehensive benefits package",
        "Include health, dental, vision, retirement",
        "Capture perks, vacation, professional development",
        "Include equity, bonuses, and compensation details"
      ],
      "url": "Direct link to individual job posting",
      "type": "EXACTLY one of: Full-time|Part-time|Contract|Remote|Freelance|Internship",
      "salary": "Detailed salary information if available",
      "department": "Engineering|Sales|Marketing|Product|Design|Operations|HR|Finance|Legal|Other",
      "seniority_level": "Entry|Junior|Mid|Senior|Lead|Principal|Director|VP|C-Level",
      "team_size": "Team size and structure if mentioned",
      "remote_onsite": "Remote|Hybrid|On-site",
      "work_hours": "Full-time|Part-time|Flexible|Specific hours",
      "visa_sponsorship": true/false,
      "equity": "EXACTLY one of: None|0.1%-0.5%|0.5%-1%|1%+ (use 'None' if equity compensation is not specified, not available, or not mentioned)",
      "salary_range": "Salary range if different from salary",
      "investment_stage": "Seed|Series A|Series B|Series C|Pre-IPO|Public|Other",
      "revenue_model": "Company revenue model if available",
      "hiring_urgency": "Immediate|Within 30 days|Within 90 days|Not specified"
    }
  ]
}

FIELD EXTRACTION RULES:
- type: Normalize variations ("Full time" → "Full-time", "Remote work" → "Remote")
- department: Map job functions intelligently (Software Engineer → Engineering)
- seniority_level: Extract from titles and job descriptions
- equity: CRITICAL - Must return exactly one of: "None", "0.1%-0.5%", "0.5%-1%", "1%+"
  * If equity is not mentioned, not specified, or not available → use "None"
  * If equity mentions small percentages (0.1-0.5%) → use "0.1%-0.5%"
  * If equity mentions medium percentages (0.5-1%) → use "0.5%-1%"
  * If equity mentions higher percentages (1%+) → use "1%+"
  * Examples: "equity package available" → "None", "0.25% equity" → "0.1%-0.5%", "up to 2%" → "1%+"
- responsibilities/requirements/benefits: Extract from all available sections
- Look for expandable content sections and click them for more details

QUALITY REQUIREMENTS:
- Every job MUST have title and comprehensive description
- Extract at least 5-8 key data points per job when available
- Validate type field uses only the 6 specified values
- Validate equity field uses only the 4 specified values (None, 0.1%-0.5%, 0.5%-1%, 1%+)
- Skip navigation elements, headers, footer content
- Focus on job-specific content only

COMPREHENSIVE EXTRACTION RULES:
- Visit ALL individual job pages for complete data
- Extract detailed information from each page
- Look for additional details in expandable sections
- Capture comprehensive benefits and compensation information
- Extract detailed requirements and qualifications
- Include company culture and growth opportunity details

Return ONLY the JSON structure with comprehensive job data. Use the full 5 minutes to ensure thorough extraction of all available information.`;

    console.log('Calling Gobi.ai API with enhanced 5-minute extraction prompt...');
    console.log('Enhanced prompt length:', prompt.length);

    // Call Gobi.ai API with 5-minute timeout for comprehensive extraction
    const gobiResponse = await fetch('https://gobii.ai/api/v1/tasks/browser-use/', {
      method: 'POST',
      headers: {
        'X-Api-Key': gobiApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        wait: 300 // Enhanced to 5 minutes (300 seconds) for comprehensive extraction
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
      console.error('Gobi comprehensive extraction failed:', gobiData.error_message);
      throw new Error(`Comprehensive extraction failed: ${gobiData.error_message || 'Unknown error'}`)
    }

    if (gobiData.status === 'in_progress') {
      console.log('Comprehensive extraction still in progress, updating job status...');
      await supabase
        .from('scraping_jobs')
        .update({
          status: 'running',
          error_message: 'Comprehensive extraction in progress (5-minute deep analysis). Please check back shortly.'
        })
        .eq('id', scrapingJobId)

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Comprehensive extraction is in progress (5-minute deep analysis). Please check the recent jobs list for updates.',
          status: 'in_progress'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Extract jobs from response - handle multiple possible formats
    let jobs: JobData[] = []
    console.log('=== EXTRACTING JOBS FROM COMPREHENSIVE EXTRACTION RESPONSE ===');
    
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

    console.log('=== COMPREHENSIVE EXTRACTION COMPLETE ===');
    console.log('Total jobs found:', jobs.length);
    if (jobs.length > 0) {
      console.log('First job sample:', JSON.stringify(jobs[0], null, 2));
    }

    // Validate and clean job types
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

    // Process and save jobs to Supabase
    let jobsCreated = 0
    const createdJobs = []

    console.log('=== PROCESSING COMPREHENSIVE EXTRACTED JOBS FOR DATABASE ===');

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      console.log(`Processing comprehensive job ${i + 1}/${jobs.length}:`, job.title || 'No title');

      if (!job.title || job.title.trim() === '') {
        console.log(`Skipping job ${i + 1}: No title`);
        continue;
      }

      try {
        console.log(`🔧 Job ${i + 1} equity value from Gobi: "${job.equity}"`);

        // Enhanced job data mapping - equity should now come properly formatted from Gobi
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
          
          // Additional comprehensive fields - equity should be properly formatted from Gobi now
          department: job.department?.trim() || null,
          seniority_level: job.seniority_level?.trim() || null,
          team_size: job.team_size?.trim() || null,
          remote_onsite: job.remote_onsite?.trim() || null,
          work_hours: job.work_hours?.trim() || null,
          visa_sponsorship: job.visa_sponsorship === true || job.visa_sponsorship === 'true',
          equity: job.equity?.trim() || 'None', // Default to 'None' if not provided
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

        console.log(`Inserting comprehensive job ${i + 1}:`, {
          title: jobData.title,
          department: jobData.department,
          seniority_level: jobData.seniority_level,
          equity: jobData.equity,
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
          console.error(`❌ Error inserting comprehensive job ${i + 1}:`, insertError);
          console.error(`❌ Failed job data:`, {
            title: jobData.title,
            equity: jobData.equity,
            errorCode: insertError.code,
            errorMessage: insertError.message
          });
          continue
        }

        console.log(`✅ Comprehensive job ${i + 1} inserted successfully with ID:`, createdJob.id);
        createdJobs.push(createdJob)
        jobsCreated++
      } catch (jobError) {
        console.error(`❌ Error processing comprehensive job ${i + 1}:`, jobError);
        console.error(`❌ Failed job details:`, {
          title: job.title,
          equity: job.equity,
          error: jobError.message
        });
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

    console.log('=== COMPREHENSIVE EXTRACTION COMPLETE ===');
    console.log('Success! Comprehensive jobs found:', jobs.length, 'Comprehensive jobs created:', jobsCreated);

    return new Response(
      JSON.stringify({
        success: true,
        jobs: createdJobs,
        jobsFound: jobs.length,
        jobsCreated: jobsCreated,
        message: `Successfully extracted ${jobs.length} jobs with comprehensive data and created ${jobsCreated} job drafts.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('=== COMPREHENSIVE EXTRACTION ERROR ===');
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
        message: 'Comprehensive extraction failed. Please check the logs and try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
