
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
  
  // Log the exact field names and values for debugging
  console.log('DEBUG - Database field names and values:', Object.keys(dbFields).reduce((acc, key) => {
    acc[key] = typeof dbFields[key] === 'string' ? dbFields[key].toLowerCase() : dbFields[key];
    return acc;
  }, {} as Record<string, any>));
  
  // Ensure all fields are properly mapped and have appropriate fallbacks
  const mappedJob = {
    id: dbFields.id,
    title: dbFields.title || '',
    company: dbFields.company || '',
    location: dbFields.location || '',
    salary: dbFields.salary || '',
    type: dbFields.type || dbFields.job_type || 'Full-time', // Map both type and job_type for backwards compatibility
    posted: dbFields.posted || '',
    description: dbFields.description || '',
    responsibilities: Array.isArray(dbFields.responsibilities) ? dbFields.responsibilities : [],
    requirements: Array.isArray(dbFields.requirements) ? dbFields.requirements : [],
    benefits: Array.isArray(dbFields.benefits) ? dbFields.benefits : [],
    logo: dbFields.logo || '/placeholder.svg',
    featured: Boolean(dbFields.featured),
    application_url: dbFields.application_url || '',
    user_id: dbFields.user_id,
    
    // CRITICAL FIX: Ensure filter fields are properly mapped with consistent lowercase values
    department: dbFields.department ? String(dbFields.department).trim() : '',
    seniority_level: dbFields.seniority_level ? String(dbFields.seniority_level).trim() : '',
    job_type: dbFields.job_type ? String(dbFields.job_type).trim() : (dbFields.type ? String(dbFields.type).trim() : 'Full-time'),
    salary_range: dbFields.salary_range ? String(dbFields.salary_range).trim() : '',
    team_size: dbFields.team_size ? String(dbFields.team_size).trim() : '',
    investment_stage: dbFields.investment_stage ? String(dbFields.investment_stage).trim() : '',
    remote_onsite: dbFields.remote_onsite ? String(dbFields.remote_onsite).trim() : '',
    work_hours: dbFields.work_hours ? String(dbFields.work_hours).trim() : '',
    equity: dbFields.equity ? String(dbFields.equity).trim() : '',
    hiring_urgency: dbFields.hiring_urgency ? String(dbFields.hiring_urgency).trim() : '',
    revenue_model: dbFields.revenue_model ? String(dbFields.revenue_model).trim() : '',
    visa_sponsorship: dbFields.visa_sponsorship === true
  };
  
  console.log('DEBUG - After mapping - Mapped job filter fields:', {
    department: mappedJob.department,
    seniority_level: mappedJob.seniority_level,
    job_type: mappedJob.job_type,
    salary_range: mappedJob.salary_range,
    team_size: mappedJob.team_size,
    investment_stage: mappedJob.investment_stage,
    remote_onsite: mappedJob.remote_onsite,
    work_hours: mappedJob.work_hours,
    equity: mappedJob.equity,
    hiring_urgency: mappedJob.hiring_urgency,
    revenue_model: mappedJob.revenue_model,
    visa_sponsorship: mappedJob.visa_sponsorship
  });
  
  return mappedJob;
};
