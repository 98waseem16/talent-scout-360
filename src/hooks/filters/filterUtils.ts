import { Job } from '@/lib/types/job.types';
import { FIELD_MAPPINGS } from './types';

// Helper function for string comparison
export const normalizeString = (str: string | null | undefined): string => {
  if (str === null || str === undefined) return '';
  return str.toString().trim().toLowerCase();
};

// Enhanced comparison function with better debugging
const compareValues = (jobValue: any, filterValue: any, fieldName: string): boolean => {
  if (typeof filterValue === 'boolean') {
    console.log(`🔍 Boolean comparison: field=${fieldName}, jobValue=${jobValue}, filterValue=${filterValue}`);
    return jobValue === filterValue;
  }
  
  const normalizedJobValue = normalizeString(jobValue);
  const normalizedFilterValue = normalizeString(filterValue);
  
  // Special handling for seniority level comparison
  if (fieldName === 'seniority_level') {
    console.log(`
🎯 Comparing seniority level:
- Job value: "${jobValue}" (normalized: "${normalizedJobValue}")
- Filter value: "${filterValue}" (normalized: "${normalizedFilterValue}")
    `);
    
    // Check for exact match first
    if (normalizedJobValue === normalizedFilterValue) {
      console.log('✅ Exact seniority match!');
      return true;
    }
    
    // Check for partial match
    const isMatch = normalizedJobValue.includes(normalizedFilterValue) || 
                   normalizedFilterValue.includes(normalizedJobValue);
                   
    console.log(isMatch ? '✅ Partial seniority match!' : '❌ No seniority match');
    return isMatch;
  }
  
  // For other fields, use exact match
  const isMatch = normalizedJobValue === normalizedFilterValue;
  console.log(`🔍 Standard comparison (${fieldName}):
    Job: "${jobValue}" -> "${normalizedJobValue}"
    Filter: "${filterValue}" -> "${normalizedFilterValue}"
    Result: ${isMatch ? '✅' : '❌'}
  `);
  
  return isMatch;
};

// Function to check if a job matches all filters
export const jobMatchesFilters = (job: Job, filters: Record<string, string | boolean>, searchQuery: string, locationQuery: string): boolean => {
  // Check search and location queries first
  const matchesSearch = !searchQuery || 
    normalizeString(job.title).includes(normalizeString(searchQuery)) ||
    normalizeString(job.company).includes(normalizeString(searchQuery)) ||
    normalizeString(job.description).includes(normalizeString(searchQuery));
    
  const matchesLocation = !locationQuery ||
    normalizeString(job.location).includes(normalizeString(locationQuery));
  
  if (!matchesSearch || !matchesLocation) {
    return false;
  }
  
  // Get active filters
  const activeFilterEntries = Object.entries(filters)
    .filter(([_, value]) => typeof value === 'boolean' ? value : value !== '');
  
  // No filters active - include this job
  if (activeFilterEntries.length === 0) {
    return true;
  }

  // Log active filters and job details for debugging
  console.log(`\n📊 Checking job "${job.title}" against filters:`, 
    activeFilterEntries.map(([key, value]) => `${key}: ${value}`).join(', '));
  
  // Check each active filter
  for (const [filterKey, filterValue] of activeFilterEntries) {
    const dbFieldName = FIELD_MAPPINGS[filterKey];
    
    if (!dbFieldName) {
      console.warn(`⚠️ No database field mapping found for filter key: ${filterKey}`);
      continue;
    }
    
    // Handle boolean visa_sponsorship separately
    if (filterKey === 'visaSponsorship') {
      if (filterValue === true && job[dbFieldName as keyof Job] !== true) {
        console.log(`❌ Job rejected: visa_sponsorship filter mismatch`);
        return false;
      }
      continue;
    }
    
    // Get the job's value for this field
    const jobValue = job[dbFieldName as keyof Job];
    
    // If job doesn't have this field or it's empty
    if (jobValue === undefined || jobValue === null || jobValue === '') {
      console.log(`❌ Job rejected: field "${dbFieldName}" is missing or empty in job`);
      return false;
    }
    
    // Use our improved comparison function
    if (!compareValues(jobValue, filterValue, dbFieldName)) {
      console.log(`❌ Job rejected: "${dbFieldName}" mismatch - Job: "${jobValue}", Filter: "${filterValue}"`);
      return false;
    }
  }
  
  // Job passed all filter checks
  console.log(`✅ Job "${job.title}" matched all filters`);
  return true;
};

// Function to generate array of active filters for display
export const generateActiveFilters = (filters: Record<string, string | boolean>, searchQuery: string, locationQuery: string): { type: string; label: string }[] => {
  return [
    ...(searchQuery ? [{ type: 'search', label: searchQuery }] : []),
    ...(locationQuery ? [{ type: 'location', label: locationQuery }] : []),
    ...(filters.department ? [{ type: 'department', label: filters.department as string }] : []),
    ...(filters.seniority ? [{ type: 'seniority', label: filters.seniority as string }] : []),
    ...(filters.salaryRange ? [{ type: 'salaryRange', label: filters.salaryRange as string }] : []),
    ...(filters.teamSize ? [{ type: 'teamSize', label: filters.teamSize as string }] : []),
    ...(filters.investmentStage ? [{ type: 'investmentStage', label: filters.investmentStage as string }] : []),
    ...(filters.remote ? [{ type: 'remote', label: filters.remote as string }] : []),
    ...(filters.jobType ? [{ type: 'jobType', label: filters.jobType as string }] : []),
    ...(filters.workHours ? [{ type: 'workHours', label: filters.workHours as string }] : []),
    ...(filters.equity ? [{ type: 'equity', label: filters.equity as string }] : []),
    ...(filters.hiringUrgency ? [{ type: 'hiringUrgency', label: filters.hiringUrgency as string }] : []),
    ...(filters.revenueModel ? [{ type: 'revenueModel', label: filters.revenueModel as string }] : []),
    ...(filters.visaSponsorship ? [{ type: 'visaSponsorship', label: 'Visa Sponsorship' }] : [])
  ];
};
