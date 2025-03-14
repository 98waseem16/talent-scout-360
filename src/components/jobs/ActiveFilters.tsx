
import React from 'react';
import { X } from 'lucide-react';

interface ActiveFilter {
  type: string;
  label: string;
}

interface ActiveFiltersProps {
  activeFilters: ActiveFilter[];
  removeFilter: (type: string) => void;
  clearFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  activeFilters,
  removeFilter,
  clearFilters
}) => {
  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
      {activeFilters.map((filter, index) => (
        <div key={index} className="inline-flex items-center bg-secondary text-sm rounded-full px-3 py-1">
          <span className="mr-1">{filter.label}</span>
          <button 
            onClick={() => removeFilter(filter.type)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      
      {activeFilters.length > 1 && (
        <button 
          onClick={clearFilters}
          className="inline-flex items-center bg-primary/10 text-primary text-sm rounded-full px-3 py-1 hover:bg-primary/20 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;
