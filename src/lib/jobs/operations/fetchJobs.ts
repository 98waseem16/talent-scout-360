
import { supabase } from '@/integrations/supabase/client';
import { Job } from '../../types/job.types';
import { staticJobs } from '../../data/staticJobs';
import { mapDatabaseFieldsToJob } from '../utils/jobMappers';

/**
 * Fetches all jobs from the database
 */
export const getJobs = async (): Promise<Job[]> => {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return staticJobs;
    }

    if (!data) {
      return staticJobs;
    }

    // Add detailed logging to see job fields from the database
    console.log('Job data from database:', data.map(job => ({
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
    
    // Log the mapped job objects to verify filter fields
    console.log('Mapped job objects for filters:', jobs.map(job => ({
      id: job.id,
      department: job.department,
      seniority_level: job.seniority_level,
      remote_onsite: job.remote_onsite, 
      job_type: job.job_type,
      salary_range: job.salary_range,
      equity: job.equity,
      work_hours: job.work_hours
    })));
    
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
      return staticJobs.find(job => job.id === id);
    }

    return mapDatabaseFieldsToJob(data);
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return staticJobs.find(job => job.id === id);
  }
};
