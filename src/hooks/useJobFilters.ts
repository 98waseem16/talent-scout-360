
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

  // Helper function to safely compare string values
  const safeStringCompare = (a: any, b: string): boolean => {
    if (a === null || a === undefined) return false;
    return String(a).toLowerCase() === b.toLowerCase();
  };

  // Debug function to log details for troublesome filters
  const logFilterDebug = (jobId: string, fieldName: string, jobValue: any, filterValue: string, result: boolean) => {
    if (filterValue !== 'all') {
      console.log(`Filter Debug - ${fieldName}:`, { 
        jobId,
        filterValue, 
        jobValue,
        valueType: typeof jobValue,
        result
      });
    }
    return result;
  };

  // Improved filtering logic
  const filteredJobs = jobs?.filter(job => {
    console.log(`Filtering job: ${job.id} - ${job.title}`, job);

    // Basic text search filters
    const matchesSearch = searchQuery === '' || 
      (job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesLocation = locationQuery === '' ||
      (job.location && job.location.toLowerCase().includes(locationQuery.toLowerCase()));
    
    // If basic filters don't match, return early
    if (!matchesSearch || !matchesLocation) return false;
    
    // Department filter
    if (filters.department !== 'all') {
      const result = safeStringCompare(job.department, filters.department);
      logFilterDebug(job.id, 'department', job.department, filters.department, result);
      if (!result) return false;
    }
    
    // Seniority level filter
    if (filters.seniority !== 'all') {
      const result = safeStringCompare(job.seniority_level, filters.seniority);
      logFilterDebug(job.id, 'seniority_level', job.seniority_level, filters.seniority, result);
      if (!result) return false;
    }
    
    // Salary range filter
    if (filters.salaryRange !== 'all') {
      const result = safeStringCompare(job.salary_range, filters.salaryRange);
      logFilterDebug(job.id, 'salary_range', job.salary_range, filters.salaryRange, result);
      if (!result) return false;
    }
    
    // Team size filter
    if (filters.teamSize !== 'all') {
      const result = safeStringCompare(job.team_size, filters.teamSize);
      logFilterDebug(job.id, 'team_size', job.team_size, filters.teamSize, result);
      if (!result) return false;
    }
    
    // Investment stage filter
    if (filters.investmentStage !== 'all') {
      const result = safeStringCompare(job.investment_stage, filters.investmentStage);
      logFilterDebug(job.id, 'investment_stage', job.investment_stage, filters.investmentStage, result);
      if (!result) return false;
    }
    
    // Remote/Onsite filter
    if (filters.remote !== 'all') {
      const result = safeStringCompare(job.remote_onsite, filters.remote);
      logFilterDebug(job.id, 'remote_onsite', job.remote_onsite, filters.remote, result);
      if (!result) return false;
    }
    
    // Job type filter
    if (filters.jobType !== 'all') {
      const result = safeStringCompare(job.job_type, filters.jobType);
      logFilterDebug(job.id, 'job_type', job.job_type, filters.jobType, result);
      if (!result) return false;
    }
    
    // Work hours filter
    if (filters.workHours !== 'all') {
      const result = safeStringCompare(job.work_hours, filters.workHours);
      logFilterDebug(job.id, 'work_hours', job.work_hours, filters.workHours, result);
      if (!result) return false;
    }
    
    // Equity filter
    if (filters.equity !== 'all') {
      const result = safeStringCompare(job.equity, filters.equity);
      logFilterDebug(job.id, 'equity', job.equity, filters.equity, result);
      if (!result) return false;
    }
    
    // Hiring urgency filter
    if (filters.hiringUrgency !== 'all') {
      const result = safeStringCompare(job.hiring_urgency, filters.hiringUrgency);
      logFilterDebug(job.id, 'hiring_urgency', job.hiring_urgency, filters.hiringUrgency, result);
      if (!result) return false;
    }
    
    // Revenue model filter
    if (filters.revenueModel !== 'all') {
      const result = safeStringCompare(job.revenue_model, filters.revenueModel);
      logFilterDebug(job.id, 'revenue_model', job.revenue_model, filters.revenueModel, result);
      if (!result) return false;
    }
    
    // Visa sponsorship filter (boolean check)
    if (filters.visaSponsorship && job.visa_sponsorship !== true) {
      return false;
    }
    
    // If all filters passed, include the job
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
