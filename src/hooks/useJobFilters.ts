
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

  // Correct mapping between UI filter names and database field names
  const fieldMappings: Record<string, keyof Job> = {
    department: 'department',
    seniority: 'seniority_level',
    salaryRange: 'salary_range',
    teamSize: 'team_size',
    investmentStage: 'investment_stage',
    remote: 'remote_onsite',
    jobType: 'type', // Changed to use only 'type'
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

  // Improved matching function with better type handling
  const matchesFilter = (jobValue: any, filterValue: string, filterType: string, jobId: string): boolean => {
    // If filter is set to 'all', always match
    if (filterValue === 'all') return true;
    
    // Handle missing job values
    if (jobValue === null || jobValue === undefined || jobValue === '') {
      debugFilter(jobValue, filterValue, filterType, jobId, false);
      return false;
    }
    
    // Normalize both values for case-insensitive comparison
    const normalizedJobValue = normalizeString(jobValue);
    const normalizedFilterValue = normalizeString(filterValue);
    
    // Check for exact or partial match
    const exactMatch = normalizedJobValue === normalizedFilterValue;
    const partialMatch = normalizedJobValue.includes(normalizedFilterValue) || 
                        normalizedFilterValue.includes(normalizedJobValue);
    
    const result = exactMatch || partialMatch;
    debugFilter(jobValue, filterValue, filterType, jobId, result);
    return result;
  };

  // Get the correct job field value
  const getJobFieldValue = (job: Job, filterType: string): any => {
    const fieldName = fieldMappings[filterType];
    if (!fieldName) return null;
    
    // Log field access for debugging
    console.log(`Getting job field value for ${filterType} using field name: ${String(fieldName)}`);
    return job[fieldName as keyof Job];
  };

  // Improved filtering logic
  const filteredJobs = jobs?.filter(job => {
    // Debug job data when filters are active
    if (activeFilters.length > 0) {
      console.log(`Filtering job: ${job.id} - ${job.title}`, {
        title: job.title,
        department: job.department,
        seniority_level: job.seniority_level,
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
    
    // Get active filters (not 'all' or false)
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => value !== 'all' && value !== false)
      .map(([key]) => key);
    
    // Check each active filter
    for (const filterType of activeFilterKeys) {
      const filterValue = filters[filterType as keyof JobFilters];
      
      // For visa_sponsorship (boolean check)
      if (filterType === 'visaSponsorship') {
        if (job.visa_sponsorship !== true) {
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
