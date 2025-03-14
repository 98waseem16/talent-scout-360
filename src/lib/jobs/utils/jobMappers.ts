
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
  
  // Log raw job fields from the database for debugging
  console.log('Job fields from database:', {
    id: dbFields.id,
    title: dbFields.title,
    department: dbFields.department,
    department_type: typeof dbFields.department,
    seniority_level: dbFields.seniority_level,
    seniority_type: typeof dbFields.seniority_level,
    job_type: dbFields.job_type,
    type: dbFields.type
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
    
    // Ensure all filter fields are primitive strings, not objects
    department: formatFilterValue(dbFields.department),
    seniority_level: formatFilterValue(dbFields.seniority_level),
    job_type: formatFilterValue(jobType),
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
  
  // Debug the mapped job
  console.log('Job after mapping:', {
    id: mappedJob.id,
    title: mappedJob.title,
    department: mappedJob.department,
    seniority_level: mappedJob.seniority_level,
    job_type: mappedJob.job_type
  });
  
  return mappedJob;
};

// Improved helper function to ensure all filter values are simple strings
function formatFilterValue(value: any): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }
  
  // Handle objects that might contain values
  if (typeof value === 'object') {
    // Try to extract a value property if it exists
    if (value && 'value' in value) {
      return formatFilterValue(value.value);
    }
    
    // If it's an object with a toString method that doesn't return [object Object]
    const stringValue = String(value);
    if (stringValue !== '[object Object]') {
      return stringValue.trim();
    }
    
    // For other objects, return an empty string
    return '';
  }
  
  // For non-objects, ensure we return a trimmed string
  return String(value).trim();
}
