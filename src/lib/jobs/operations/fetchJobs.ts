
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
        job_type: data[0].job_type,
        full_record: data[0]
      });
    }
    
    // Map database records to our frontend Job model
    const jobs = data.map(record => {
      const mappedJob = mapDatabaseFieldsToJob(record);
      
      // For debugging, log one job's filter fields to check mapping
      if (record.id === data[0]?.id) {
        console.log('First job mapped filter fields:', {
          id: mappedJob.id,
          title: mappedJob.title,
          remote_onsite: mappedJob.remote_onsite,
          job_type: mappedJob.job_type
        });
      }
      
      return mappedJob;
    }).filter(Boolean) as Job[]; // Filter out any null results

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
    console.log('Job data from database:', data);
    
    // Map and return the job with all fields
    const mappedJob = mapDatabaseFieldsToJob(data);
    return mappedJob;
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return staticJobs.find(job => job.id === id);
  }
};
