
import React from 'react';
import JobFilters from '@/components/job-filters/JobFilters';

interface FilterSidebarProps {
  isFilterOpen: boolean;
  filters: {
    department: string;
    seniority_level: string;
    salary_range: string;
    team_size: string;
    investment_stage: string;
    remote_onsite: string;
    type: string;
    work_hours: string;
    equity: string;
    hiring_urgency: string;
    revenue_model: string;
    visa_sponsorship: boolean;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    department: string;
    seniority_level: string;
    salary_range: string;
    team_size: string;
    investment_stage: string;
    remote_onsite: string;
    type: string;
    work_hours: string;
    equity: string;
    hiring_urgency: string;
    revenue_model: string;
    visa_sponsorship: boolean;
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
    console.log(`FilterSidebar: Changing filter "${field}" to ${typeof value === 'boolean' ? value : `"${value}"`}`);
    setFilters(prev => ({ ...prev, [field]: value }));
  };

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
