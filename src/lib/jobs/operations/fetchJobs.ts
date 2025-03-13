
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

    // Log first job data to debug
    if (data[0]) {
      console.log('Sample job from database:', {
        id: data[0].id,
        title: data[0].title,
        remote_onsite: data[0].remote_onsite,
        job_type: data[0].job_type
      });
    }
    
    // Map database records to our frontend Job model
    const jobs = data.map(record => {
      const mappedJob = mapDatabaseFieldsToJob(record);
      return mappedJob;
    }).filter(Boolean) as Job[]; // Filter out any null results

    // Log mapped jobs for debugging
    console.log(`Successfully mapped ${jobs.length} jobs from database`);
    if (jobs.length > 0) {
      console.log('Sample mapped job:', {
        id: jobs[0].id,
        title: jobs[0].title,
        remote_onsite: jobs[0].remote_onsite,
        job_type: jobs[0].job_type
      });
    }
    
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
      .maybeSingle(); // Changed from single() to maybeSingle() to avoid errors

    if (error) {
      console.error('Error fetching job by ID:', error);
      return staticJobs.find(job => job.id === id);
    }

    if (!data) {
      console.log(`No job found with ID ${id}, returning static job`);
      return staticJobs.find(job => job.id === id);
    }

    // Log the complete job data from database to verify all fields
    console.log('Job data from database - full record:', data);
    
    // Map and return the job with all fields
    const mappedJob = mapDatabaseFieldsToJob(data);
    return mappedJob;
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return staticJobs.find(job => job.id === id);
  }
};
