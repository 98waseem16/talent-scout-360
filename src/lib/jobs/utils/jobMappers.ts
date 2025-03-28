
import { JobDatabaseFields, JobFormData, Job } from '../../types/job.types';

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

export const mapDatabaseFieldsToJob = (dbFields: any): Job | null => {
  if (!dbFields) {
    console.error('mapDatabaseFieldsToJob received null or undefined dbFields');
    return null;
  }
  
  // Log raw database values for debugging
  console.log(`📊 RAW DATABASE FIELDS for job "${dbFields.title}" (ID: ${dbFields.id}):`);
  console.log(`  seniority_level: "${dbFields.seniority_level || ''}"`);
  console.log(`  department: "${dbFields.department || ''}"`);
  console.log(`  remote_onsite: "${dbFields.remote_onsite || ''}"`);
  console.log(`  type: "${dbFields.type || ''}"`);
  console.log(`  salary_range: "${dbFields.salary_range || ''}"`);
  console.log(`  team_size: "${dbFields.team_size || ''}"`);
  console.log(`  work_hours: "${dbFields.work_hours || ''}"`);
  console.log(`  equity: "${dbFields.equity || ''}"`);
  console.log(`  hiring_urgency: "${dbFields.hiring_urgency || ''}"`);
  console.log(`  revenue_model: "${dbFields.revenue_model || ''}"`);
  console.log(`  visa_sponsorship: ${dbFields.visa_sponsorship ? 'true' : 'false'}`);
  
  // Simple helper to handle null/undefined values - always returns a string
  const cleanField = (value: any): string => {
    if (value === null || value === undefined) {
      return ''; // Return empty string for null/undefined
    }
    return String(value).trim(); // Return trimmed string for all other values
  };
  
  // Validate job type against allowed values, with fallback
  const validateJobType = (type: string): 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Freelance' | 'Internship' => {
    const validTypes: ('Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Freelance' | 'Internship')[] = [
      'Full-time', 'Part-time', 'Contract', 'Remote', 'Freelance', 'Internship'
    ];
    
    const cleanedType = cleanField(type);
    
    // Check if the cleaned type is one of the valid types
    if (validTypes.includes(cleanedType as any)) {
      return cleanedType as 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Freelance' | 'Internship';
    }
    
    console.warn(`Invalid job type "${type}", defaulting to "Full-time"`);
    return 'Full-time'; // Default to Full-time if not a valid type
  };
  
  // Create mapped job object with exact field naming
  const mappedJob: Job = {
    id: dbFields.id,
    title: cleanField(dbFields.title),
    company: cleanField(dbFields.company),
    location: cleanField(dbFields.location),
    salary: cleanField(dbFields.salary),
    type: validateJobType(dbFields.type),
    posted: cleanField(dbFields.posted),
    description: cleanField(dbFields.description),
    responsibilities: Array.isArray(dbFields.responsibilities) ? dbFields.responsibilities : [],
    requirements: Array.isArray(dbFields.requirements) ? dbFields.requirements : [],
    benefits: Array.isArray(dbFields.benefits) ? dbFields.benefits : [],
    logo: cleanField(dbFields.logo) || '/placeholder.svg',
    featured: Boolean(dbFields.featured),
    application_url: cleanField(dbFields.application_url),
    user_id: cleanField(dbFields.user_id),
    
    // Filter fields - ensure exact field names match
    department: cleanField(dbFields.department),
    seniority_level: cleanField(dbFields.seniority_level),
    salary_range: cleanField(dbFields.salary_range),
    team_size: cleanField(dbFields.team_size),
    investment_stage: cleanField(dbFields.investment_stage),
    remote_onsite: cleanField(dbFields.remote_onsite),
    work_hours: cleanField(dbFields.work_hours),
    equity: cleanField(dbFields.equity),
    hiring_urgency: cleanField(dbFields.hiring_urgency),
    revenue_model: cleanField(dbFields.revenue_model),
    visa_sponsorship: Boolean(dbFields.visa_sponsorship),
    job_type: cleanField(dbFields.type) // For backward compatibility
  };
  
  // Log mapped job data for debugging
  console.log(`📊 MAPPED JOB FIELDS for "${mappedJob.title}" (ID: ${mappedJob.id}):`);
  console.log(`  seniority_level: "${mappedJob.seniority_level}"`);
  console.log(`  department: "${mappedJob.department}"`);
  console.log(`  remote_onsite: "${mappedJob.remote_onsite}"`);
  console.log(`  type: "${mappedJob.type}"`);
  console.log(`  salary_range: "${mappedJob.salary_range}"`);
  console.log(`  team_size: "${mappedJob.team_size}"`);
  console.log(`  work_hours: "${mappedJob.work_hours}"`);
  console.log(`  equity: "${mappedJob.equity}"`);
  console.log(`  hiring_urgency: "${mappedJob.hiring_urgency}"`);
  console.log(`  revenue_model: "${mappedJob.revenue_model}"`);
  console.log(`  visa_sponsorship: ${mappedJob.visa_sponsorship ? 'true' : 'false'}`);
  
  return mappedJob;
};
