
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
  // Enhanced debug logging for filter state tracking
  useEffect(() => {
    console.log('FilterSidebar - Current filters state:', {
      department: filters.department,
      seniority: filters.seniority,
      salaryRange: filters.salaryRange,
      teamSize: filters.teamSize,
      investmentStage: filters.investmentStage,
      remote: filters.remote,
      jobType: filters.jobType,
      workHours: filters.workHours,
      equity: filters.equity,
      hiringUrgency: filters.hiringUrgency,
      revenueModel: filters.revenueModel,
      visaSponsorship: filters.visaSponsorship,
      hasActiveFilters: Object.entries(filters).some(([key, value]) => 
        key === 'visaSponsorship' ? value === true : value !== 'all'
      )
    });
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
