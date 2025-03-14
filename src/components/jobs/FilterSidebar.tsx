
import React, { useEffect } from 'react';
import JobFilters from '@/components/job-filters/JobFilters';

interface FilterSidebarProps {
  isFilterOpen: boolean;
  filters: {
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
  };
  setFilters: React.Dispatch<React.SetStateAction<{
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
  }>>;
  clearAllFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isFilterOpen,
  filters,
  setFilters,
  clearAllFilters
}) => {
  // Enhanced logging of filter state whenever it changes
  useEffect(() => {
    console.log('Current filters in sidebar:', filters);
    
    // Log specific filter values if they're not 'all'
    const activeFilters = Object.entries(filters)
      .filter(([key, value]) => value !== 'all' && value !== false);
      
    if (activeFilters.length > 0) {
      console.log('Active filters:', activeFilters.map(([key, value]) => `${key}: ${value}`));
      
      // Special debug for seniority filter
      if (filters.seniority !== 'all') {
        console.log('Filter debugging for seniority:', {
          value: filters.seniority,
          type: typeof filters.seniority
        });
      }
    }
  }, [filters]);

  return (
    <aside 
      className={`w-full md:w-64 md:sticky top-24 transition-all duration-300 ${
        isFilterOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 md:max-h-[2000px] opacity-0 md:opacity-100 overflow-hidden md:overflow-visible'
      }`}
    >
      <div className="bg-white rounded-xl border border-border shadow-sm p-5 mb-6">
        <JobFilters 
          filters={filters} 
          setFilters={setFilters} 
          clearAllFilters={clearAllFilters} 
        />
      </div>
    </aside>
  );
};

export default FilterSidebar;
