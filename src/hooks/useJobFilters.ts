
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

  // Debug filter state when it changes with more details about all active filters
  useEffect(() => {
    console.log('🧩 Current filters state:', JSON.stringify(filters, null, 2));
    
    // Log all active non-default filters
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => value !== 'all' && value !== false)
      .map(([key, value]) => `${key}="${value}"`);
      
    if (activeFilterKeys.length > 0) {
      console.log(`🔍 ACTIVE FILTERS: ${activeFilterKeys.join(', ')}`);
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

  // FIXED: This is the corrected mapping between UI filter names and Job object property names
  // Maintains the exact property names used in the database
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

  // Get job field value with enhanced debugging
  const getJobFieldValue = (job: Job, filterType: string): any => {
    const fieldName = fieldMappings[filterType];
    if (!fieldName) {
      console.error(`Missing field mapping for filter type: ${filterType}`);
      return null;
    }
    
    const value = job[fieldName as keyof Job];
    
    // Add detailed logging for ALL active filters
    if (filters[filterType as keyof JobFilters] !== 'all' && 
        filters[filterType as keyof JobFilters] !== false) {
      console.log(`🔍 FILTER CHECK: Job "${job.title}" ${String(fieldName)}="${value}"`);
    }
    
    return value;
  };

  // Completely rewritten matching logic to use exact case-sensitive matching
  const matchesFilter = (jobValue: any, filterValue: string, filterType: string): boolean => {
    // Return true for "all" filter
    if (filterValue === 'all') return true;
    
    // Check for empty job values
    if (jobValue === null || jobValue === undefined || jobValue === '') {
      // More comprehensive logging for debugging missing values
      if (filters[filterType as keyof JobFilters] !== 'all') {
        console.log(`❌ NO MATCH: Job's ${filterType} value is empty/null/undefined`);
      }
      return false;
    }
    
    // Convert to strings for comparison, but preserve case
    const jobValueStr = String(jobValue).trim();
    const filterValueStr = String(filterValue).trim();
    
    // Enhanced debug for ALL active filters
    if (filters[filterType as keyof JobFilters] !== 'all') {
      console.log(`🔍 MATCHING: Filter type=${filterType}, Job value="${jobValueStr}" | Filter value="${filterValueStr}"`);
    }
    
    // Check for EXACT match (case-sensitive)
    const exactMatch = jobValueStr === filterValueStr;
    if (exactMatch) {
      if (filters[filterType as keyof JobFilters] !== 'all') {
        console.log(`✅ EXACT MATCH FOUND!`);
      }
      return true;
    }
    
    // Fall back to case-insensitive contains match if needed
    // This provides some flexibility while still prioritizing exact matches
    const containsMatch = jobValueStr.toLowerCase().includes(filterValueStr.toLowerCase());
    if (containsMatch) {
      if (filters[filterType as keyof JobFilters] !== 'all') {
        console.log(`✅ PARTIAL MATCH: Job value contains filter value (case-insensitive)`);
      }
      return true;
    }
    
    // No match found
    if (filters[filterType as keyof JobFilters] !== 'all') {
      console.log(`❌ NO MATCH: Neither exact nor contains match found`);
    }
    
    return false;
  };

  // Completely overhauled filtering logic with better logging
  const filteredJobs = jobs?.filter(job => {
    // Text search filtering - case insensitive
    const searchFields = [
      job.title || '', 
      job.company || '', 
      job.description || ''
    ].map(field => field.toLowerCase());
    
    const normalizedSearchQuery = searchQuery.toLowerCase();
    const normalizedLocationQuery = locationQuery.toLowerCase();
    
    const matchesSearch = searchQuery === '' || 
      searchFields.some(field => field.includes(normalizedSearchQuery));
      
    const matchesLocation = locationQuery === '' ||
      (job.location || '').toLowerCase().includes(normalizedLocationQuery);
    
    if (!matchesSearch || !matchesLocation) {
      return false;
    }
    
    // Get active filter types
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => {
        // For boolean visaSponsorship, only consider active if true
        if (key === 'visaSponsorship') return value === true;
        // For all other filters, consider active if not 'all'
        return value !== 'all'; 
      })
      .map(([key]) => key);
    
    // Only log details for jobs when filters are active
    if (activeFilterKeys.length > 0) {
      console.log(`\n📋 FILTERING JOB: "${job.title}" (ID: ${job.id})`);
      
      // List job's actual values for debugging
      activeFilterKeys.forEach(filterType => {
        const dbFieldName = fieldMappings[filterType];
        const jobValue = job[dbFieldName as keyof Job];
        const filterValue = filters[filterType as keyof JobFilters];
        console.log(`📋 Job ${String(dbFieldName)}="${jobValue}" | Filter value="${filterValue}"`);
      });
    }
    
    // Check each active filter
    for (const filterType of activeFilterKeys) {
      // Special handling for boolean filters
      if (filterType === 'visaSponsorship') {
        if (job.visa_sponsorship !== true) {
          if (filters.visaSponsorship === true) {
            console.log(`❌ VISA FILTER: Job does not offer visa sponsorship`);
          }
          return false;
        }
        continue;
      }
      
      const jobValue = getJobFieldValue(job, filterType);
      const filterValue = filters[filterType as keyof JobFilters];
      
      // Use the rewritten matchesFilter with better logging
      if (!matchesFilter(jobValue, filterValue as string, filterType)) {
        return false;
      }
    }
    
    // If we get here, job passed all filters
    if (activeFilterKeys.length > 0) {
      console.log(`✅ JOB MATCHED ALL FILTERS: "${job.title}"`);
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
