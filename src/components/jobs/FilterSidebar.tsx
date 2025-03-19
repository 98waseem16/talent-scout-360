
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
  // Properly forward filter changes - important to handle the visaSponsorship boolean separately
  const handleFilterChange = (field: string, value: string | boolean) => {
    console.log(`🔄 FilterSidebar: Changing filter "${field}" to value "${value}"`);
    
    // Convert string "true"/"false" to boolean for visaSponsorship
    if (field === 'visaSponsorship') {
      if (typeof value === 'string') {
        setFilters(prev => ({ ...prev, [field]: value === 'true' }));
      } else {
        setFilters(prev => ({ ...prev, [field]: value }));
      }
    } else {
      // All other filters are handled as strings
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
