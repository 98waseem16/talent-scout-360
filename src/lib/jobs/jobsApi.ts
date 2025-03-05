import { supabase } from '@/integrations/supabase/client';
import { Job, JobFormData, JobDatabaseFields } from '../types/job.types';
import { staticJobs } from '../data/staticJobs';
import { formatPostedDate } from '../utils/dateUtils';

/**
 * Maps database record to our frontend Job model
 */
const mapDatabaseRecordToJob = (record: any): Job => {
  return {
    id: record.id,
    title: record.title,
    company: record.company,
    location: record.location || '',
    salary: record.salary || '',
    type: record.type as 'Full-time' | 'Part-time' | 'Contract' | 'Remote',
    posted: formatPostedDate(record.posted || record.created_at),
    description: record.description,
    responsibilities: Array.isArray(record.responsibilities) ? record.responsibilities : [],
    requirements: Array.isArray(record.requirements) ? record.requirements : [],
    benefits: Array.isArray(record.benefits) ? record.benefits : [],
    logo: record.logo || '',
    featured: record.featured || false,
    user_id: record.user_id,
    investment_stage: record.investment_stage || '',
    team_size: record.team_size || '',
    revenue_model: record.revenue_model || '',
    department: record.department || '',
    seniority_level: record.seniority_level || '',
    job_type: record.job_type || '',
    salary_range: record.salary_range || '',
    equity: record.equity || '',
    remote_onsite: record.remote_onsite || '',
    work_hours: record.work_hours || '',
    visa_sponsorship: record.visa_sponsorship || false,
    hiring_urgency: record.hiring_urgency || ''
  };
};

/**
 * Maps our frontend model to database fields
 */
const mapJobFormDataToDatabaseFields = (formData: JobFormData): JobDatabaseFields => {
  // Format the requirements and benefits as arrays
  const requirementsArray = formData.requirements 
    ? (typeof formData.requirements === 'string' 
        ? formData.requirements.split('\n').filter(Boolean) 
        : formData.requirements)
    : [];
  
  const benefitsArray = formData.benefits 
    ? (typeof formData.benefits === 'string' 
        ? formData.benefits.split('\n').filter(Boolean) 
        : formData.benefits)
    : [];
    
  const responsibilitiesArray = formData.responsibilities 
    ? (typeof formData.responsibilities === 'string' 
        ? formData.responsibilities.split('\n').filter(Boolean) 
        : formData.responsibilities)
    : [];

  return {
    title: formData.title,
    company: formData.company,
    location: formData.location,
    type: formData.type,
    salary: formData.salary,
    description: formData.description,
    requirements: requirementsArray,
    benefits: benefitsArray,
    responsibilities: responsibilitiesArray,
    logo: formData.logo || '',
    featured: formData.featured || false,
    user_id: formData.user_id,
    investment_stage: formData.investment_stage,
    team_size: formData.team_size,
    revenue_model: formData.revenue_model,
    department: formData.department,
    seniority_level: formData.seniority_level,
    job_type: formData.job_type,
    salary_range: formData.salary_range,
    equity: formData.equity,
    remote_onsite: formData.remote_onsite,
    work_hours: formData.work_hours,
    visa_sponsorship: formData.visa_sponsorship,
    hiring_urgency: formData.hiring_urgency
  };
};

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

    // Map database records to our frontend Job model
    const jobs = data.map(record => mapDatabaseRecordToJob(record));
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

    // Map database records to our frontend Job model
    const jobs = data.map(record => mapDatabaseRecordToJob(record));
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

    return mapDatabaseRecordToJob(data);
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
    // Map frontend data to database fields
    const dbFields = mapJobFormDataToDatabaseFields(jobData);
    
    const { data, error } = await supabase
      .from('job_postings')
      .insert(dbFields)
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
