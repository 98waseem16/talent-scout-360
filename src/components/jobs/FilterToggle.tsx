
import React from 'react';
import { Filter } from 'lucide-react';

interface FilterToggleProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
}

const FilterToggle: React.FC<FilterToggleProps> = ({ isFilterOpen, setIsFilterOpen }) => {
  return (
    <button
      className="md:hidden flex items-center text-foreground bg-white border border-border rounded-lg px-4 py-2 shadow-sm"
      onClick={() => setIsFilterOpen(!isFilterOpen)}
    >
      <Filter className="h-5 w-5 mr-2" />
      {isFilterOpen ? "Hide Filters" : "Show Filters"}
    </button>
  );
};

export default FilterToggle;
