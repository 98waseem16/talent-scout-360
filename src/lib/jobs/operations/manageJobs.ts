
import { supabase } from '@/integrations/supabase/client';
import { JobFormData } from '../../types/job.types';
import { mapJobFormDataToDatabaseFields } from '../utils/jobMappers';
import { staticJobs } from '../../data/staticJobs';

/**
 * Creates a new job listing
 */
export const createJobListing = async (jobData: JobFormData): Promise<string> => {
  try {
    console.log('Creating job with data:', jobData);
    
    // Map frontend data to database fields
    const dbFields = mapJobFormDataToDatabaseFields(jobData);
    
    const { data, error } = await supabase
      .from('job_postings')
      .insert(dbFields)
      .select();

    if (error) {
      console.error('Error creating job:', error);
      throw error;
    }
    
    console.log('Job created successfully:', data);
    return data[0].id;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

/**
 * Updates an existing job listing
 */
export const updateJobListing = async (id: string, jobData: JobFormData): Promise<void> => {
  try {
    console.log('Updating job ID:', id, 'with data:', jobData);
    
    // Map frontend data to database fields
    const dbFields = mapJobFormDataToDatabaseFields(jobData);
    
    // Add updated_at field
    const fieldsWithTimestamp = {
      ...dbFields,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('job_postings')
      .update(fieldsWithTimestamp)
      .eq('id', id);

    if (error) {
      console.error('Error updating job:', error);
      throw error;
    }
    
    console.log('Job updated successfully');
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

/**
 * Seeds the database with static job data
 */
export const seedJobs = async () => {
  try {
    const dbRecords = staticJobs.map(job => ({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: job.type,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      benefits: job.benefits,
      logo: job.logo,
      featured: job.featured,
      application_url: job.application_url
    }));

    const { error } = await supabase
      .from('job_postings')
      .insert(dbRecords);

    if (error) throw error;
    console.log('Sample jobs seeded successfully');
  } catch (error) {
    console.error('Error seeding jobs:', error);
  }
};
