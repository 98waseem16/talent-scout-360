
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Job } from '@/lib/types/job.types';

// Define our filters interface to match UI components
interface JobFilters {
  department: string;
  seniority_level: string;
  salary_range: string;
  team_size: string;
  investment_stage: string;
  remote_onsite: string;
  type: string;
  work_hours: string;
  equity: string;
  hiring_urgency: string;
  revenue_model: string;
  visa_sponsorship: boolean;
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
  
  // Initialize all string filters to 'all' (meaning no filter applied)
  // and boolean filters to false - using names that match the database fields
  const [filters, setFilters] = useState<JobFilters>({
    department: 'all',
    seniority_level: 'all',
    salary_range: 'all',
    team_size: 'all',
    investment_stage: 'all',
    remote_onsite: 'all',
    type: 'all',
    work_hours: 'all',
    equity: 'all',
    hiring_urgency: 'all',
    revenue_model: 'all',
    visa_sponsorship: false
  });

  // Update URL when search or location changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    
    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, locationQuery, location.pathname]);

  // Log active filters for debugging
  useEffect(() => {
    console.log('Active filters:', filters);
  }, [filters]);

  // Clear all search and filters
  const clearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    clearAllFilters();
  };

  // Clear just the filters
  const clearAllFilters = () => {
    console.log('Clearing all filters');
    setFilters({
      department: 'all',
      seniority_level: 'all',
      salary_range: 'all',
      team_size: 'all',
      investment_stage: 'all',
      remote_onsite: 'all',
      type: 'all',
      work_hours: 'all',
      equity: 'all',
      hiring_urgency: 'all',
      revenue_model: 'all',
      visa_sponsorship: false
    });
  };

  // Remove a specific filter
  const removeFilter = (type: string) => {
    console.log(`Removing filter: ${type}`);
    if (type === 'search') {
      setSearchQuery('');
    } else if (type === 'location') {
      setLocationQuery('');
    } else {
      setFilters(prev => ({ 
        ...prev, 
        [type]: type === 'visa_sponsorship' ? false : 'all' 
      }));
    }
  };

  // Generate array of active filters for display
  const activeFilters = [
    ...(searchQuery ? [{ type: 'search', label: `"${searchQuery}"` }] : []),
    ...(locationQuery ? [{ type: 'location', label: locationQuery }] : []),
    ...(filters.department !== 'all' ? [{ type: 'department', label: filters.department }] : []),
    ...(filters.seniority_level !== 'all' ? [{ type: 'seniority_level', label: filters.seniority_level }] : []),
    ...(filters.salary_range !== 'all' ? [{ type: 'salary_range', label: filters.salary_range }] : []),
    ...(filters.team_size !== 'all' ? [{ type: 'team_size', label: filters.team_size }] : []),
    ...(filters.investment_stage !== 'all' ? [{ type: 'investment_stage', label: filters.investment_stage }] : []),
    ...(filters.remote_onsite !== 'all' ? [{ type: 'remote_onsite', label: filters.remote_onsite }] : []),
    ...(filters.type !== 'all' ? [{ type: 'type', label: filters.type }] : []),
    ...(filters.work_hours !== 'all' ? [{ type: 'work_hours', label: filters.work_hours }] : []),
    ...(filters.equity !== 'all' ? [{ type: 'equity', label: filters.equity }] : []),
    ...(filters.hiring_urgency !== 'all' ? [{ type: 'hiring_urgency', label: filters.hiring_urgency }] : []),
    ...(filters.revenue_model !== 'all' ? [{ type: 'revenue_model', label: filters.revenue_model }] : []),
    ...(filters.visa_sponsorship ? [{ type: 'visa_sponsorship', label: 'Visa Sponsorship' }] : [])
  ];

  // Helper to normalize strings for comparison
  const normalizeString = (str: string | null | undefined): string => {
    if (str === null || str === undefined) return '';
    return String(str).trim().toLowerCase();
  };

  // Enhanced getJobFieldValue function with better fallbacks
  const getJobFieldValue = (job: Job, filterName: string): any => {
    console.log(`Getting field value for "${filterName}" on job ${job.id}`);
    
    // Special handling for common field name variations
    switch(filterName) {
      case 'type':
        return job.type || null;
      case 'department':
        return job.department || null;
      case 'seniority_level':
        return job.seniority_level || null;
      case 'salary_range':
        return job.salary_range || null;
      case 'team_size':
        return job.team_size || null;
      case 'investment_stage':
        return job.investment_stage || null;
      case 'remote_onsite':
        return job.remote_onsite || null;
      case 'work_hours':
        return job.work_hours || null;
      case 'equity':
        return job.equity || null;
      case 'hiring_urgency':
        return job.hiring_urgency || null;
      case 'revenue_model':
        return job.revenue_model || null;
      case 'visa_sponsorship':
        return job.visa_sponsorship || null;
      default:
        console.warn(`Unknown filter name: ${filterName}`);
        return null;
    }
  };

  // Improved matchesFilter function with better matching logic
  const matchesFilter = (job: Job, filterName: keyof JobFilters, filterValue: string | boolean): boolean => {
    // For visa_sponsorship which is a boolean
    if (filterName === 'visa_sponsorship') {
      console.log(`Checking visa_sponsorship: job=${job.visa_sponsorship}, filter=${filterValue}`);
      // Only filter if visa_sponsorship is true in the filter
      if (filterValue === true) {
        return job.visa_sponsorship === true;
      }
      return true; // If filter is false, show all jobs
    }
    
    // For string filters, 'all' means no filter is applied
    if (filterValue === 'all') {
      return true;
    }
    
    // Get the job value for this filter
    const jobValue = getJobFieldValue(job, filterName);
    
    console.log(`Filter comparison for ${filterName}:`, {
      jobValue,
      filterValue,
      jobValueType: typeof jobValue
    });
    
    // If job doesn't have this field or it's empty, it doesn't match
    if (jobValue === null || jobValue === undefined || jobValue === '') {
      console.log(`Job ${job.id} has no value for ${filterName}`);
      return false;
    }
    
    // For string comparison, do a case-insensitive contains match
    const normalizedJobValue = normalizeString(jobValue);
    const normalizedFilterValue = normalizeString(filterValue as string);
    
    const isExactMatch = normalizedJobValue === normalizedFilterValue;
    const isPartialMatch = normalizedJobValue.includes(normalizedFilterValue) || 
                          normalizedFilterValue.includes(normalizedJobValue);
    
    const matches = isExactMatch || isPartialMatch;
    console.log(`${filterName} match result: ${matches} (exact: ${isExactMatch}, partial: ${isPartialMatch})`);
    
    return matches;
  };

  // Apply all filters to jobs
  const filteredJobs = jobs?.filter(job => {
    // Debug each job
    console.log(`Filtering job ${job.id} (${job.title})`, {
      department: job.department,
      seniority_level: job.seniority_level,
      type: job.type,
      remote_onsite: job.remote_onsite
    });
    
    // Search text filtering (case insensitive)
    const matchesSearch = !searchQuery || 
      [job.title, job.company, job.description]
        .filter(Boolean)
        .some(field => normalizeString(field).includes(normalizeString(searchQuery)));
    
    if (!matchesSearch) return false;
    
    // Location filtering (case insensitive)
    const matchesLocation = !locationQuery || 
      normalizeString(job.location).includes(normalizeString(locationQuery));
    
    if (!matchesLocation) return false;
    
    // For each active filter, check if job matches
    for (const [filterName, filterValue] of Object.entries(filters)) {
      // Skip 'all' values and false boolean values as these mean no filter
      if (filterValue === 'all' || filterValue === false) continue;
      
      // Check if job passes this specific filter
      if (!matchesFilter(job, filterName as keyof JobFilters, filterValue)) {
        console.log(`Job ${job.id} failed filter ${filterName}=${filterValue}`);
        return false;
      }
    }
    
    // If we get here, job passed all filters
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
