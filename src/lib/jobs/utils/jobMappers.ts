
import { Job, JobFormData, JobDatabaseFields } from '../../types/job.types';
import { formatPostedDate } from '../../utils/dateUtils';

/**
 * Maps database record to our frontend Job model
 */
export const mapDatabaseRecordToJob = (record: any): Job => {
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
export const mapJobFormDataToDatabaseFields = (formData: JobFormData): JobDatabaseFields => {
  // Handle array types properly with proper type checks
  let requirementsArray: string[] = [];
  if (Array.isArray(formData.requirements)) {
    requirementsArray = formData.requirements.filter(item => typeof item === 'string');
  } else if (typeof formData.requirements === 'string') {
    requirementsArray = formData.requirements.split('\n').filter(Boolean);
  }
  
  let benefitsArray: string[] = [];
  if (Array.isArray(formData.benefits)) {
    benefitsArray = formData.benefits.filter(item => typeof item === 'string');
  } else if (typeof formData.benefits === 'string') {
    benefitsArray = formData.benefits.split('\n').filter(Boolean);
  }
    
  let responsibilitiesArray: string[] = [];
  if (Array.isArray(formData.responsibilities)) {
    responsibilitiesArray = formData.responsibilities.filter(item => typeof item === 'string');
  } else if (typeof formData.responsibilities === 'string') {
    responsibilitiesArray = formData.responsibilities.split('\n').filter(Boolean);
  }

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
