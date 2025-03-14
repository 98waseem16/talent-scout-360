
import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActiveFilter {
  key: string;
  label: string;
  displayValue: string;
}

interface ActiveFiltersProps {
  activeFilters: ActiveFilter[];
  removeFilter: (key: string) => void;
  clearAllFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  activeFilters,
  removeFilter,
  clearAllFilters
}) => {
  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
      {activeFilters.map((filter) => (
        <Badge 
          key={filter.key} 
          variant="secondary"
          className="inline-flex items-center text-sm font-normal rounded-full px-3 py-1"
        >
          <span className="mr-1">{filter.label}: {filter.displayValue}</span>
          <button 
            onClick={() => removeFilter(filter.key)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      
      {activeFilters.length > 1 && (
        <button 
          onClick={clearAllFilters}
          className="inline-flex items-center bg-primary/10 text-primary text-sm rounded-full px-3 py-1 hover:bg-primary/20 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;
