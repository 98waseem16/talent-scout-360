
import React from 'react';
import JobFilters from '@/components/job-filters/JobFilters';
import { JobFilters as JobFiltersType } from '@/hooks/useJobFilters';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Use Sheet component on mobile devices
  if (isMobile) {
    return (
      <Sheet open={isFilterOpen} onOpenChange={(open) => setIsFilterOpen(open)}>
        <SheetContent side="left" className="w-[85vw] max-w-md p-0 pt-10">
          <div className="bg-white p-5 h-full overflow-auto">
            <JobFilters 
              filters={filters}
              setFilters={setFilters}
              clearAllFilters={clearAllFilters} 
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  // Desktop version
  return (
    <aside 
      className="w-full md:w-64 md:sticky top-24 transition-all duration-300"
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
