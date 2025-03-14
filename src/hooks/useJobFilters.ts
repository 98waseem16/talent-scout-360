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

  // The exact mapping between UI filter names and database field names
  const fieldMappings: Record<string, keyof Job> = {
    department: 'department',
    seniority: 'seniority_level', // This maps 'seniority' filter to 'seniority_level' field
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

  // Helper to normalize strings for comparison
  const normalizeString = (str: string | null | undefined): string => {
    if (str === null || str === undefined) return '';
    return String(str).trim().toLowerCase();
  };

  // Completely revised matching function for better type handling
  const matchesFilter = (job: Job, filterType: string, filterValue: string): boolean => {
    // If filter is set to 'all', always match
    if (filterValue === 'all') return true;
    
    // Get the field name from mappings
    const fieldName = fieldMappings[filterType];
    if (!fieldName) return true; // If we don't have a mapping, don't filter
    
    // Get the job field value - this is critical to fix
    const jobValue = job[fieldName as keyof Job];
    
    // For debugging
    console.log(`Filter matching for job ${job.id} (${job.title}):`, {
      filterType,
      filterValue,
      fieldName: String(fieldName),
      jobValue,
      jobValueType: typeof jobValue
    });
    
    // If the job value is missing, don't match specific filters
    if (jobValue === null || jobValue === undefined || jobValue === '') {
      return false;
    }
    
    // Get both values as normalized strings for comparison
    const normalizedJobValue = normalizeString(String(jobValue));
    const normalizedFilterValue = normalizeString(filterValue);
    
    // Check for exact or partial match
    const exactMatch = normalizedJobValue === normalizedFilterValue;
    const partialMatch = 
      normalizedJobValue.includes(normalizedFilterValue) || 
      normalizedFilterValue.includes(normalizedJobValue);
      
    const result = exactMatch || partialMatch;
    
    console.log(`Filter result for ${job.title} with ${filterType}=${filterValue}:`, {
      normalizedJobValue,
      normalizedFilterValue,
      matches: result
    });
    
    return result;
  };

  // Simplified filtering logic with better debugging
  const filteredJobs = jobs?.filter(job => {
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
    
    // Filter by each active filter
    for (const [filterType, filterValue] of Object.entries(filters)) {
      // Skip 'all' or false filters
      if (filterValue === 'all' || filterValue === false) continue;
      
      // Handle visa_sponsorship (boolean check) specially
      if (filterType === 'visaSponsorship') {
        if (job.visa_sponsorship !== true) return false;
        continue;
      }
      
      // For all other filters, use our improved matching function
      if (!matchesFilter(job, filterType, filterValue as string)) {
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
