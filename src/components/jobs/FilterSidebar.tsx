
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
  // Properly forward filter changes with better logging for debugging
  const handleFilterChange = (field: string, value: string | boolean) => {
    console.log(`🔄 FilterSidebar: Changing filter "${field}" to value="${value}" (type: ${typeof value})`);
    
    // Special handling for the visaSponsorship boolean value
    if (field === 'visaSponsorship') {
      // Ensure value is treated as a boolean
      let boolValue: boolean;
      if (typeof value === 'string') {
        boolValue = value === 'true';
      } else {
        boolValue = Boolean(value);
      }
      
      console.log(`🔄 Setting visaSponsorship to ${boolValue} (${typeof boolValue})`);
      setFilters(prev => ({ ...prev, [field]: boolValue }));
    } else {
      // For all other string filters
      if (typeof value !== 'string') {
        console.error(`🚨 FilterSidebar received non-string value for field "${field}": ${value}`);
        return;
      }
      
      console.log(`🔄 Setting filter "${field}" to "${value}"`);
      setFilters(prev => ({ ...prev, [field]: value }));
    }
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
