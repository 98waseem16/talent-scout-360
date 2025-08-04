
import React from 'react';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterToggleProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
}

const FilterToggle: React.FC<FilterToggleProps> = ({ isFilterOpen, setIsFilterOpen }) => {
  const handleClick = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <button
      className={cn(
        "md:hidden flex items-center justify-center text-foreground bg-white border border-border rounded-lg px-4 py-4 shadow-lg w-full mb-4 touch-target active-scale touch-feedback",
        "fixed bottom-4 left-4 right-4 z-[9998] max-w-[calc(100%-2rem)] safe-bottom",
        "min-h-[48px] font-medium text-base",
        isFilterOpen ? "bg-secondary border-primary/20" : "bg-white hover:bg-secondary/50"
      )}
      onClick={handleClick}
      type="button"
      aria-label={isFilterOpen ? "Hide job filters" : "Show job filters"}
    >
      <Filter className="h-5 w-5 mr-2 flex-shrink-0" />
      <span>{isFilterOpen ? "Hide Filters" : "Show Filters"}</span>
    </button>
  );
};

export default FilterToggle;
