
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
    
    // Map database records to our frontend Job model
    const jobs = data.map(record => {
      console.log('Job record:', JSON.stringify(record));
      const mappedJob = mapDatabaseFieldsToJob(record);
      return mappedJob;
    }).filter(Boolean) as Job[]; 
    
    console.log(`Mapped ${jobs.length} jobs successfully`);
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
      .maybeSingle();

    if (error) {
      console.error('Error fetching job by ID:', error);
      return staticJobs.find(job => job.id === id);
    }

    if (!data) {
      console.log(`No job found with ID ${id}, returning static job`);
      return staticJobs.find(job => job.id === id);
    }
    
    // Map and return the job with all fields
    const mappedJob = mapDatabaseFieldsToJob(data);
    
    return mappedJob;
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return staticJobs.find(job => job.id === id);
  }
};
