
import React from 'react';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterToggleProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
}

const FilterToggle: React.FC<FilterToggleProps> = ({ isFilterOpen, setIsFilterOpen }) => {
  return (
    <button
      className={cn(
        "md:hidden flex items-center justify-center text-foreground bg-white border border-border rounded-lg px-4 py-3 shadow-sm w-full mb-4",
        "fixed bottom-4 left-4 right-4 z-30 max-w-[calc(100%-2rem)]",
        isFilterOpen ? "bg-secondary" : "bg-white"
      )}
      onClick={() => setIsFilterOpen(!isFilterOpen)}
    >
      <Filter className="h-5 w-5 mr-2" />
      {isFilterOpen ? "Hide Filters" : "Show Filters"}
    </button>
  );
};

export default FilterToggle;
