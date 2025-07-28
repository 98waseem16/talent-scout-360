
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Job } from '@/lib/types/job.types';
import { JobFilters, UseJobFiltersReturn } from './types';
import { jobMatchesFilters, generateActiveFilters } from './filterUtils';

export const useJobFilters = (jobs: Job[] | undefined): UseJobFiltersReturn => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('query') || '';
  const initialLocation = queryParams.get('location') || '';
  const categoryParam = queryParams.get('category') || '';

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

  // Handle category parameter from URL
  useEffect(() => {
    if (categoryParam) {
      // Import here to avoid circular dependency
      import('@/lib/categories').then(({ CATEGORY_MAPPINGS }) => {
        const department = CATEGORY_MAPPINGS[categoryParam];
        if (department && filters.department !== department) {
          setFilters(prev => ({ ...prev, department }));
        }
      });
    }
  }, [categoryParam]);

  // Update URL when search or location changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    
    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, locationQuery, location.pathname]);

  // Set a specific filter value
  const handleSetFilters = (field: string, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear all filters and search queries
  const clearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    clearAllFilters();
  };

  // Clear just the filter values
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

  // Remove a specific filter
  const removeFilter = (type: string) => {
    if (type === 'search') {
      setSearchQuery('');
    } else if (type === 'location') {
      setLocationQuery('');
    } else if (type === 'category') {
      // Clear department filter and remove category from URL
      setFilters(prev => ({ ...prev, department: '' }));
      const params = new URLSearchParams(location.search);
      params.delete('category');
      const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    } else {
      setFilters(prev => ({ 
        ...prev, 
        [type]: type === 'visaSponsorship' ? false : '' 
      }));
    }
  };

  // Generate array of active filters for display
  const activeFilters = generateActiveFilters(filters, searchQuery, locationQuery, categoryParam);

  // Filter jobs based on all criteria
  const filteredJobs = jobs?.filter(job => 
    jobMatchesFilters(job, filters, searchQuery, locationQuery)
  ) || [];

  return {
    searchQuery,
    locationQuery,
    filters,
    isFilterOpen,
    activeFilters,
    filteredJobs,
    currentCategory: categoryParam,
    setSearchQuery,
    setLocationQuery,
    setFilters: handleSetFilters,
    setIsFilterOpen,
    clearFilters,
    clearAllFilters,
    removeFilter
  };
};
