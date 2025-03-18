
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
    investment_stage: formData.investment_stage || '',
    team_size: formData.team_size || '',
    revenue_model: formData.revenue_model || '',
    department: formData.department || '',
    seniority_level: formData.seniority_level || '',
    salary_range: formData.salary_range || '',
    equity: formData.equity || '',
    remote_onsite: formData.remote_onsite || '',
    work_hours: formData.work_hours || '',
    visa_sponsorship: formData.visa_sponsorship || false,
    hiring_urgency: formData.hiring_urgency || ''
  };
};

export const mapDatabaseFieldsToJob = (dbFields: any) => {
  if (!dbFields) {
    console.error('mapDatabaseFieldsToJob received null or undefined dbFields');
    return null;
  }
  
  // Create a standardized job object with all fields properly converted
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
    user_id: dbFields.user_id || '',
    
    // Critical fix: Convert all null/undefined/empty values to empty strings
    // Never return "undefined" as a string value
    department: dbFields.department || '',
    seniority_level: dbFields.seniority_level || '',
    salary_range: dbFields.salary_range || '',
    team_size: dbFields.team_size || '',
    investment_stage: dbFields.investment_stage || '',
    remote_onsite: dbFields.remote_onsite || '',
    work_hours: dbFields.work_hours || '',
    equity: dbFields.equity || '',
    hiring_urgency: dbFields.hiring_urgency || '',
    revenue_model: dbFields.revenue_model || '',
    visa_sponsorship: Boolean(dbFields.visa_sponsorship)
  };
  
  // Log the mapped job for verification
  console.log('Job after mapping:', {
    id: mappedJob.id,
    title: mappedJob.title,
    department: mappedJob.department,
    department_type: typeof mappedJob.department,
    seniority_level: mappedJob.seniority_level,
    seniority_level_type: typeof mappedJob.seniority_level,
    type: mappedJob.type,
    type_type: typeof mappedJob.type,
    remote_onsite: mappedJob.remote_onsite,
    remote_onsite_type: typeof mappedJob.remote_onsite
  });
  
  return mappedJob;
};
