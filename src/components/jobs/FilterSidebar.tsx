
import React from 'react';
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
  // Handle filter changes from the JobFilters component
  const handleFilterChange = (field: string, value: string | boolean) => {
    console.log(`FilterSidebar: Setting ${field} to ${value}`);
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Log current filters for debugging
  console.log('FilterSidebar: Current filters state:', 
    Object.entries(filters)
      .filter(([_, val]) => typeof val === 'boolean' ? val : val !== '')
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ') || 'No active filters');

  return (
    <aside 
      className={`w-full md:w-64 md:sticky top-24 transition-all duration-300 ${
        isFilterOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 md:max-h-[2000px] opacity-0 md:opacity-100 overflow-hidden md:overflow-visible'
      }`}
    >
      <div className="bg-white rounded-xl border border-border shadow-sm p-5 mb-6">
        <JobFilters 
          filters={filters}
          setFilters={handleFilterChange}
          clearAllFilters={clearAllFilters} 
        />
      </div>
    </aside>
  );
};

export default FilterSidebar;
