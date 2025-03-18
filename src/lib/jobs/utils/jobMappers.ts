
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
  
  // CRITICAL FIX: Convert string values of "undefined" or "null" to empty strings
  const cleanStringField = (value: any): string => {
    if (value === null || value === undefined || value === "undefined" || value === "null") {
      return '';
    }
    return String(value);
  };
  
  // For debug purposes, show the original values for key filter fields
  console.log(`🔄 MAPPING JOB: "${dbFields.title}" (ID: ${dbFields.id})`);
  console.log(`  Original seniority_level: "${dbFields.seniority_level}" (${typeof dbFields.seniority_level})`);
  console.log(`  Original department: "${dbFields.department}" (${typeof dbFields.department})`);
  console.log(`  Original remote_onsite: "${dbFields.remote_onsite}" (${typeof dbFields.remote_onsite})`);
  console.log(`  Original type: "${dbFields.type}" (${typeof dbFields.type})`);
  
  // Create a standardized job object with proper value conversions
  const mappedJob = {
    id: dbFields.id,
    title: cleanStringField(dbFields.title),
    company: cleanStringField(dbFields.company),
    location: cleanStringField(dbFields.location),
    salary: cleanStringField(dbFields.salary),
    type: cleanStringField(dbFields.type) || 'Full-time',
    posted: cleanStringField(dbFields.posted),
    description: cleanStringField(dbFields.description),
    responsibilities: Array.isArray(dbFields.responsibilities) ? dbFields.responsibilities : [],
    requirements: Array.isArray(dbFields.requirements) ? dbFields.requirements : [],
    benefits: Array.isArray(dbFields.benefits) ? dbFields.benefits : [],
    logo: cleanStringField(dbFields.logo) || '/placeholder.svg',
    featured: Boolean(dbFields.featured),
    application_url: cleanStringField(dbFields.application_url),
    user_id: cleanStringField(dbFields.user_id),
    
    // Critical filter fields - ensure they're clean strings
    department: cleanStringField(dbFields.department),
    seniority_level: cleanStringField(dbFields.seniority_level),
    salary_range: cleanStringField(dbFields.salary_range),
    team_size: cleanStringField(dbFields.team_size),
    investment_stage: cleanStringField(dbFields.investment_stage),
    remote_onsite: cleanStringField(dbFields.remote_onsite),
    work_hours: cleanStringField(dbFields.work_hours),
    equity: cleanStringField(dbFields.equity),
    hiring_urgency: cleanStringField(dbFields.hiring_urgency),
    revenue_model: cleanStringField(dbFields.revenue_model),
    visa_sponsorship: Boolean(dbFields.visa_sponsorship)
  };
  
  // After mapping, log the critical fields to verify proper conversions
  console.log(`  Mapped seniority_level: "${mappedJob.seniority_level}" (${typeof mappedJob.seniority_level})`);
  console.log(`  Mapped department: "${mappedJob.department}" (${typeof mappedJob.department})`);
  console.log(`  Mapped remote_onsite: "${mappedJob.remote_onsite}" (${typeof mappedJob.remote_onsite})`);
  console.log(`  Mapped type: "${mappedJob.type}" (${typeof mappedJob.type})`);
  
  return mappedJob;
};
