
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
    
    // Verify that user is authenticated
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Authentication required to create job listings');
    }
    
    // Map frontend data to database fields
    const dbFields = mapJobFormDataToDatabaseFields(jobData);
    
    // Ensure user_id is set correctly
    dbFields.user_id = session.session.user.id;
    
    const { data, error } = await supabase
      .from('job_postings')
      .insert(dbFields)
      .select();

    if (error) {
      console.error('Error creating job:', error);
      console.log('Full error details:', JSON.stringify(error, null, 2));
      
      // Specific error handling based on error code
      if (error.code === '23505') {
        throw new Error('A job with this information already exists');
      } else if (error.code === '42501') {
        throw new Error('Permission denied. You may not have access to create job listings');
      } else if (error.message.includes('violates row-level security')) {
        throw new Error('Security policy violation. Please make sure you are properly authenticated');
      }
      
      throw new Error(`Database error creating job: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error('No data returned after creating job');
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
    
    // Verify that user is authenticated
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Authentication required to update job listings');
    }
    
    // Map frontend data to database fields
    const dbFields = mapJobFormDataToDatabaseFields(jobData);
    
    // Ensure user_id is set correctly
    dbFields.user_id = session.session.user.id;
    
    // Add updated_at field
    const fieldsWithTimestamp = {
      ...dbFields,
      updated_at: new Date().toISOString()
    };
    
    const { error, data } = await supabase
      .from('job_postings')
      .update(fieldsWithTimestamp)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating job:', error);
      console.log('Full error details:', JSON.stringify(error, null, 2));
      
      // Specific error handling
      if (error.code === '42501') {
        throw new Error('Permission denied. You may not have the rights to update this job listing');
      } else if (error.code === '23514') {
        throw new Error('Invalid data provided. Please check required fields');
      } else if (error.message.includes('violates row-level security')) {
        throw new Error('Security policy violation. You can only update your own job listings');
      }
      
      throw new Error(`Database error updating job: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error('Job not found or you do not have permission to update it');
    }
    
    console.log('Job updated successfully:', data);
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
      featured: job.featured
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
