
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

// Define exact field mappings from UI filters to database fields
const FIELD_MAPPINGS: Record<string, string> = {
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

  // Helper function to normalize string values for case-insensitive comparison
  const normalizeString = (str: string | null | undefined): string => {
    if (str === null || str === undefined) return '';
    return str.toString().trim().toLowerCase();
  };

  // Debug function to log job and filter values during comparison
  const logFilterDebug = (job: Job, filterKey: string, filterValue: any, jobValue: any, matched: boolean) => {
    console.log(`Filter Debug - Job ${job.id} - ${job.title}:`);
    console.log(`  Filter: ${filterKey} = "${filterValue}"`);
    console.log(`  Job value: ${FIELD_MAPPINGS[filterKey]} = "${jobValue}"`);
    console.log(`  Match result: ${matched ? 'MATCHED ✓' : 'FAILED ✗'}`);
  };

  const filteredJobs = jobs?.filter(job => {
    // Debug for this specific job
    console.log(`\nFiltering job: ${job.title} (${job.id})`);
    
    // Check search and location queries first
    const matchesSearch = !searchQuery || 
      normalizeString(job.title).includes(normalizeString(searchQuery)) ||
      normalizeString(job.company).includes(normalizeString(searchQuery)) ||
      normalizeString(job.description).includes(normalizeString(searchQuery));
      
    const matchesLocation = !locationQuery ||
      normalizeString(job.location).includes(normalizeString(locationQuery));
    
    if (!matchesSearch || !matchesLocation) {
      return false;
    }
    
    // Get active filters (only those with values)
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => typeof value === 'boolean' ? value : value !== '')
      .map(([key]) => key);
    
    // No filters active - include this job
    if (activeFilterKeys.length === 0) {
      return true;
    }
    
    console.log(`  Active filters: ${activeFilterKeys.join(', ')}`);
    
    // Check each active filter against job fields
    for (const filterKey of activeFilterKeys) {
      const dbFieldName = FIELD_MAPPINGS[filterKey];
      
      if (!dbFieldName) {
        console.warn(`Missing field mapping for filter: ${filterKey}`);
        continue;
      }
      
      const filterValue = filters[filterKey as keyof JobFilters];
      
      // Handle boolean visa_sponsorship separately
      if (filterKey === 'visaSponsorship') {
        if (filterValue === true && job[dbFieldName as keyof Job] !== true) {
          logFilterDebug(job, filterKey, filterValue, job[dbFieldName as keyof Job], false);
          return false;
        }
        continue;
      }
      
      // Get the job's value for this field using the snake_case DB field name
      const jobValue = job[dbFieldName as keyof Job];
      
      // If job doesn't have this field or it's empty
      if (jobValue === undefined || jobValue === null || jobValue === '') {
        logFilterDebug(job, filterKey, filterValue, jobValue, false);
        return false;
      }
      
      // Case-insensitive comparison for strings
      if (typeof jobValue === 'string' && typeof filterValue === 'string') {
        const normalized1 = normalizeString(jobValue);
        const normalized2 = normalizeString(filterValue);
        
        if (normalized1 !== normalized2) {
          logFilterDebug(job, filterKey, filterValue, jobValue, false);
          return false;
        }
        
        // Debug successful match
        logFilterDebug(job, filterKey, filterValue, jobValue, true);
      }
    }
    
    // Job passed all filter checks
    console.log(`  ✓ Job passed all filter checks: ${job.title}`);
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
