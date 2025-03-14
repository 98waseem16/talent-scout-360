
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
    job_type: formData.job_type || formData.type || 'Full-time', // Ensure job_type is populated
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
  
  // Make sure job_type is always populated from either job_type or type field
  const jobType = dbFields.job_type || dbFields.type || 'Full-time';
  
  // Log fields critical for filtering to help with debugging
  console.log('Mapping job fields for filtering:', {
    id: dbFields.id,
    title: dbFields.title,
    department: dbFields.department,
    seniority_level: dbFields.seniority_level,
    job_type: dbFields.job_type,
    type: dbFields.type,
    resultingJobType: jobType
  });
  
  // Create a standardized, normalized version of the job object
  const mappedJob = {
    id: dbFields.id,
    title: dbFields.title || '',
    company: dbFields.company || '',
    location: dbFields.location || '',
    salary: dbFields.salary || '',
    type: dbFields.type || jobType, // Ensure type is always populated
    posted: dbFields.posted || '',
    description: dbFields.description || '',
    responsibilities: Array.isArray(dbFields.responsibilities) ? dbFields.responsibilities : [],
    requirements: Array.isArray(dbFields.requirements) ? dbFields.requirements : [],
    benefits: Array.isArray(dbFields.benefits) ? dbFields.benefits : [],
    logo: dbFields.logo || '/placeholder.svg',
    featured: Boolean(dbFields.featured),
    application_url: dbFields.application_url || '',
    user_id: dbFields.user_id,
    
    // Normalize all filter fields - ensure they're strings and consistent casing
    department: formatFilterValue(dbFields.department),
    seniority_level: formatFilterValue(dbFields.seniority_level),
    job_type: formatFilterValue(jobType), // Use our normalized jobType
    salary_range: formatFilterValue(dbFields.salary_range),
    team_size: formatFilterValue(dbFields.team_size),
    investment_stage: formatFilterValue(dbFields.investment_stage),
    remote_onsite: formatFilterValue(dbFields.remote_onsite),
    work_hours: formatFilterValue(dbFields.work_hours),
    equity: formatFilterValue(dbFields.equity),
    hiring_urgency: formatFilterValue(dbFields.hiring_urgency),
    revenue_model: formatFilterValue(dbFields.revenue_model),
    visa_sponsorship: dbFields.visa_sponsorship === true
  };
  
  return mappedJob;
};

// Enhanced helper function to format filter values consistently
function formatFilterValue(value: any): string {
  if (value === null || value === undefined) return '';
  
  // Convert to string and trim whitespace
  const stringValue = String(value).trim();
  
  // Log problematic values for debugging
  if (stringValue === '') {
    console.log('Empty filter value after formatting:', { originalValue: value });
  }
  
  return stringValue;
}
