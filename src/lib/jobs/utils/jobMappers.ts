
import { JobDatabaseFields, JobFormData } from '../../types/job.types';

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
    job_type: formData.job_type || formData.type || 'Full-time',
    salary_range: formData.salary_range,
    equity: formData.equity,
    remote_onsite: formData.remote_onsite,
    work_hours: formData.work_hours,
    visa_sponsorship: formData.visa_sponsorship,
    hiring_urgency: formData.hiring_urgency
  };
};

export const mapDatabaseFieldsToJob = (dbFields: any) => {
  if (!dbFields) {
    console.error('mapDatabaseFieldsToJob received null or undefined dbFields');
    return null;
  }
  
  // Create a standardized, normalized version of the job object
  const mappedJob = {
    id: dbFields.id,
    title: dbFields.title || '',
    company: dbFields.company || '',
    location: dbFields.location || '',
    salary: dbFields.salary || '',
    type: dbFields.type || dbFields.job_type || 'Full-time', 
    posted: dbFields.posted || '',
    description: dbFields.description || '',
    responsibilities: Array.isArray(dbFields.responsibilities) ? dbFields.responsibilities : [],
    requirements: Array.isArray(dbFields.requirements) ? dbFields.requirements : [],
    benefits: Array.isArray(dbFields.benefits) ? dbFields.benefits : [],
    logo: dbFields.logo || '/placeholder.svg',
    featured: Boolean(dbFields.featured),
    application_url: dbFields.application_url || '',
    user_id: dbFields.user_id,
    
    // Normalize all filter fields for consistent filtering
    department: normalizeFilterField(dbFields.department),
    seniority_level: normalizeFilterField(dbFields.seniority_level),
    job_type: normalizeFilterField(dbFields.job_type) || normalizeFilterField(dbFields.type) || 'full-time',
    salary_range: normalizeFilterField(dbFields.salary_range),
    team_size: normalizeFilterField(dbFields.team_size),
    investment_stage: normalizeFilterField(dbFields.investment_stage),
    remote_onsite: normalizeFilterField(dbFields.remote_onsite),
    work_hours: normalizeFilterField(dbFields.work_hours),
    equity: normalizeFilterField(dbFields.equity),
    hiring_urgency: normalizeFilterField(dbFields.hiring_urgency),
    revenue_model: normalizeFilterField(dbFields.revenue_model),
    visa_sponsorship: dbFields.visa_sponsorship === true
  };
  
  return mappedJob;
};

// Helper function to normalize filter fields
function normalizeFilterField(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return String(value).trim().toLowerCase();
}
