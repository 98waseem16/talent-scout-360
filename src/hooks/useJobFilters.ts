
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

  // Debug filter state when it changes
  useEffect(() => {
    console.log('🧩 Current filters state:', JSON.stringify(filters, null, 2));
    
    // Detailed logging for problem filters
    if (filters.seniority !== 'all') {
      console.log(`🔍 FILTER CHANGE: Seniority filter set to "${filters.seniority}"`);
    }
    if (filters.department !== 'all') {
      console.log(`🔍 FILTER CHANGE: Department filter set to "${filters.department}"`);
    }
    if (filters.remote !== 'all') {
      console.log(`🔍 FILTER CHANGE: Remote filter set to "${filters.remote}"`);
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
    console.log(`🗑️ Removing filter: ${type}`);
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

  // CRITICAL FIX: This is the key mapping between UI filter names and Job object property names
  const fieldMappings: Record<string, keyof Job> = {
    department: 'department',
    seniority: 'seniority_level',  // UI: seniority -> DB: seniority_level
    salaryRange: 'salary_range',   // UI: salaryRange -> DB: salary_range
    teamSize: 'team_size',         // UI: teamSize -> DB: team_size
    investmentStage: 'investment_stage', // UI: investmentStage -> DB: investment_stage
    remote: 'remote_onsite',       // UI: remote -> DB: remote_onsite
    jobType: 'type',               // UI: jobType -> DB: type
    workHours: 'work_hours',       // UI: workHours -> DB: work_hours
    equity: 'equity', 
    hiringUrgency: 'hiring_urgency', // UI: hiringUrgency -> DB: hiring_urgency
    revenueModel: 'revenue_model',   // UI: revenueModel -> DB: revenue_model
    visaSponsorship: 'visa_sponsorship' // UI: visaSponsorship -> DB: visa_sponsorship
  };

  // Debug helper for string normalization
  const normalizeString = (str: string | null | undefined): string => {
    if (str === null || str === undefined) return '';
    return String(str).trim().toLowerCase();
  };

  // Get job field value with better debugging
  const getJobFieldValue = (job: Job, filterType: string): any => {
    const fieldName = fieldMappings[filterType];
    if (!fieldName) {
      console.error(`Missing field mapping for filter type: ${filterType}`);
      return null;
    }
    
    const value = job[fieldName as keyof Job];
    
    // Add detailed logging for problematic filters
    if ((filterType === 'seniority' || filterType === 'department' || filterType === 'remote') 
        && filters[filterType as keyof JobFilters] !== 'all') {
      console.log(`🔍 FILTER CHECK: Job "${job.title}" field "${String(fieldName)}" = "${value}"`);
    }
    
    return value;
  };

  // Improved value matching logic with additional debugging
  const matchesFilter = (jobValue: any, filterValue: string, filterType: string): boolean => {
    // Return true for "all" filter
    if (filterValue === 'all') return true;
    
    // Check for empty job values
    if (jobValue === null || jobValue === undefined || jobValue === '') {
      if ((filterType === 'seniority' || filterType === 'department' || filterType === 'remote') 
          && filters[filterType as keyof JobFilters] !== 'all') {
        console.log(`❌ NO MATCH: Job value is empty/null/undefined`);
      }
      return false;
    }
    
    const normalizedJobValue = normalizeString(jobValue);
    const normalizedFilterValue = normalizeString(filterValue);
    
    // Enhanced debug for problematic filters
    if ((filterType === 'seniority' || filterType === 'department' || filterType === 'remote') 
        && filters[filterType as keyof JobFilters] !== 'all') {
      console.log(`🔍 MATCHING: Job value = "${normalizedJobValue}" | Filter value = "${normalizedFilterValue}"`);
    }
    
    // Check for exact match first (most important for enumerated values)
    const exactMatch = normalizedJobValue === normalizedFilterValue;
    if (exactMatch) {
      if ((filterType === 'seniority' || filterType === 'department' || filterType === 'remote') 
          && filters[filterType as keyof JobFilters] !== 'all') {
        console.log(`✅ EXACT MATCH FOUND!`);
      }
      return true;
    }
    
    // Check if job value contains filter value
    const containsMatch = normalizedJobValue.includes(normalizedFilterValue);
    if (containsMatch) {
      if ((filterType === 'seniority' || filterType === 'department' || filterType === 'remote') 
          && filters[filterType as keyof JobFilters] !== 'all') {
        console.log(`✅ PARTIAL MATCH FOUND! Job value contains filter value`);
      }
      return true;
    }
    
    // No match found
    if ((filterType === 'seniority' || filterType === 'department' || filterType === 'remote') 
        && filters[filterType as keyof JobFilters] !== 'all') {
      console.log(`❌ NO MATCH: Values don't match or contain each other`);
    }
    
    return false;
  };

  // More robust filtering with detailed logging
  const filteredJobs = jobs?.filter(job => {
    // Text search filtering
    const searchFields = [
      job.title || '', 
      job.company || '', 
      job.description || ''
    ].map(field => normalizeString(field));
    
    const matchesSearch = searchQuery === '' || 
      searchFields.some(field => field.includes(normalizeString(searchQuery)));
      
    const matchesLocation = locationQuery === '' ||
      normalizeString(job.location).includes(normalizeString(locationQuery));
    
    if (!matchesSearch || !matchesLocation) {
      return false;
    }
    
    // Get active filter types
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => value !== 'all' && value !== false)
      .map(([key]) => key);
    
    // Special debugging for active filters
    if (activeFilterKeys.length > 0) {
      console.log(`\n📋 FILTERING JOB: "${job.title}" (ID: ${job.id})`);
      console.log(`📋 Active filters: ${activeFilterKeys.join(', ')}`);
      
      // List job's actual values for debugging
      activeFilterKeys.forEach(filterType => {
        const dbFieldName = fieldMappings[filterType];
        const jobValue = job[dbFieldName as keyof Job];
        console.log(`📋 Job ${String(dbFieldName)} = "${jobValue}"`);
      });
    }
    
    // Check each active filter
    for (const filterType of activeFilterKeys) {
      const filterValue = filters[filterType as keyof JobFilters];
      
      // Special handling for boolean filters
      if (filterType === 'visaSponsorship') {
        if (job.visa_sponsorship !== true) {
          return false;
        }
        continue;
      }
      
      const jobValue = getJobFieldValue(job, filterType);
      
      // Use the improved matchesFilter with filter type for debugging
      if (!matchesFilter(jobValue, filterValue as string, filterType)) {
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
