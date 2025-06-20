
import { supabase } from '@/integrations/supabase/client';
import { Job } from '../../types/job.types';
import { staticJobs } from '../../data/staticJobs';
import { mapDatabaseFieldsToJob } from '../utils/jobMappers';

/**
 * Fetches all published jobs from the database (excludes drafts)
 */
export const getJobs = async (): Promise<Job[]> => {
  try {
    console.log('Fetching published jobs from database...');
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('is_draft', false) // Only get published jobs
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return staticJobs;
    }

    if (!data || data.length === 0) {
      console.log('No published jobs found in database, returning static jobs');
      return staticJobs;
    }

    // Debug raw database results
    console.log('DEBUG - Raw database results:', data.length);
    
    if (data[0]) {
      console.log('DEBUG - First job raw data:', {
        id: data[0].id,
        title: data[0].title,
        department: data[0].department,
        department_type: typeof data[0].department,
        seniority_level: data[0].seniority_level,
        seniority_level_type: typeof data[0].seniority_level,
        remote_onsite: data[0].remote_onsite,
        remote_onsite_type: typeof data[0].remote_onsite
      });
    }
    
    // Map database records to our frontend Job model
    const jobs = data.map(record => {
      const mappedJob = mapDatabaseFieldsToJob(record);
      return mappedJob;
    }).filter(Boolean) as Job[]; // Filter out any null results

    // Log mapped jobs for debugging
    console.log(`Successfully mapped ${jobs.length} published jobs from database`);
    if (jobs.length > 0) {
      console.log('DEBUG - First mapped job:', {
        id: jobs[0].id,
        title: jobs[0].title,
        department: `"${jobs[0].department}"`,
        department_type: typeof jobs[0].department,
        seniority_level: `"${jobs[0].seniority_level}"`,
        seniority_level_type: typeof jobs[0].seniority_level,
        type: `"${jobs[0].type}"`,
        type_type: typeof jobs[0].type,
        remote_onsite: `"${jobs[0].remote_onsite}"`,
        remote_onsite_type: typeof jobs[0].remote_onsite
      });
    }
    
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return staticJobs;
  }
};

/**
 * Fetches trending (featured) jobs from the database (excludes drafts)
 */
export const getTrendingJobs = async (): Promise<Job[]> => {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('featured', true)
      .eq('is_draft', false) // Only get published featured jobs
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching trending jobs:', error);
      return staticJobs.filter(job => job.featured);
    }

    if (!data) {
      return staticJobs.filter(job => job.featured);
    }

    // Map database records to our frontend Job model
    const jobs = data.map(record => mapDatabaseFieldsToJob(record)).filter(Boolean) as Job[];
    return jobs;
  } catch (error) {
    console.error('Error fetching trending jobs:', error);
    return staticJobs.filter(job => job.featured);
  }
};

/**
 * Fetches a job by its ID from the database
 */
export const getJobById = async (id: string): Promise<Job | undefined> => {
  try {
    console.log(`Fetching job with ID ${id} from database...`);
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Using maybeSingle() instead of single() to avoid errors when no job is found

    if (error) {
      console.error('Error fetching job by ID:', error);
      return staticJobs.find(job => job.id === id);
    }

    if (!data) {
      console.log(`No job found with ID ${id}, returning static job`);
      return staticJobs.find(job => job.id === id);
    }

    // Log the complete job data from database to verify all fields
    console.log('DEBUG - Job data from database - full record:', data);
    console.log('DEBUG - Raw seniority_level value:', data.seniority_level);
    console.log('DEBUG - Raw seniority_level type:', typeof data.seniority_level);
    
    // Map and return the job with all fields
    const mappedJob = mapDatabaseFieldsToJob(data);
    
    // Log mapped job with all filter fields
    console.log('DEBUG - Job after mapping - all filter fields:', {
      id: mappedJob?.id,
      title: mappedJob?.title,
      department: mappedJob?.department ? `"${mappedJob.department}"` : '""',
      seniority_level: mappedJob?.seniority_level ? `"${mappedJob.seniority_level}"` : '""',
      type: mappedJob?.type ? `"${mappedJob.type}"` : '""',
      salary_range: mappedJob?.salary_range ? `"${mappedJob.salary_range}"` : '""',
      team_size: mappedJob?.team_size ? `"${mappedJob.team_size}"` : '""',
      investment_stage: mappedJob?.investment_stage ? `"${mappedJob.investment_stage}"` : '""',
      remote_onsite: mappedJob?.remote_onsite ? `"${mappedJob.remote_onsite}"` : '""',
      work_hours: mappedJob?.work_hours ? `"${mappedJob.work_hours}"` : '""',
      equity: mappedJob?.equity ? `"${mappedJob.equity}"` : '""',
      hiring_urgency: mappedJob?.hiring_urgency ? `"${mappedJob.hiring_urgency}"` : '""',
      revenue_model: mappedJob?.revenue_model ? `"${mappedJob.revenue_model}"` : '""',
      visa_sponsorship: mappedJob?.visa_sponsorship
    });
    
    return mappedJob;
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return staticJobs.find(job => job.id === id);
  }
};
