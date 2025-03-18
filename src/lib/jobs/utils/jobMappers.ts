
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
  
  // Enhanced logging of raw database values to debug filtering issues
  console.log('Raw job field values from database:', {
    id: dbFields.id,
    title: dbFields.title,
    department: dbFields.department,
    seniority_level: dbFields.seniority_level,
    type: dbFields.type,
    raw_type: typeof dbFields.type
  });
  
  // Create a standardized job object with all fields properly converted to strings
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
    
    // Convert all filter fields to proper string values, never allow 'undefined'
    department: dbFields.department === null || dbFields.department === undefined ? '' : String(dbFields.department),
    seniority_level: dbFields.seniority_level === null || dbFields.seniority_level === undefined ? '' : String(dbFields.seniority_level),
    salary_range: dbFields.salary_range === null || dbFields.salary_range === undefined ? '' : String(dbFields.salary_range),
    team_size: dbFields.team_size === null || dbFields.team_size === undefined ? '' : String(dbFields.team_size),
    investment_stage: dbFields.investment_stage === null || dbFields.investment_stage === undefined ? '' : String(dbFields.investment_stage),
    remote_onsite: dbFields.remote_onsite === null || dbFields.remote_onsite === undefined ? '' : String(dbFields.remote_onsite),
    work_hours: dbFields.work_hours === null || dbFields.work_hours === undefined ? '' : String(dbFields.work_hours),
    equity: dbFields.equity === null || dbFields.equity === undefined ? '' : String(dbFields.equity),
    hiring_urgency: dbFields.hiring_urgency === null || dbFields.hiring_urgency === undefined ? '' : String(dbFields.hiring_urgency),
    revenue_model: dbFields.revenue_model === null || dbFields.revenue_model === undefined ? '' : String(dbFields.revenue_model),
    visa_sponsorship: dbFields.visa_sponsorship === true
  };
  
  // Add enhanced logging to verify mapped field values
  console.log('Job after mapping - filter field actual values:', {
    id: mappedJob.id,
    title: mappedJob.title,
    department: mappedJob.department,
    seniority_level: `"${mappedJob.seniority_level}"`,
    seniority_level_type: typeof mappedJob.seniority_level,
    type: mappedJob.type,
    type_type: typeof mappedJob.type
  });
  
  return mappedJob;
};
