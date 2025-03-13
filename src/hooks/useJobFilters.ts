
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Job } from '@/lib/types/job.types';

interface JobFilters {
  department: string;
  seniority: string;
  salaryRange: string;
  teamSize: string;
  investmentStage: string;
  remote: string;
  jobType: string;
  workHours: string;
  equity: string;
  hiringUrgency: string;
  revenueModel: string;
  visaSponsorship: boolean;
}

interface UseJobFiltersReturn {
  searchQuery: string;
  locationQuery: string;
  filters: JobFilters;
  isFilterOpen: boolean;
  activeFilters: { type: string; label: string }[];
  filteredJobs: Job[];
  setSearchQuery: (query: string) => void;
  setLocationQuery: (location: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<JobFilters>>;
  setIsFilterOpen: (isOpen: boolean) => void;
  clearFilters: () => void;
  clearAllFilters: () => void;
  removeFilter: (type: string) => void;
}

export const useJobFilters = (jobs: Job[] | undefined): UseJobFiltersReturn => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('query') || '';
  const initialLocation = queryParams.get('location') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState<JobFilters>({
    department: 'all',
    seniority: 'all',
    salaryRange: 'all',
    teamSize: 'all',
    investmentStage: 'all',
    remote: 'all',
    jobType: 'all',
    workHours: 'all',
    equity: 'all',
    hiringUrgency: 'all',
    revenueModel: 'all',
    visaSponsorship: false
  });

  // Update URL with search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    
    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, locationQuery, location.pathname]);

  // Log filters when they change for debugging
  useEffect(() => {
    console.log('DEBUG - Current filters applied:', filters);
  }, [filters]);

  const clearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    clearAllFilters();
  };

  const clearAllFilters = () => {
    setFilters({
      department: 'all',
      seniority: 'all',
      salaryRange: 'all',
      teamSize: 'all',
      investmentStage: 'all',
      remote: 'all',
      jobType: 'all',
      workHours: 'all',
      equity: 'all',
      hiringUrgency: 'all',
      revenueModel: 'all',
      visaSponsorship: false
    });
  };

  const removeFilter = (type: string) => {
    if (type === 'search') {
      setSearchQuery('');
    } else if (type === 'location') {
      setLocationQuery('');
    } else {
      setFilters(prev => ({ 
        ...prev, 
        [type]: type === 'visaSponsorship' ? false : 'all' 
      }));
    }
  };

  // Generate the active filters display
  const activeFilters = [
    ...(searchQuery ? [{ type: 'search', label: `"${searchQuery}"` }] : []),
    ...(locationQuery ? [{ type: 'location', label: locationQuery }] : []),
    ...(filters.department !== 'all' ? [{ type: 'department', label: filters.department }] : []),
    ...(filters.seniority !== 'all' ? [{ type: 'seniority', label: filters.seniority }] : []),
    ...(filters.salaryRange !== 'all' ? [{ type: 'salaryRange', label: filters.salaryRange }] : []),
    ...(filters.teamSize !== 'all' ? [{ type: 'teamSize', label: filters.teamSize }] : []),
    ...(filters.investmentStage !== 'all' ? [{ type: 'investmentStage', label: filters.investmentStage }] : []),
    ...(filters.remote !== 'all' ? [{ type: 'remote', label: filters.remote }] : []),
    ...(filters.jobType !== 'all' ? [{ type: 'jobType', label: filters.jobType }] : []),
    ...(filters.workHours !== 'all' ? [{ type: 'workHours', label: filters.workHours }] : []),
    ...(filters.equity !== 'all' ? [{ type: 'equity', label: filters.equity }] : []),
    ...(filters.hiringUrgency !== 'all' ? [{ type: 'hiringUrgency', label: filters.hiringUrgency }] : []),
    ...(filters.revenueModel !== 'all' ? [{ type: 'revenueModel', label: filters.revenueModel }] : []),
    ...(filters.visaSponsorship ? [{ type: 'visaSponsorship', label: 'Visa Sponsorship' }] : [])
  ];

  // CRITICAL FIX: The exact mapping between UI filter names and database field names
  const fieldMappings: Record<string, keyof Job> = {
    department: 'department',
    seniority: 'seniority_level',
    salaryRange: 'salary_range',
    teamSize: 'team_size',
    investmentStage: 'investment_stage',
    remote: 'remote_onsite',
    jobType: 'job_type',
    workHours: 'work_hours',
    equity: 'equity',
    hiringUrgency: 'hiring_urgency',
    revenueModel: 'revenue_model',
    visaSponsorship: 'visa_sponsorship'
  };

  // Case-insensitive matching function with enhanced debugging
  const matchesFilter = (jobValue: any, filterValue: string): boolean => {
    // If filter is set to 'all', always match
    if (filterValue === 'all') return true;
    
    // If job value is missing, don't match specific filters
    if (jobValue === null || jobValue === undefined || jobValue === '') {
      console.log(`DEBUG - Filter match failed: job value is empty/null/undefined`);
      return false;
    }
    
    // Convert both to lowercase strings for case-insensitive comparison
    const jobValueStr = String(jobValue).toLowerCase().trim();
    const filterValueStr = filterValue.toLowerCase().trim();
    
    // Debug the actual values being compared
    console.log(`DEBUG - Comparing: Job value "${jobValueStr}" with filter "${filterValueStr}"`);
    
    // Check if the job value exactly matches or contains the filter value
    const exactMatch = jobValueStr === filterValueStr;
    const containsMatch = jobValueStr.includes(filterValueStr);
    
    console.log(`DEBUG - Match result: exact=${exactMatch}, contains=${containsMatch}`);
    
    return exactMatch || containsMatch;
  };

  // Get the correct job field value with better fallback handling
  const getJobFieldValue = (job: Job, filterType: string): any => {
    const fieldName = fieldMappings[filterType];
    if (!fieldName) {
      console.log(`DEBUG - No field mapping found for filter type: ${filterType}`);
      return null;
    }

    // Special case handling for job_type with fallback to type
    if (filterType === 'jobType') {
      return job.job_type || job.type;
    }
    
    const value = job[fieldName];
    console.log(`DEBUG - Field value for ${filterType} (${fieldName}):`, value);
    return value;
  };

  // Detailed filtered jobs logic with expanded logging for troubleshooting
  const filteredJobs = jobs?.filter(job => {
    // Detailed debugging for this specific job
    console.log(`\nDEBUG - Filtering job: "${job.title}" (${job.id})`);
    
    // Basic text search filters
    const searchFields = [
      job.title || '', 
      job.company || '', 
      job.description || ''
    ].map(field => field.toLowerCase());
    
    const matchesSearch = searchQuery === '' || 
      searchFields.some(field => field.includes(searchQuery.toLowerCase()));
      
    const matchesLocation = locationQuery === '' ||
      ((job.location || '').toLowerCase().includes(locationQuery.toLowerCase()));
    
    // If basic filters don't match, return early
    if (!matchesSearch || !matchesLocation) {
      console.log(`DEBUG - Job "${job.title}" filtered out: Search/Location mismatch`);
      return false;
    }
    
    // Get active filters (not 'all' or false)
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => value !== 'all' && value !== false)
      .map(([key]) => key);
    
    if (activeFilterKeys.length > 0) {
      console.log(`DEBUG - Checking against active filters:`, 
        activeFilterKeys.map(key => `${key}=${filters[key as keyof JobFilters]}`).join(', '));
    
      // Log all job field values for debugging
      console.log(`DEBUG - Job field values:`);
      Object.entries(fieldMappings).forEach(([filterKey, jobField]) => {
        console.log(`  ${filterKey} (${jobField}): ${job[jobField]}`);
      });
    }
    
    // Check each active filter
    for (const filterType of activeFilterKeys) {
      const filterValue = filters[filterType as keyof JobFilters];
      
      // For visa_sponsorship (boolean check)
      if (filterType === 'visaSponsorship') {
        const jobValue = job.visa_sponsorship === true;
        console.log(`DEBUG - Visa sponsorship: job has ${jobValue ? 'visa' : 'no visa'} sponsorship`);
        
        if (!jobValue) {
          console.log(`DEBUG - Job "${job.title}" filtered out: No visa sponsorship`);
          return false;
        }
        continue;
      }
      
      // For all other filters (string comparison)
      const jobValue = getJobFieldValue(job, filterType);
      
      // Skip invalid or empty values
      if (jobValue === null || jobValue === undefined || jobValue === '') {
        console.log(`DEBUG - Job "${job.title}" filtered out: No value for ${filterType}`);
        return false;
      }
      
      const result = matchesFilter(jobValue, filterValue as string);
      console.log(`DEBUG - Filter "${filterType}": comparing "${filterValue}" with job value "${jobValue}" - ${result ? 'MATCHED' : 'FAILED'}`);
      
      if (!result) {
        return false;
      }
    }
    
    console.log(`DEBUG - Job "${job.title}" MATCHES all filters`);
    return true;
  }) || [];

  return {
    searchQuery,
    locationQuery,
    filters,
    isFilterOpen,
    activeFilters,
    filteredJobs,
    setSearchQuery,
    setLocationQuery,
    setFilters,
    setIsFilterOpen,
    clearFilters,
    clearAllFilters,
    removeFilter
  };
};
