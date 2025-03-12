
import { supabase } from '@/integrations/supabase/client';
import { Job } from '../../types/job.types';
import { staticJobs } from '../../data/staticJobs';
import { mapDatabaseFieldsToJob } from '../utils/jobMappers';

/**
 * Fetches all jobs from the database
 */
export const getJobs = async (): Promise<Job[]> => {
  try {
    console.log('Fetching jobs from database...');
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return staticJobs;
    }

    if (!data || data.length === 0) {
      console.log('No jobs found in database, returning static jobs');
      return staticJobs;
    }

    // Detailed logging of complete job data from database
    console.log('First job from database (complete data):', JSON.stringify(data[0], null, 2));
    
    // Log all relevant filter fields for every job to identify data inconsistencies
    console.log('All jobs filter-relevant fields from database:', data.map(job => ({
      id: job.id,
      title: job.title,
      department: job.department,
      seniority_level: job.seniority_level,
      remote_onsite: job.remote_onsite,
      job_type: job.job_type,
      salary_range: job.salary_range,
      equity: job.equity,
      work_hours: job.work_hours,
      hiring_urgency: job.hiring_urgency,
      revenue_model: job.revenue_model,
      team_size: job.team_size,
      investment_stage: job.investment_stage,
      visa_sponsorship: job.visa_sponsorship
    })));
    
    // Map database records to our frontend Job model
    const jobs = data.map(record => mapDatabaseFieldsToJob(record));
    
    // Validate that mapping worked correctly by logging mapped filter values
    console.log('Mapped jobs filter values:', jobs.map(job => ({
      id: job.id,
      department: job.department,
      seniority_level: job.seniority_level,
      remote_onsite: job.remote_onsite,
      job_type: job.job_type,
      salary_range: job.salary_range,
      equity: job.equity,
      work_hours: job.work_hours,
      hiring_urgency: job.hiring_urgency,
      revenue_model: job.revenue_model,
      team_size: job.team_size,
      investment_stage: job.investment_stage,
      visa_sponsorship: job.visa_sponsorship
    })));
    
    console.log(`Successfully mapped ${jobs.length} jobs from database`);
    
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return staticJobs;
  }
};

/**
 * Fetches trending (featured) jobs from the database
 */
export const getTrendingJobs = async (): Promise<Job[]> => {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('featured', true)
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
    const jobs = data.map(record => mapDatabaseFieldsToJob(record));
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
      .single();

    if (error) {
      console.error('Error fetching job by ID:', error);
      return staticJobs.find(job => job.id === id);
    }

    if (!data) {
      console.log(`No job found with ID ${id}, returning static job`);
      return staticJobs.find(job => job.id === id);
    }

    // Log the complete job data from database to verify all fields
    console.log('Job data from database:', JSON.stringify(data, null, 2));
    
    // Map and return the job with all fields
    const mappedJob = mapDatabaseFieldsToJob(data);
    console.log('Mapped job data for display:', JSON.stringify(mappedJob, null, 2));
    
    return mappedJob;
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return staticJobs.find(job => job.id === id);
  }
};
