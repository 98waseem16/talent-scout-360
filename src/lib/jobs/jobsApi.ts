
import { supabase } from '@/integrations/supabase/client';
import { Job, JobFormData } from '../types/job.types';
import { staticJobs } from '../data/staticJobs';
import { formatPostedDate } from '../utils/dateUtils';

/**
 * Fetches all jobs from the database
 */
export const getJobs = async (): Promise<Job[]> => {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .order('posted', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return staticJobs;
    }

    const jobs = data.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary || `${job.salary_min || ''}-${job.salary_max || ''} ${job.salary_currency || 'USD'}`,
      type: job.type as 'Full-time' | 'Part-time' | 'Contract' | 'Remote',
      posted: formatPostedDate(job.posted),
      description: job.description,
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      logo: job.logo || job.logo_url || '',
      featured: job.featured || job.is_featured || false,
      user_id: job.user_id,
      // Additional fields
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      salary_currency: job.salary_currency || 'USD',
      application_url: job.application_url || '',
      contact_email: job.contact_email || '',
      logo_url: job.logo_url || job.logo || '',
      is_remote: job.is_remote || false,
      is_featured: job.is_featured || job.featured || false
    }));

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
      .order('posted', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching trending jobs:', error);
      return staticJobs.filter(job => job.featured);
    }

    // Using the same mapping function as getJobs
    const jobs = data.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary || `${job.salary_min || ''}-${job.salary_max || ''} ${job.salary_currency || 'USD'}`,
      type: job.type as 'Full-time' | 'Part-time' | 'Contract' | 'Remote',
      posted: formatPostedDate(job.posted),
      description: job.description,
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      logo: job.logo || job.logo_url || '',
      featured: job.featured || job.is_featured || false,
      user_id: job.user_id,
      // Additional fields
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      salary_currency: job.salary_currency || 'USD',
      application_url: job.application_url || '',
      contact_email: job.contact_email || '',
      logo_url: job.logo_url || job.logo || '',
      is_remote: job.is_remote || false,
      is_featured: job.is_featured || job.featured || false
    }));

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

    return {
      id: data.id,
      title: data.title,
      company: data.company,
      location: data.location,
      salary: data.salary || `${data.salary_min || ''}-${data.salary_max || ''} ${data.salary_currency || 'USD'}`,
      type: data.type as 'Full-time' | 'Part-time' | 'Contract' | 'Remote',
      posted: formatPostedDate(data.posted),
      description: data.description,
      responsibilities: data.responsibilities || [],
      requirements: data.requirements || [],
      benefits: data.benefits || [],
      logo: data.logo || data.logo_url || '',
      featured: data.featured || data.is_featured || false,
      user_id: data.user_id,
      // Additional fields
      salary_min: data.salary_min?.toString() || '',
      salary_max: data.salary_max?.toString() || '',
      salary_currency: data.salary_currency || 'USD',
      application_url: data.application_url || '',
      contact_email: data.contact_email || '',
      logo_url: data.logo_url || data.logo || '',
      is_remote: data.is_remote || false,
      is_featured: data.is_featured || data.featured || false
    };
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return staticJobs.find(job => job.id === id);
  }
};

/**
 * Creates a new job listing
 */
export const createJobListing = async (jobData: JobFormData): Promise<string> => {
  try {
    // Format the requirements and benefits as arrays
    const requirementsArray = jobData.requirements 
      ? jobData.requirements.split('\n').filter(Boolean) 
      : [];
    
    const benefitsArray = jobData.benefits 
      ? jobData.benefits.split('\n').filter(Boolean) 
      : [];
    
    const { data, error } = await supabase
      .from('job_postings')
      .insert({
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        type: jobData.type,
        salary_min: jobData.salary_min ? jobData.salary_min : null,
        salary_max: jobData.salary_max ? jobData.salary_max : null,
        salary_currency: jobData.salary_currency,
        description: jobData.description,
        requirements: requirementsArray,
        benefits: benefitsArray,
        logo: jobData.logo_url || null,
        logo_url: jobData.logo_url || null, 
        application_url: jobData.application_url,
        contact_email: jobData.contact_email,
        is_remote: jobData.is_remote,
        featured: jobData.is_featured,
        is_featured: jobData.is_featured,
        user_id: jobData.user_id
      })
      .select();

    if (error) throw error;
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
    // Format the requirements and benefits as arrays
    const requirementsArray = jobData.requirements 
      ? jobData.requirements.split('\n').filter(Boolean) 
      : [];
    
    const benefitsArray = jobData.benefits 
      ? jobData.benefits.split('\n').filter(Boolean) 
      : [];
    
    const { error } = await supabase
      .from('job_postings')
      .update({
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        type: jobData.type,
        salary_min: jobData.salary_min ? jobData.salary_min : null,
        salary_max: jobData.salary_max ? jobData.salary_max : null,
        salary_currency: jobData.salary_currency,
        description: jobData.description,
        requirements: requirementsArray,
        benefits: benefitsArray,
        logo: jobData.logo_url || null,
        logo_url: jobData.logo_url || null,
        application_url: jobData.application_url,
        contact_email: jobData.contact_email,
        is_remote: jobData.is_remote,
        featured: jobData.is_featured,
        is_featured: jobData.is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
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
    const { error } = await supabase.from('job_postings').insert(
      staticJobs.map(job => ({
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
      }))
    );

    if (error) throw error;
    console.log('Sample jobs seeded successfully');
  } catch (error) {
    console.error('Error seeding jobs:', error);
  }
};
