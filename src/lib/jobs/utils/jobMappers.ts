
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

export const mapDatabaseFieldsToJob = (dbFields: any) => {
  if (!dbFields) {
    console.error('mapDatabaseFieldsToJob received null or undefined dbFields');
    return null;
  }
  
  // CRITICAL: Print actual database values for debugging
  console.log(`🔄 DEBUG - Original Job Fields for "${dbFields.title}" (ID: ${dbFields.id}):`);
  console.log(`  seniority_level: "${dbFields.seniority_level}" (${typeof dbFields.seniority_level})`);
  console.log(`  department: "${dbFields.department}" (${typeof dbFields.department})`);
  console.log(`  remote_onsite: "${dbFields.remote_onsite}" (${typeof dbFields.remote_onsite})`);
  console.log(`  type: "${dbFields.type}" (${typeof dbFields.type})`);
  
  // Enhanced field cleaning function to standardize values
  const cleanStringField = (value: any): string => {
    if (value === null || value === undefined || value === "undefined" || value === "null") {
      return '';
    }
    return String(value).trim(); // Don't lowercase - preserve exact casing
  };
  
  // Validation functions for each filter type with preserving exact casing
  const validateJobType = (typeValue: any): 'Full-time' | 'Part-time' | 'Contract' | 'Remote' => {
    const cleanType = cleanStringField(typeValue);
    const validTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
    
    // Exact case-sensitive matching
    if (validTypes.includes(cleanType)) {
      return cleanType as 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
    }
    
    console.warn(`Invalid job type "${cleanType}" - defaulting to "Full-time"`);
    return 'Full-time'; // Default to Full-time if invalid
  };
  
  // Validate department to ensure it matches one of our allowed values with exact casing
  const validateDepartment = (value: any): string => {
    const cleanValue = cleanStringField(value);
    const validDepartments = [
      'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
      'Operations', 'HR', 'Customer Support', 'Legal', 'Finance'
    ];
    
    // For department, preserve the exact case from the database
    if (cleanValue && !validDepartments.includes(cleanValue)) {
      console.warn(`Unusual department value: "${cleanValue}"`);
    }
    
    return cleanValue;
  };
  
  // Validate seniority level to ensure it matches one of our allowed values with exact casing
  const validateSeniorityLevel = (value: any): string => {
    const cleanValue = cleanStringField(value);
    const validLevels = [
      'Internship', 'Entry-Level', 'Mid-Level', 'Senior', 
      'Lead', 'Director', 'VP', 'C-Level'
    ];
    
    // Preserve exact case from the database
    if (cleanValue && !validLevels.includes(cleanValue)) {
      console.warn(`Unusual seniority level: "${cleanValue}"`);
    }
    
    return cleanValue;
  };
  
  // Validate remote/onsite to ensure it matches one of our allowed values with exact casing
  const validateRemoteOnsite = (value: any): string => {
    const cleanValue = cleanStringField(value);
    const validOptions = ['Fully Remote', 'Hybrid', 'Onsite'];
    
    // Preserve exact case from the database
    if (cleanValue && !validOptions.includes(cleanValue)) {
      console.warn(`Unusual remote/onsite value: "${cleanValue}"`);
    }
    
    return cleanValue;
  };
  
  // Create a standardized job object with proper value conversions - preserving exact casing
  const mappedJob = {
    id: dbFields.id,
    title: cleanStringField(dbFields.title),
    company: cleanStringField(dbFields.company),
    location: cleanStringField(dbFields.location),
    salary: cleanStringField(dbFields.salary),
    type: validateJobType(dbFields.type),
    posted: cleanStringField(dbFields.posted),
    description: cleanStringField(dbFields.description),
    responsibilities: Array.isArray(dbFields.responsibilities) ? dbFields.responsibilities : [],
    requirements: Array.isArray(dbFields.requirements) ? dbFields.requirements : [],
    benefits: Array.isArray(dbFields.benefits) ? dbFields.benefits : [],
    logo: cleanStringField(dbFields.logo) || '/placeholder.svg',
    featured: Boolean(dbFields.featured),
    application_url: cleanStringField(dbFields.application_url),
    user_id: cleanStringField(dbFields.user_id),
    
    // Critical filter fields - ensure they're clean strings with preserved casing
    department: validateDepartment(dbFields.department),
    seniority_level: validateSeniorityLevel(dbFields.seniority_level),
    salary_range: cleanStringField(dbFields.salary_range),
    team_size: cleanStringField(dbFields.team_size),
    investment_stage: cleanStringField(dbFields.investment_stage),
    remote_onsite: validateRemoteOnsite(dbFields.remote_onsite),
    work_hours: cleanStringField(dbFields.work_hours),
    equity: cleanStringField(dbFields.equity),
    hiring_urgency: cleanStringField(dbFields.hiring_urgency),
    revenue_model: cleanStringField(dbFields.revenue_model),
    visa_sponsorship: Boolean(dbFields.visa_sponsorship)
  };
  
  // After mapping, log the critical fields to verify proper conversions
  console.log(`🔄 DEBUG - Mapped Job Fields for "${mappedJob.title}" (ID: ${mappedJob.id}):`);
  console.log(`  seniority_level: "${mappedJob.seniority_level}" (${typeof mappedJob.seniority_level})`);
  console.log(`  department: "${mappedJob.department}" (${typeof mappedJob.department})`);
  console.log(`  remote_onsite: "${mappedJob.remote_onsite}" (${typeof mappedJob.remote_onsite})`);
  console.log(`  type: "${mappedJob.type}" (${typeof mappedJob.type})`);
  
  return mappedJob;
};
