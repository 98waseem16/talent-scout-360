
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Job } from '@/lib/types/job.types';

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

  // Debug filter state when it changes
  useEffect(() => {
    console.log('🧩 Current filters state:', JSON.stringify(filters, null, 2));
    
    // Log all active non-default filters
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => value !== 'all' && value !== false)
      .map(([key, value]) => `${key}="${value}"`);
      
    if (activeFilterKeys.length > 0) {
      console.log(`🔍 ACTIVE FILTERS: ${activeFilterKeys.join(', ')}`);
    }
  }, [filters]);

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
    console.log('🧹 Clearing all filters');
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

  const removeFilter = (type: string) => {
    console.log(`🗑️ Removing filter: ${type}`);
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

  // Improved job field access with logging
  const getJobFieldValue = (job: Job, fieldName: keyof Job): any => {
    const value = job[fieldName];
    
    // Only log for active filters
    const filterKey = fieldName as keyof JobFilters;
    if (filters[filterKey] !== 'all' && filters[filterKey] !== false) {
      console.log(`🔍 JOB FIELD CHECK: Job "${job.title}" ${String(fieldName)}=${value === undefined ? 'undefined' : `"${value}"`}`);
    }
    
    return value;
  };

  // IMPROVED FILTER MATCHING: Fixed handling of undefined values - critical fix
  const matchesFilter = (jobValue: any, filterValue: string): boolean => {
    // Return true for "all" filter
    if (filterValue === 'all') return true;
    
    // CRITICAL FIX: If job value is undefined, it shouldn't match any specific filter
    if (jobValue === undefined || jobValue === null || jobValue === '') {
      console.log(`❌ NO MATCH: job value is ${jobValue === undefined ? 'undefined' : 'null/empty'} vs filter "${filterValue}"`);
      return false;
    }
    
    // Convert to strings for comparison
    const jobValueStr = String(jobValue);
    const filterValueStr = String(filterValue);
    
    // Check for EXACT match first (preserve case exactly)
    const exactMatch = jobValueStr === filterValueStr;
    
    // Fall back to case-insensitive contains match
    const containsMatch = !exactMatch && 
                          jobValueStr.toLowerCase().includes(filterValueStr.toLowerCase());
    
    // Log matching details for debugging
    if (exactMatch) {
      console.log(`✅ EXACT MATCH: "${jobValueStr}" === "${filterValueStr}"`);
    } else if (containsMatch) {
      console.log(`✅ CONTAINS MATCH: "${jobValueStr}" contains "${filterValueStr}"`);
    } else {
      console.log(`❌ NO MATCH: "${jobValueStr}" vs "${filterValueStr}"`);
    }
    
    return exactMatch || containsMatch;
  };

  // Enhanced filtering with better debugging
  const filteredJobs = jobs?.filter(job => {
    // Text search filtering - case insensitive
    const searchFields = [
      job.title || '', 
      job.company || '', 
      job.description || ''
    ].map(field => field.toLowerCase());
    
    const normalizedSearchQuery = searchQuery.toLowerCase();
    const normalizedLocationQuery = locationQuery.toLowerCase();
    
    const matchesSearch = searchQuery === '' || 
      searchFields.some(field => field.includes(normalizedSearchQuery));
      
    const matchesLocation = locationQuery === '' ||
      (job.location || '').toLowerCase().includes(normalizedLocationQuery);
    
    if (!matchesSearch || !matchesLocation) {
      return false;
    }
    
    // Get active filter types (excluding search and location which were already checked)
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => {
        // For boolean visa_sponsorship, only consider active if true
        if (key === 'visa_sponsorship') return value === true;
        // For all other filters, consider active if not 'all'
        return value !== 'all'; 
      })
      .map(([key]) => key);
    
    // Only proceed with detailed filter checking if there are active filters
    if (activeFilterKeys.length > 0) {
      console.log(`\n🔎 FILTERING JOB: "${job.title}" (ID: ${job.id})`);
      
      // For each active filter, check if the job matches
      for (const filterKey of activeFilterKeys) {
        // Special handling for boolean filters
        if (filterKey === 'visa_sponsorship') {
          if (job.visa_sponsorship !== true) {
            console.log(`❌ VISA FILTER: Job does not offer visa sponsorship`);
            return false;
          }
          continue;
        }
        
        const jobFieldName = filterKey as keyof Job;
        const jobValue = getJobFieldValue(job, jobFieldName);
        const filterValue = filters[filterKey as keyof JobFilters];
        
        console.log(`🔍 CHECKING FILTER: ${filterKey}="${filterValue}" against job field value=${jobValue === undefined ? 'undefined' : `"${jobValue}"`}`);
        
        if (!matchesFilter(jobValue, filterValue as string)) {
          console.log(`❌ JOB REJECTED: Failed to match ${filterKey} filter`);
          return false;
        }
      }
      
      // If we get here, job passed all filters
      console.log(`✅ JOB MATCHED ALL FILTERS: "${job.title}"`);
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
