
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
  
  // Log raw field values directly as primitive values
  console.log('Raw job field values from database:', {
    id: dbFields.id,
    title: dbFields.title,
    department: dbFields.department,
    seniority_level: dbFields.seniority_level,
    type: dbFields.type
  });
  
  // Create a standardized job object with all fields as their primitive values
  const mappedJob = {
    id: dbFields.id,
    title: dbFields.title || '',
    company: dbFields.company || '',
    location: dbFields.location || '',
    salary: dbFields.salary || '',
    type: dbFields.type || 'Full-time',
    posted: dbFields.posted || '',
    description: dbFields.description || '',
    responsibilities: Array.isArray(dbFields.responsibilities) ? dbFields.responsibilities : [],
    requirements: Array.isArray(dbFields.requirements) ? dbFields.requirements : [],
    benefits: Array.isArray(dbFields.benefits) ? dbFields.benefits : [],
    logo: dbFields.logo || '/placeholder.svg',
    featured: Boolean(dbFields.featured),
    application_url: dbFields.application_url || '',
    user_id: dbFields.user_id,
    
    // Always store these as primitive string values
    department: String(dbFields.department || ''),
    seniority_level: String(dbFields.seniority_level || ''),
    salary_range: String(dbFields.salary_range || ''),
    team_size: String(dbFields.team_size || ''),
    investment_stage: String(dbFields.investment_stage || ''),
    remote_onsite: String(dbFields.remote_onsite || ''),
    work_hours: String(dbFields.work_hours || ''),
    equity: String(dbFields.equity || ''),
    hiring_urgency: String(dbFields.hiring_urgency || ''),
    revenue_model: String(dbFields.revenue_model || ''),
    visa_sponsorship: dbFields.visa_sponsorship === true
  };
  
  // Log the mapped job to verify our transformations
  console.log('Job after mapping - field types:', {
    id: mappedJob.id,
    title: mappedJob.title,
    department: typeof mappedJob.department,
    seniority_level: typeof mappedJob.seniority_level,
    type: typeof mappedJob.type
  });
  
  return mappedJob;
};
