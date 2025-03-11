
import { JobDatabaseFields, JobFormData } from '../../types/job.types';

/**
 * Maps the JobFormData to the database fields
 */
export const mapJobFormDataToDatabaseFields = (
  formData: JobFormData
): JobDatabaseFields => {
  return {
    title: formData.title,
    company: formData.company,
    location: formData.location || '',
    type: formData.type || 'Full-time',
    salary: formData.salary || '',
    description: formData.description || '',
    responsibilities: formData.responsibilities || [],
    requirements: formData.requirements || [],
    benefits: formData.benefits || [],
    logo: formData.logo || '/placeholder.svg',
    featured: formData.featured || false,
    application_url: formData.application_url || '',
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
 * Maps the database fields to the Job type
 */
export const mapDatabaseFieldsToJob = (dbFields: any) => {
  return {
    id: dbFields.id,
    title: dbFields.title,
    company: dbFields.company,
    location: dbFields.location,
    salary: dbFields.salary,
    type: dbFields.type,
    posted: dbFields.posted,
    description: dbFields.description,
    responsibilities: dbFields.responsibilities,
    requirements: dbFields.requirements,
    benefits: dbFields.benefits,
    logo: dbFields.logo,
    featured: dbFields.featured,
    application_url: dbFields.application_url || '',
    user_id: dbFields.user_id,
    investment_stage: dbFields.investment_stage,
    team_size: dbFields.team_size,
    revenue_model: dbFields.revenue_model,
    department: dbFields.department,
    seniority_level: dbFields.seniority_level,
    job_type: dbFields.job_type,
    salary_range: dbFields.salary_range,
    equity: dbFields.equity,
    remote_onsite: dbFields.remote_onsite,
    work_hours: dbFields.work_hours,
    visa_sponsorship: dbFields.visa_sponsorship,
    hiring_urgency: dbFields.hiring_urgency
  };
};

/**
 * Maps the database fields to the JobFormData type
 */
export const mapDatabaseFieldsToJobFormData = (dbFields: any): JobFormData => {
  return {
    title: dbFields.title,
    company: dbFields.company,
    location: dbFields.location,
    type: dbFields.type,
    salary: dbFields.salary,
    description: dbFields.description,
    responsibilities: dbFields.responsibilities,
    requirements: dbFields.requirements,
    benefits: dbFields.benefits,
    logo: dbFields.logo,
    featured: dbFields.featured,
    application_url: dbFields.application_url || '',
    user_id: dbFields.user_id,
    investment_stage: dbFields.investment_stage,
    team_size: dbFields.team_size,
    revenue_model: dbFields.revenue_model,
    department: dbFields.department,
    seniority_level: dbFields.seniority_level,
    job_type: dbFields.job_type,
    salary_range: dbFields.salary_range,
    equity: dbFields.equity,
    remote_onsite: dbFields.remote_onsite,
    work_hours: dbFields.work_hours,
    visa_sponsorship: dbFields.visa_sponsorship,
    hiring_urgency: dbFields.hiring_urgency
  };
};
