
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

  // Define a debugging function to log filtering details
  const debugFilter = (jobField: any, filterValue: string, filterName: string, jobId: string) => {
    if (filterValue !== 'all') {
      console.log(`Filter ${filterName}:`, { 
        jobId,
        filterValue, 
        jobFieldValue: jobField, 
        jobFieldType: typeof jobField,
        match: String(jobField).toLowerCase() === filterValue.toLowerCase()
      });
    }
    return true;
  };

  // Completely revised filtering logic
  const filteredJobs = jobs?.filter(job => {
    // For debugging, uncomment this line
    // console.log(`Filtering job: ${job.id} - ${job.title}`);

    // Basic text search filters
    const matchesSearch = searchQuery === '' || 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesLocation = locationQuery === '' ||
      (job.location && job.location.toLowerCase().includes(locationQuery.toLowerCase()));
    
    // If basic filters don't match, return early
    if (!matchesSearch || !matchesLocation) return false;
    
    // Department filter
    if (filters.department !== 'all') {
      if (!job.department || job.department.toLowerCase() !== filters.department.toLowerCase()) {
        debugFilter(job.department, filters.department, 'department', job.id);
        return false;
      }
    }
    
    // Seniority level filter
    if (filters.seniority !== 'all') {
      if (!job.seniority_level || job.seniority_level.toLowerCase() !== filters.seniority.toLowerCase()) {
        debugFilter(job.seniority_level, filters.seniority, 'seniority_level', job.id);
        return false;
      }
    }
    
    // Salary range filter
    if (filters.salaryRange !== 'all') {
      if (!job.salary_range || job.salary_range.toLowerCase() !== filters.salaryRange.toLowerCase()) {
        debugFilter(job.salary_range, filters.salaryRange, 'salary_range', job.id);
        return false;
      }
    }
    
    // Team size filter
    if (filters.teamSize !== 'all') {
      if (!job.team_size || job.team_size.toLowerCase() !== filters.teamSize.toLowerCase()) {
        debugFilter(job.team_size, filters.teamSize, 'team_size', job.id);
        return false;
      }
    }
    
    // Investment stage filter
    if (filters.investmentStage !== 'all') {
      if (!job.investment_stage || job.investment_stage.toLowerCase() !== filters.investmentStage.toLowerCase()) {
        debugFilter(job.investment_stage, filters.investmentStage, 'investment_stage', job.id);
        return false;
      }
    }
    
    // Remote/Onsite filter
    if (filters.remote !== 'all') {
      if (!job.remote_onsite || job.remote_onsite.toLowerCase() !== filters.remote.toLowerCase()) {
        debugFilter(job.remote_onsite, filters.remote, 'remote_onsite', job.id);
        return false;
      }
    }
    
    // Job type filter
    if (filters.jobType !== 'all') {
      if (!job.job_type || job.job_type.toLowerCase() !== filters.jobType.toLowerCase()) {
        debugFilter(job.job_type, filters.jobType, 'job_type', job.id);
        return false;
      }
    }
    
    // Work hours filter
    if (filters.workHours !== 'all') {
      if (!job.work_hours || job.work_hours.toLowerCase() !== filters.workHours.toLowerCase()) {
        debugFilter(job.work_hours, filters.workHours, 'work_hours', job.id);
        return false;
      }
    }
    
    // Equity filter
    if (filters.equity !== 'all') {
      if (!job.equity || job.equity.toLowerCase() !== filters.equity.toLowerCase()) {
        debugFilter(job.equity, filters.equity, 'equity', job.id);
        return false;
      }
    }
    
    // Hiring urgency filter
    if (filters.hiringUrgency !== 'all') {
      if (!job.hiring_urgency || job.hiring_urgency.toLowerCase() !== filters.hiringUrgency.toLowerCase()) {
        debugFilter(job.hiring_urgency, filters.hiringUrgency, 'hiring_urgency', job.id);
        return false;
      }
    }
    
    // Revenue model filter
    if (filters.revenueModel !== 'all') {
      if (!job.revenue_model || job.revenue_model.toLowerCase() !== filters.revenueModel.toLowerCase()) {
        debugFilter(job.revenue_model, filters.revenueModel, 'revenue_model', job.id);
        return false;
      }
    }
    
    // Visa sponsorship filter
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
