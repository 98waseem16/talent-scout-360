
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

  // This is a helper function to safely compare values for filtering
  const matchesFilter = (jobValue: any, filterValue: string): boolean => {
    // If filter is set to 'all', always match
    if (filterValue === 'all') return true;
    
    // If job value is missing, don't match specific filters
    if (jobValue === null || jobValue === undefined || jobValue === '') return false;
    
    // Case-insensitive string comparison
    return String(jobValue).toLowerCase() === filterValue.toLowerCase();
  };

  // Completely rewritten filtering logic with proper field mapping
  const filteredJobs = jobs?.filter(job => {
    // Log the job being filtered
    console.log(`Filtering job: ${job.title} (${job.id})`, {
      remote_filter: filters.remote,
      job_remote_value: job.remote_onsite,
    });
    
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
    
    // Department filter
    if (filters.department !== 'all' && !matchesFilter(job.department, filters.department)) {
      console.log(`Job failed department filter: ${job.department} vs ${filters.department}`);
      return false;
    }
    
    // Seniority level filter
    if (filters.seniority !== 'all' && !matchesFilter(job.seniority_level, filters.seniority)) {
      console.log(`Job failed seniority filter: ${job.seniority_level} vs ${filters.seniority}`);
      return false;
    }
    
    // Salary range filter
    if (filters.salaryRange !== 'all' && !matchesFilter(job.salary_range, filters.salaryRange)) {
      console.log(`Job failed salary range filter: ${job.salary_range} vs ${filters.salaryRange}`);
      return false;
    }
    
    // Team size filter
    if (filters.teamSize !== 'all' && !matchesFilter(job.team_size, filters.teamSize)) {
      console.log(`Job failed team size filter: ${job.team_size} vs ${filters.teamSize}`);
      return false;
    }
    
    // Investment stage filter
    if (filters.investmentStage !== 'all' && !matchesFilter(job.investment_stage, filters.investmentStage)) {
      console.log(`Job failed investment stage filter: ${job.investment_stage} vs ${filters.investmentStage}`);
      return false;
    }
    
    // Remote/Onsite filter
    if (filters.remote !== 'all' && !matchesFilter(job.remote_onsite, filters.remote)) {
      console.log(`Job failed remote/onsite filter: ${job.remote_onsite} vs ${filters.remote}`);
      return false;
    }
    
    // Job type filter
    if (filters.jobType !== 'all' && !matchesFilter(job.job_type, filters.jobType)) {
      console.log(`Job failed job type filter: ${job.job_type} vs ${filters.jobType}`);
      return false;
    }
    
    // Work hours filter
    if (filters.workHours !== 'all' && !matchesFilter(job.work_hours, filters.workHours)) {
      console.log(`Job failed work hours filter: ${job.work_hours} vs ${filters.workHours}`);
      return false;
    }
    
    // Equity filter
    if (filters.equity !== 'all' && !matchesFilter(job.equity, filters.equity)) {
      console.log(`Job failed equity filter: ${job.equity} vs ${filters.equity}`);
      return false;
    }
    
    // Hiring urgency filter
    if (filters.hiringUrgency !== 'all' && !matchesFilter(job.hiring_urgency, filters.hiringUrgency)) {
      console.log(`Job failed hiring urgency filter: ${job.hiring_urgency} vs ${filters.hiringUrgency}`);
      return false;
    }
    
    // Revenue model filter
    if (filters.revenueModel !== 'all' && !matchesFilter(job.revenue_model, filters.revenueModel)) {
      console.log(`Job failed revenue model filter: ${job.revenue_model} vs ${filters.revenueModel}`);
      return false;
    }
    
    // Visa sponsorship filter (boolean check)
    if (filters.visaSponsorship && job.visa_sponsorship !== true) {
      console.log(`Job failed visa sponsorship filter: ${job.visa_sponsorship} vs ${filters.visaSponsorship}`);
      return false;
    }
    
    // Job passed all filters
    console.log(`Job "${job.title}" passed all filters`);
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
