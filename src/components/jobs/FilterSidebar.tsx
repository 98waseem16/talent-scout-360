
import React from 'react';
import JobFilters from '@/components/job-filters/JobFilters';
import { JobFilters as JobFiltersType } from '@/hooks/useJobFilters';

interface FilterSidebarProps {
  isFilterOpen: boolean;
  filters: JobFiltersType;
  setFilters: (field: string, value: string | boolean) => void;
  clearAllFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isFilterOpen,
  filters,
  setFilters,
  clearAllFilters
}) => {
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
