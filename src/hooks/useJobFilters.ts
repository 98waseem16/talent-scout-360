
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Job } from '@/lib/types/job.types';

export const useJobFilters = (jobs: Job[] | undefined) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('query') || '';
  const initialLocation = queryParams.get('location') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Create initial filters object with all filters set to 'all' or false
  const [filters, setFilters] = useState<Record<string, string | boolean>>({
    department: 'all',
    seniority_level: 'all',
    job_type: 'all',
    salary_range: 'all',
    remote_onsite: 'all',
    team_size: 'all',
    investment_stage: 'all',
    revenue_model: 'all',
    equity: 'all',
    hiring_urgency: 'all',
    visa_sponsorship: false
  });

  // Update URL with search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    
    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, locationQuery, location.pathname]);

  // Clear all filters (text search and dropdowns)
  const clearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    clearAllFilters();
  };

  // Reset only dropdown filters to defaults
  const clearAllFilters = () => {
    setFilters({
      department: 'all',
      seniority_level: 'all',
      job_type: 'all',
      salary_range: 'all',
      remote_onsite: 'all',
      team_size: 'all',
      investment_stage: 'all',
      revenue_model: 'all',
      equity: 'all',
      hiring_urgency: 'all',
      visa_sponsorship: false
    });
  };

  // Remove a specific filter
  const removeFilter = (key: string) => {
    if (key === 'search') {
      setSearchQuery('');
    } else if (key === 'location') {
      setLocationQuery('');
    } else if (key === 'visa_sponsorship') {
      setFilters(prev => ({ ...prev, [key]: false }));
    } else {
      setFilters(prev => ({ ...prev, [key]: 'all' }));
    }
  };

  // Normalize a string value for consistent comparison
  const normalizeValue = (value: string | boolean | null | undefined): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return value.toString().toLowerCase().trim();
  };

  // Generate active filters for display
  const activeFilters = [
    ...(searchQuery ? [{ key: 'search', label: 'Search', displayValue: searchQuery }] : []),
    ...(locationQuery ? [{ key: 'location', label: 'Location', displayValue: locationQuery }] : []),
    ...Object.entries(filters)
      .filter(([key, value]) => {
        if (typeof value === 'boolean') return value === true;
        return value !== 'all';
      })
      .map(([key, value]) => ({
        key,
        label: key
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        displayValue: typeof value === 'boolean' ? 'Yes' : value
      }))
  ];

  // Filter jobs based on all active filters
  const filteredJobs = jobs?.filter(job => {
    // Basic text search filters
    const matchesSearch = !searchQuery || searchInJob(job, searchQuery);
    const matchesLocation = !locationQuery || 
      (job.location && normalizeValue(job.location).includes(normalizeValue(locationQuery)));
    
    // If basic filters don't match, return early
    if (!matchesSearch || !matchesLocation) {
      return false;
    }
    
    // Check each active filter
    return Object.entries(filters).every(([key, value]) => {
      // Skip filters set to 'all' or false (for boolean filters)
      if (value === 'all' || value === false) return true;
      
      // Handle visa_sponsorship (boolean filter)
      if (key === 'visa_sponsorship') {
        return job.visa_sponsorship === true;
      }
      
      // Get the actual job field value
      const jobFieldValue = job[key as keyof Job];
      
      // Handle null/undefined/empty values
      if (jobFieldValue === null || jobFieldValue === undefined || jobFieldValue === '') {
        return false;
      }
      
      // Normalize both values for comparison
      const normalizedJobValue = normalizeValue(jobFieldValue);
      const normalizedFilterValue = normalizeValue(value);
      
      // Check if the job value contains the filter value (for case-insensitive partial matching)
      return normalizedJobValue.includes(normalizedFilterValue);
    });
  }) || [];

  // Helper to search in job fields
  function searchInJob(job: Job, query: string): boolean {
    const searchFields = [
      job.title || '',
      job.company || '',
      job.description || '',
      job.department || '',
      job.seniority_level || ''
    ];
    
    const normalizedQuery = normalizeValue(query);
    
    return searchFields.some(field => 
      normalizeValue(field).includes(normalizedQuery)
    );
  }

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
