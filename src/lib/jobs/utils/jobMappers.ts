
import { Job, JobDatabaseFields, JobFormData } from '../../types/job.types';
import { formatPostedDate } from '../../utils/dateUtils';

/**
 * Maps a database record to our frontend Job model
 */
export const mapDatabaseRecordToJob = (record: JobDatabaseFields): Job => {
  // Handle posted date formatting
  const postedDate = record.posted || record.created_at || new Date().toISOString();
  
  // Handle array fields that might be strings in the database
  const responsibilities = handleArrayField(record.responsibilities);
  const requirements = handleArrayField(record.requirements);
  const benefits = handleArrayField(record.benefits);

  return {
    id: record.id || '',
    title: record.title,
    company: record.company,
    location: record.location,
    salary: record.salary,
    type: record.type as 'Full-time' | 'Part-time' | 'Contract' | 'Remote',
    posted: formatPostedDate(postedDate),
    description: record.description,
    responsibilities,
    requirements,
    benefits,
    logo: record.logo,
    featured: record.featured,
    application_url: record.application_url || '', // Added application URL
    // Add additional fields
    user_id: record.user_id,
    investment_stage: record.investment_stage,
    team_size: record.team_size,
    revenue_model: record.revenue_model,
    department: record.department,
    seniority_level: record.seniority_level,
    job_type: record.job_type,
    salary_range: record.salary_range,
    equity: record.equity,
    remote_onsite: record.remote_onsite,
    work_hours: record.work_hours,
    visa_sponsorship: record.visa_sponsorship,
    hiring_urgency: record.hiring_urgency
  };
};

/**
 * Helper function to handle array fields that might be stored as strings in the database
 */
function handleArrayField(field: unknown): string[] {
  // If it's already an array, return it
  if (Array.isArray(field)) {
    return field;
  }
  
  // If it's a string (serialized JSON), parse it
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [field];
    } catch (e) {
      // If parsing fails, treat the string as a single item
      return [field];
    }
  }
  
  // Default to empty array if undefined or null
  return [];
}

/**
 * Maps our frontend Job model to the database fields
 */
export const mapJobToDatabaseRecord = (job: Partial<Job>): JobDatabaseFields => {
  return {
    title: job.title || '',
    company: job.company || '',
    location: job.location || '',
    type: job.type || 'Full-time',
    salary: job.salary || '',
    description: job.description || '',
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    benefits: job.benefits || [],
    logo: job.logo || '/placeholder.svg',
    featured: job.featured || false,
    application_url: job.application_url || '', // Added application URL
    user_id: job.user_id,
    investment_stage: job.investment_stage,
    team_size: job.team_size,
    revenue_model: job.revenue_model,
    department: job.department,
    seniority_level: job.seniority_level,
    job_type: job.job_type,
    salary_range: job.salary_range,
    equity: job.equity,
    remote_onsite: job.remote_onsite,
    work_hours: job.work_hours,
    visa_sponsorship: job.visa_sponsorship,
    hiring_urgency: job.hiring_urgency
  };
};

/**
 * Maps the job form data to database fields
 */
export const mapJobFormDataToDatabaseFields = (formData: JobFormData): JobDatabaseFields => {
  return {
    title: formData.title || '',
    company: formData.company || '',
    location: formData.location || '',
    type: formData.type || 'Full-time',
    salary: formData.salary || '',
    description: formData.description || '',
    responsibilities: formData.responsibilities || [],
    requirements: formData.requirements || [],
    benefits: formData.benefits || [],
    logo: formData.logo || '/placeholder.svg',
    featured: formData.featured || false,
    application_url: formData.application_url || '', // Added application URL
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
