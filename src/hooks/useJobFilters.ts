
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

  // Updated field mappings using snake_case keys matching the database
  const fieldMappings: Record<string, string> = {
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

  const normalizeString = (str: string | null | undefined): string => {
    if (str === null || str === undefined) return '';
    return str.toString().trim().toLowerCase();
  };

  const filteredJobs = jobs?.filter(job => {
    // Log the job we're filtering for debugging
    console.log(`Filtering job ID ${job.id}: "${job.title}" at "${job.company}"`);
    
    // Check search and location queries first
    const matchesSearch = searchQuery === '' || 
      normalizeString(job.title).includes(normalizeString(searchQuery)) ||
      normalizeString(job.company).includes(normalizeString(searchQuery)) ||
      normalizeString(job.description).includes(normalizeString(searchQuery));
      
    const matchesLocation = locationQuery === '' ||
      normalizeString(job.location).includes(normalizeString(locationQuery));
    
    if (!matchesSearch || !matchesLocation) {
      console.log(`Job ${job.id}: Filtered out by search/location`);
      return false;
    }
    
    // Get active filters (only those with values)
    const activeFilterKeys = Object.entries(filters)
      .filter(([_, value]) => typeof value === 'boolean' ? value : value !== '')
      .map(([key]) => key);
    
    // No filters active - include this job
    if (activeFilterKeys.length === 0) {
      console.log(`Job ${job.id}: No filters active, including job`);
      return true;
    }
    
    console.log(`Job ${job.id}: Checking against ${activeFilterKeys.length} active filters: ${activeFilterKeys.join(', ')}`);
    
    // Check each active filter
    for (const filterKey of activeFilterKeys) {
      const jobField = fieldMappings[filterKey];
      const filterValue = filters[filterKey as keyof JobFilters];
      
      // Handle visa sponsorship separately (boolean)
      if (filterKey === 'visaSponsorship') {
        console.log(`Job ${job.id}: Checking visa_sponsorship: job=${job.visa_sponsorship}, filter=${filterValue}`);
        if (filterValue === true && job.visa_sponsorship !== true) {
          console.log(`Job ${job.id}: Filtered OUT by visa_sponsorship`);
          return false;
        }
        continue;
      }
      
      // Get the job's value for this field
      const jobValue = job[jobField as keyof Job];
      console.log(`Job ${job.id}: Checking "${filterKey}" (field="${jobField}"): job value="${jobValue}", filter value="${filterValue}"`);
      
      // If job doesn't have this field or it's empty
      if (jobValue === undefined || jobValue === null || jobValue === '') {
        console.log(`Job ${job.id}: Missing or empty value for "${jobField}", filtering out`);
        return false;
      }
      
      // Case-insensitive exact match for strings
      if (typeof jobValue === 'string' && typeof filterValue === 'string') {
        // Simple case-insensitive comparison
        if (normalizeString(jobValue) !== normalizeString(filterValue)) {
          console.log(`Job ${job.id}: "${jobField}" value "${jobValue}" doesn't match filter "${filterValue}"`);
          return false;
        } else {
          console.log(`Job ${job.id}: "${jobField}" value "${jobValue}" matches filter "${filterValue}"`);
        }
      }
    }
    
    console.log(`Job ${job.id}: PASSED all filters`);
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
