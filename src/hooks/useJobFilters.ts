
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
    console.log('Filter values changed:', filters);
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

  // FIXED MAPPING: Correctly map UI filter names to actual job field names
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

  // Improved case-insensitive matching function with additional debugging
  const matchesFilter = (jobValue: any, filterValue: string): boolean => {
    // If filter is set to 'all', always match
    if (filterValue === 'all') return true;
    
    // If job value is missing, don't match specific filters
    if (jobValue === null || jobValue === undefined || jobValue === '') {
      return false;
    }
    
    // Convert both to lowercase strings for case-insensitive comparison
    const jobValueStr = String(jobValue).toLowerCase().trim();
    const filterValueStr = filterValue.toLowerCase().trim();
    
    // Check if the job value exactly matches or contains the filter value
    const exactMatch = jobValueStr === filterValueStr;
    const containsMatch = jobValueStr.includes(filterValueStr);
    
    return exactMatch || containsMatch;
  };

  // Get the correct job field value with better fallback handling
  const getJobFieldValue = (job: Job, filterType: string): any => {
    const fieldName = fieldMappings[filterType];
    if (!fieldName) return null;

    // Special case handling for job_type with fallback to type
    if (filterType === 'jobType') {
      return job.job_type || job.type;
    }
    
    return job[fieldName];
  };

  // Detailed filtered jobs logic with expanded logging for troubleshooting
  const filteredJobs = jobs?.filter(job => {
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
    if (!matchesSearch || !matchesLocation) return false;
    
    // Get active filters (not 'all' or false)
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => value !== 'all' && value !== false)
      .map(([key]) => key);
    
    if (activeFilterKeys.length > 0) {
      console.log(`Checking job "${job.title}" against active filters:`, 
        activeFilterKeys.map(key => `${key}=${filters[key as keyof JobFilters]}`).join(', '));
      
      // Log full job object for debugging
      console.log('Full job object:', job);
      
      // Log only the relevant job field values for active filters
      console.log('Job values for active filters:', activeFilterKeys.reduce((acc, key) => {
        const fieldValue = getJobFieldValue(job, key);
        return { ...acc, [key]: fieldValue, [fieldMappings[key]]: fieldValue };
      }, {}));
    }
    
    // Check each filter
    const filterResults = Object.entries(filters).map(([filterType, filterValue]) => {
      // Skip 'all' filters or false visa_sponsorship
      if (filterValue === 'all' || (filterType === 'visaSponsorship' && !filterValue)) {
        return { matches: true, filterType, filterValue };
      }
      
      // Get the corresponding job field value
      const jobValue = getJobFieldValue(job, filterType);
      
      // For visa_sponsorship (boolean check)
      if (filterType === 'visaSponsorship') {
        const result = Boolean(jobValue);
        if (filterValue === true) {
          console.log(`Visa sponsorship filter: Job has ${result ? 'visa sponsorship' : 'no visa sponsorship'}`);
        }
        return { 
          matches: result, 
          filterType, 
          filterValue, 
          jobValue: result 
        };
      }
      
      // For all other filters (string comparison)
      const result = matchesFilter(jobValue, filterValue as string);
      
      // Log detailed filter matching information
      if (filterValue !== 'all') {
        console.log(`Filter "${filterType}": comparing "${filterValue}" with job value "${jobValue}" - ${result ? 'MATCHED' : 'FAILED'}`);
      }
      
      return { 
        matches: result, 
        filterType, 
        filterValue, 
        jobValue 
      };
    });
    
    // Check if all filters match
    const allFiltersMatch = filterResults.every(result => result.matches);
    
    // Log which filters failed for debugging
    if (activeFilterKeys.length > 0) {
      const failedFilters = filterResults.filter(r => !r.matches);
      
      if (failedFilters.length > 0) {
        console.log(`Job "${job.title}" failed on filters:`, 
          failedFilters.map(f => `${f.filterType}=${f.filterValue}, job has: ${f.jobValue}`).join('; '));
      }
      
      console.log(`Job "${job.title}" ${allFiltersMatch ? 'MATCHES' : 'DOES NOT MATCH'} all filters`);
    }
    
    return allFiltersMatch;
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
