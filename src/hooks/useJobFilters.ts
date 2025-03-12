
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

  // Fixed function to safely compare string values (case-insensitive)
  const safeStringCompare = (jobValue: any, filterValue: string): boolean => {
    if (jobValue === null || jobValue === undefined || jobValue === '') return false;
    if (filterValue === 'all') return true;
    
    return String(jobValue).toLowerCase() === filterValue.toLowerCase();
  };

  // Conditional debug logging for specific job filters
  const logFilterMismatch = (job: Job, filterName: string, jobValue: any, filterValue: string) => {
    if (filterValue !== 'all' && !safeStringCompare(jobValue, filterValue)) {
      console.log(`Filter mismatch - ${filterName}:`, { 
        jobId: job.id,
        title: job.title,
        filterName, 
        filterValue, 
        jobValue,
        valueType: typeof jobValue
      });
    }
  };

  // Completely rewritten filtering logic with proper field mapping
  const filteredJobs = jobs?.filter(job => {
    // First, verify the job has all expected data
    if (!job || !job.id) {
      console.warn('Invalid job object found in jobs array:', job);
      return false;
    }
    
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
    
    // Log when starting to filter a specific job
    console.log(`Filtering job "${job.title}" (${job.id})`, {
      department: { filter: filters.department, jobValue: job.department },
      seniority: { filter: filters.seniority, jobValue: job.seniority_level },
      salaryRange: { filter: filters.salaryRange, jobValue: job.salary_range },
      remote: { filter: filters.remote, jobValue: job.remote_onsite },
      // Add more fields as needed
    });
    
    // Department filter
    if (filters.department !== 'all') {
      logFilterMismatch(job, 'department', job.department, filters.department);
      if (!safeStringCompare(job.department, filters.department)) return false;
    }
    
    // Seniority level filter (maps to seniority_level in job data)
    if (filters.seniority !== 'all') {
      logFilterMismatch(job, 'seniority_level', job.seniority_level, filters.seniority);
      if (!safeStringCompare(job.seniority_level, filters.seniority)) return false;
    }
    
    // Salary range filter (maps to salary_range in job data)
    if (filters.salaryRange !== 'all') {
      logFilterMismatch(job, 'salary_range', job.salary_range, filters.salaryRange);
      if (!safeStringCompare(job.salary_range, filters.salaryRange)) return false;
    }
    
    // Team size filter (maps to team_size in job data)
    if (filters.teamSize !== 'all') {
      logFilterMismatch(job, 'team_size', job.team_size, filters.teamSize);
      if (!safeStringCompare(job.team_size, filters.teamSize)) return false;
    }
    
    // Investment stage filter (maps to investment_stage in job data)
    if (filters.investmentStage !== 'all') {
      logFilterMismatch(job, 'investment_stage', job.investment_stage, filters.investmentStage);
      if (!safeStringCompare(job.investment_stage, filters.investmentStage)) return false;
    }
    
    // Remote/Onsite filter (maps to remote_onsite in job data)
    if (filters.remote !== 'all') {
      logFilterMismatch(job, 'remote_onsite', job.remote_onsite, filters.remote);
      if (!safeStringCompare(job.remote_onsite, filters.remote)) return false;
    }
    
    // Job type filter (maps to job_type in job data)
    if (filters.jobType !== 'all') {
      logFilterMismatch(job, 'job_type', job.job_type, filters.jobType);
      if (!safeStringCompare(job.job_type, filters.jobType)) return false;
    }
    
    // Work hours filter (maps to work_hours in job data)
    if (filters.workHours !== 'all') {
      logFilterMismatch(job, 'work_hours', job.work_hours, filters.workHours);
      if (!safeStringCompare(job.work_hours, filters.workHours)) return false;
    }
    
    // Equity filter (maps to equity in job data)
    if (filters.equity !== 'all') {
      logFilterMismatch(job, 'equity', job.equity, filters.equity);
      if (!safeStringCompare(job.equity, filters.equity)) return false;
    }
    
    // Hiring urgency filter (maps to hiring_urgency in job data)
    if (filters.hiringUrgency !== 'all') {
      logFilterMismatch(job, 'hiring_urgency', job.hiring_urgency, filters.hiringUrgency);
      if (!safeStringCompare(job.hiring_urgency, filters.hiringUrgency)) return false;
    }
    
    // Revenue model filter (maps to revenue_model in job data)
    if (filters.revenueModel !== 'all') {
      logFilterMismatch(job, 'revenue_model', job.revenue_model, filters.revenueModel);
      if (!safeStringCompare(job.revenue_model, filters.revenueModel)) return false;
    }
    
    // Visa sponsorship filter (boolean check)
    if (filters.visaSponsorship === true) {
      if (job.visa_sponsorship !== true) {
        console.log(`Filter mismatch - visa_sponsorship:`, {
          jobId: job.id,
          filterValue: true,
          jobValue: job.visa_sponsorship,
          valueType: typeof job.visa_sponsorship
        });
        return false;
      }
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
