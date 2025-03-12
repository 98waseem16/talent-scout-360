
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

  // Generate the active filters display
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

  const filteredJobs = jobs?.filter(job => {
    // Basic text search filters
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesLocation = locationQuery === '' ||
      job.location.toLowerCase().includes(locationQuery.toLowerCase());
    
    // Advanced filters
    const matchesDepartment = filters.department === '' || 
      job.department?.toLowerCase() === filters.department.toLowerCase();
      
    const matchesSeniority = filters.seniority === '' || 
      job.seniority_level?.toLowerCase() === filters.seniority.toLowerCase();
      
    const matchesSalaryRange = filters.salaryRange === '' || 
      job.salary_range?.toLowerCase() === filters.salaryRange.toLowerCase();
      
    const matchesTeamSize = filters.teamSize === '' || 
      job.team_size?.toLowerCase() === filters.teamSize.toLowerCase();
      
    const matchesInvestmentStage = filters.investmentStage === '' || 
      job.investment_stage?.toLowerCase() === filters.investmentStage.toLowerCase();
      
    const matchesRemote = filters.remote === '' || 
      job.remote_onsite?.toLowerCase() === filters.remote.toLowerCase();
      
    const matchesJobType = filters.jobType === '' || 
      job.job_type?.toLowerCase() === filters.jobType.toLowerCase();
      
    const matchesWorkHours = filters.workHours === '' || 
      job.work_hours?.toLowerCase() === filters.workHours.toLowerCase();
      
    const matchesEquity = filters.equity === '' || 
      job.equity?.toLowerCase() === filters.equity.toLowerCase();
      
    const matchesHiringUrgency = filters.hiringUrgency === '' || 
      job.hiring_urgency?.toLowerCase() === filters.hiringUrgency.toLowerCase();
      
    const matchesRevenueModel = filters.revenueModel === '' || 
      job.revenue_model?.toLowerCase() === filters.revenueModel.toLowerCase();
      
    const matchesVisaSponsorship = !filters.visaSponsorship || 
      job.visa_sponsorship === true;
    
    return matchesSearch && matchesLocation && 
      matchesDepartment && matchesSeniority && matchesSalaryRange && 
      matchesTeamSize && matchesInvestmentStage && matchesRemote && 
      matchesJobType && matchesWorkHours && matchesEquity && 
      matchesHiringUrgency && matchesRevenueModel && matchesVisaSponsorship;
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
