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
    department: '',
    seniority: '',
    salaryRange: '',
    teamSize: '',
    investmentStage: '',
    remote: '',
    jobType: '',
    workHours: '',
    equity: '',
    hiringUrgency: '',
    revenueModel: '',
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

  const clearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    clearAllFilters();
  };

  const clearAllFilters = () => {
    setFilters({
      department: '',
      seniority: '',
      salaryRange: '',
      teamSize: '',
      investmentStage: '',
      remote: '',
      jobType: '',
      workHours: '',
      equity: '',
      hiringUrgency: '',
      revenueModel: '',
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
        [type]: type === 'visaSponsorship' ? false : '' 
      }));
    }
  };

  // Generate the active filters display
  const activeFilters = [
    ...(searchQuery ? [{ type: 'search', label: `"${searchQuery}"` }] : []),
    ...(locationQuery ? [{ type: 'location', label: locationQuery }] : []),
    ...(filters.department ? [{ type: 'department', label: filters.department }] : []),
    ...(filters.seniority ? [{ type: 'seniority', label: filters.seniority }] : []),
    ...(filters.salaryRange ? [{ type: 'salaryRange', label: filters.salaryRange }] : []),
    ...(filters.teamSize ? [{ type: 'teamSize', label: filters.teamSize }] : []),
    ...(filters.investmentStage ? [{ type: 'investmentStage', label: filters.investmentStage }] : []),
    ...(filters.remote ? [{ type: 'remote', label: filters.remote }] : []),
    ...(filters.jobType ? [{ type: 'jobType', label: filters.jobType }] : []),
    ...(filters.workHours ? [{ type: 'workHours', label: filters.workHours }] : []),
    ...(filters.equity ? [{ type: 'equity', label: filters.equity }] : []),
    ...(filters.hiringUrgency ? [{ type: 'hiringUrgency', label: filters.hiringUrgency }] : []),
    ...(filters.revenueModel ? [{ type: 'revenueModel', label: filters.revenueModel }] : []),
    ...(filters.visaSponsorship ? [{ type: 'visaSponsorship', label: 'Visa Sponsorship' }] : [])
  ];

  // The exact mapping between UI filter names and database field names
  const fieldMappings: Record<string, keyof Job> = {
    department: 'department',
    seniority: 'seniority_level',
    salaryRange: 'salary_range',
    teamSize: 'team_size',
    investmentStage: 'investment_stage',
    remote: 'remote_onsite',
    jobType: 'type',
    workHours: 'work_hours',
    equity: 'equity',
    hiringUrgency: 'hiring_urgency',
    revenueModel: 'revenue_model',
    visaSponsorship: 'visa_sponsorship'
  };

  // Helper to normalize strings for comparison
  const normalizeString = (str: string | null | undefined): string => {
    if (str === null || str === undefined) return '';
    return str.toString().trim().toLowerCase();
  };

  // Enhanced debugging function to log filter information with proper type info
  const debugFilter = (jobValue: any, filterValue: string, filterType: string, jobId: string, result: boolean) => {
    console.log(`Filter debugging for job ${jobId} with ${filterType}:`, { 
      jobValue: String(jobValue), 
      jobValueType: typeof jobValue,
      normalizedJobValue: normalizeString(jobValue),
      filterValue,
      normalizedFilterValue: normalizeString(filterValue),
      matches: result
    });
  };

  // Get the correct job field value with proper fallbacks
  const getJobFieldValue = (job: Job, filterType: string): any => {
    const fieldName = fieldMappings[filterType];
    if (!fieldName) return null;
    
    // Get the value from the job
    let value = job[fieldName as keyof Job];
    
    // Handle special cases for field variations or missing values
    if (value === null || value === undefined || value === '') {
      switch (filterType) {
        case 'remote':
          // If remote_onsite is not set but type is Remote
          value = job.type === 'Remote' ? 'Fully Remote' : '';
          break;
        case 'salaryRange':
          // If salary_range is not set, try to derive from salary
          if (job.salary) {
            const salaryNum = typeof job.salary === 'string' 
              ? parseInt(job.salary.replace(/[^0-9]/g, '')) 
              : 0;
              
            if (salaryNum < 60000) value = '$40K-$60K';
            else if (salaryNum < 80000) value = '$60K-$80K';
            else if (salaryNum < 120000) value = '$80K-$120K';
            else value = '$120K+';
          }
          break;
        case 'department':
        case 'seniority':
        case 'teamSize':
        case 'investmentStage':
        case 'workHours':
        case 'equity':
        case 'hiringUrgency':
        case 'revenueModel':
          // For all other fields, check if alternative fields exist
          // or derive sensible defaults
          value = '';
          break;
      }
    }
    
    return value;
  };

  // Improved matching function with better handling of different value types
  const matchesFilter = (jobValue: any, filterValue: string, filterType: string, jobId: string): boolean => {
    // If filter value is empty, always match
    if (!filterValue) return true;
    
    // Extract primitive value from job value if it's an object
    let processedJobValue = jobValue;
    if (jobValue && typeof jobValue === 'object') {
      // Try to get a value property if it exists
      if ('value' in jobValue) {
        processedJobValue = jobValue.value;
      } else {
        // Otherwise stringify the object
        processedJobValue = JSON.stringify(jobValue);
      }
    }
    
    // If processed job value is still missing, apply more lenient matching for specific filters
    if (processedJobValue === null || processedJobValue === undefined || processedJobValue === '') {
      // Return false only for critical filters where a missing value shouldn't match
      // For non-critical filters, we might return true to show more results
      return false;
    }
    
    // Normalize both values for comparison
    const normalizedJobValue = normalizeString(processedJobValue);
    const normalizedFilterValue = normalizeString(filterValue);
    
    // Try for exact match first, then for partial match
    const exactMatch = normalizedJobValue === normalizedFilterValue;
    const partialMatch = normalizedJobValue.includes(normalizedFilterValue) || 
                        normalizedFilterValue.includes(normalizedJobValue);
    
    const result = exactMatch || partialMatch;
    // Debug only if there's an issue with matching
    if (!result) {
      debugFilter(jobValue, filterValue, filterType, jobId, result);
    }
    return result;
  };

  // Filtering logic with improved type checking and fallback mechanisms
  const filteredJobs = jobs?.filter(job => {
    // Debug job data for active filters
    if (activeFilters.length > 0) {
      console.log(`Filtering job: ${job.id} - ${job.title}`, {
        department: job.department,
        seniority_level: job.seniority_level,
        salary_range: job.salary_range,
        type: job.type,
        remote_onsite: job.remote_onsite,
        activeFilters: activeFilters.map(f => `${f.type}:${f.label}`).join(', ')
      });
    }

    // Basic text search filters
    const searchFields = [
      job.title || '', 
      job.company || '', 
      job.description || ''
    ].map(field => normalizeString(field));
    
    const matchesSearch = searchQuery === '' || 
      searchFields.some(field => field.includes(normalizeString(searchQuery)));
      
    const matchesLocation = locationQuery === '' ||
      normalizeString(job.location).includes(normalizeString(locationQuery));
    
    // If basic filters don't match, return early
    if (!matchesSearch || !matchesLocation) {
      return false;
    }
    
    // Get active filters (not empty or false)
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => {
        return typeof value === 'boolean' ? value : value !== '';
      })
      .map(([key]) => key);
    
    // Check each active filter
    for (const filterType of activeFilterKeys) {
      const filterValue = filters[filterType as keyof JobFilters];
      
      // For visa_sponsorship (boolean check)
      if (filterType === 'visaSponsorship') {
        const jobHasVisaSponsorship = job.visa_sponsorship === true;
        if (!jobHasVisaSponsorship) {
          return false;
        }
        continue;
      }
      
      // For all other filters (string comparison)
      const jobValue = getJobFieldValue(job, filterType);
      
      if (!matchesFilter(jobValue, filterValue as string, filterType, job.id)) {
        return false;
      }
    }
    
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
