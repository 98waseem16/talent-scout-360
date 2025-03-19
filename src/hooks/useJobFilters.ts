
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

  // CRITICAL: Debug filter state when it changes
  useEffect(() => {
    if (filters.seniority !== 'all') {
      console.log(`🔍 FILTER CHANGE: Seniority filter set to "${filters.seniority}"`);
    }
  }, [filters.seniority]);

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

  // FIXED: Exact field mappings from UI filter names to Job object property names
  // This is the critical fix - ensuring each UI filter key maps to the correct database field name
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

  // Improved string normalization with tracing
  const normalizeString = (str: string | null | undefined): string => {
    if (str === null || str === undefined) return '';
    return String(str).trim().toLowerCase();
  };

  // Get job field value with enhanced debug logging
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
      console.log(`🧪 FILTER CHECK: Job "${job.title}" (ID: ${job.id})`);
      console.log(`🧪 FILTER CHECK: Checking "${filterType}" filter using DB field "${String(fieldName)}"`);
      console.log(`🧪 FILTER CHECK: Raw DB value = "${value}" (${typeof value})`);
    }
    
    return value;
  };

  // Value matching logic with additional debugging
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
    if (normalizedJobValue === normalizedFilterValue) {
      if ((filterType === 'seniority' || filterType === 'department' || filterType === 'remote') 
          && filters[filterType as keyof JobFilters] !== 'all') {
        console.log(`✅ EXACT MATCH FOUND!`);
      }
      return true;
    }
    
    // Check if job value contains filter value
    if (normalizedJobValue.includes(normalizedFilterValue)) {
      if ((filterType === 'seniority' || filterType === 'department' || filterType === 'remote') 
          && filters[filterType as keyof JobFilters] !== 'all') {
        console.log(`✅ PARTIAL MATCH FOUND! Job value contains filter value`);
      }
      return true;
    }
    
    // Check if filter value contains job value (less common)
    if (normalizedFilterValue.includes(normalizedJobValue)) {
      if ((filterType === 'seniority' || filterType === 'department' || filterType === 'remote') 
          && filters[filterType as keyof JobFilters] !== 'all') {
        console.log(`✅ PARTIAL MATCH FOUND! Filter value contains job value`);
      }
      return true;
    }
    
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
    
    // Special debugging for problematic filters
    if (filters.seniority !== 'all' || filters.department !== 'all' || filters.remote !== 'all') {
      console.log(`\n📋 FILTERING JOB: "${job.title}" (ID: ${job.id})`);
      
      if (filters.seniority !== 'all') {
        console.log(`📋 Seniority filter value: "${filters.seniority}"`);
        console.log(`📋 Job seniority_level: "${job.seniority_level}" (${typeof job.seniority_level})`);
      }
      
      if (filters.department !== 'all') {
        console.log(`📋 Department filter value: "${filters.department}"`);
        console.log(`📋 Job department: "${job.department}" (${typeof job.department})`);
      }
      
      if (filters.remote !== 'all') {
        console.log(`📋 Remote filter value: "${filters.remote}"`);
        console.log(`📋 Job remote_onsite: "${job.remote_onsite}" (${typeof job.remote_onsite})`);
      }
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
      
      // Use the updated matchesFilter with filter type for debugging
      if (!matchesFilter(jobValue, filterValue as string, filterType)) {
        if ((filterType === 'seniority' || filterType === 'department' || filterType === 'remote') 
            && filters[filterType as keyof JobFilters] !== 'all') {
          console.log(`❌ JOB REJECTED: Failed "${filterType}" filter check`);
        }
        return false;
      } else if ((filterType === 'seniority' || filterType === 'department' || filterType === 'remote') 
                && filters[filterType as keyof JobFilters] !== 'all') {
        console.log(`✅ JOB ACCEPTED: Passed "${filterType}" filter check`);
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
