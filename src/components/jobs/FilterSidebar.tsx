
import React from 'react';
import JobFilters from '@/components/job-filters/JobFilters';
import { JobFilters as JobFiltersType } from '@/hooks/useJobFilters';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface FilterSidebarProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  filters: JobFiltersType;
  setFilters: (field: string, value: string | boolean) => void;
  clearAllFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isFilterOpen,
  setIsFilterOpen,
  filters,
  setFilters,
  clearAllFilters
}) => {
  const isMobile = useIsMobile();
  
  // Use Sheet component on mobile devices
  if (isMobile) {
    return (
      <Sheet open={isFilterOpen} onOpenChange={(open) => setIsFilterOpen(open)}>
        <SheetContent 
          side="left" 
          className="w-[90vw] max-w-sm p-0 pt-10 z-[9999] bg-background border-r overflow-hidden"
          onInteractOutside={() => setIsFilterOpen(false)}
        >
          <div className="h-full overflow-y-auto ios-scroll">
            <div className="p-5 pb-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>
              <JobFilters 
                filters={filters}
                setFilters={setFilters}
                clearAllFilters={clearAllFilters} 
              />
            </div>
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
