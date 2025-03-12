
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
    job_type: formData.job_type,
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
  
  // Detailed logging for job data mapping
  console.log('Raw database fields for job mapping:', JSON.stringify(dbFields, null, 2));
  
  // Ensure all fields are properly mapped and have appropriate fallbacks
  const mappedJob = {
    id: dbFields.id,
    title: dbFields.title || '',
    company: dbFields.company || '',
    location: dbFields.location || '',
    salary: dbFields.salary || '',
    type: dbFields.type || '',
    posted: dbFields.posted || '',
    description: dbFields.description || '',
    responsibilities: Array.isArray(dbFields.responsibilities) ? dbFields.responsibilities : [],
    requirements: Array.isArray(dbFields.requirements) ? dbFields.requirements : [],
    benefits: Array.isArray(dbFields.benefits) ? dbFields.benefits : [],
    logo: dbFields.logo || '/placeholder.svg',
    featured: Boolean(dbFields.featured),
    application_url: dbFields.application_url || '',
    user_id: dbFields.user_id,
    
    // Additional fields - ensure these are properly mapped for filtering
    investment_stage: dbFields.investment_stage || '',
    team_size: dbFields.team_size || '',
    revenue_model: dbFields.revenue_model || '',
    department: dbFields.department || '',
    seniority_level: dbFields.seniority_level || '',
    job_type: dbFields.job_type || '',
    salary_range: dbFields.salary_range || '',
    equity: dbFields.equity || '',
    remote_onsite: dbFields.remote_onsite || '',
    work_hours: dbFields.work_hours || '',
    visa_sponsorship: dbFields.visa_sponsorship === true,
    hiring_urgency: dbFields.hiring_urgency || ''
  };
  
  console.log('Mapped job object:', mappedJob);
  return mappedJob;
};
