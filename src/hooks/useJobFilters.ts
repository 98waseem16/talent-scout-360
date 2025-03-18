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

  // Updated field name mappings to match the Job object properties exactly
  const fieldMappings: Record<string, keyof Job> = {
    department: 'department',
    seniority: 'seniority_level', // This is critical - UI uses 'seniority' but DB uses 'seniority_level'
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

  // Improved string normalization to handle edge cases
  const normalizeString = (str: string | null | undefined): string => {
    if (str === null || str === undefined) return '';
    return String(str).trim().toLowerCase();
  };

  // Enhanced function to get job field value with better logging
  const getJobFieldValue = (job: Job, filterType: string): any => {
    const fieldName = fieldMappings[filterType];
    if (!fieldName) {
      console.log(`No field mapping found for filter type: ${filterType}`);
      return null;
    }
    
    const value = job[fieldName as keyof Job];
    
    // Add detailed logging for seniority filter to help debug
    if (filterType === 'seniority') {
      console.log(`Getting field value for seniority using field name: ${String(fieldName)}`);
      console.log(`Job title: ${job.title}, Seniority value: "${value}", Type: ${typeof value}`);
    }
    
    return value;
  };

  // Improved matching logic with better output
  const matchesFilter = (jobValue: any, filterValue: string): boolean => {
    // Return true for "all" filter value
    if (filterValue === 'all') return true;
    
    // Check for empty job values
    if (jobValue === null || jobValue === undefined || jobValue === '') {
      return false;
    }
    
    const normalizedJobValue = normalizeString(jobValue);
    const normalizedFilterValue = normalizeString(filterValue);
    
    // Debug output for seniority filter
    if (normalizedFilterValue.includes('senior')) {
      console.log(`Senior filter - Job value: "${normalizedJobValue}" | Filter: "${normalizedFilterValue}"`);
    }
    
    // More flexible matching to handle partial matches
    return normalizedJobValue === normalizedFilterValue || 
           normalizedJobValue.includes(normalizedFilterValue) || 
           normalizedFilterValue.includes(normalizedJobValue);
  };

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
    
    // Field filter matching
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => value !== 'all' && value !== false)
      .map(([key]) => key);
    
    // Extra debugging for seniority level
    if (filters.seniority !== 'all') {
      console.log(`Seniority check for job "${job.title}" - Filter value: "${filters.seniority}", Job value: "${job.seniority_level}" (${typeof job.seniority_level})`);
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
      if (!matchesFilter(jobValue, filterValue as string)) {
        // Only log failures for Senior filter to reduce noise
        if (filterType === 'seniority' && (filterValue as string).toLowerCase().includes('senior')) {
          console.log(`Senior filter failed - Job title: "${job.title}", Job value: "${jobValue}", Filter: "${filterValue}"`);
        }
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
