
import React from 'react';
import { X, Filter } from 'lucide-react';
import { JobFiltersProps } from './types';
import BasicFilters from './components/BasicFilters';
import AdvancedFilters from './components/AdvancedFilters';

const JobFilters: React.FC<JobFiltersProps> = ({ filters, setFilters, clearAllFilters }) => {
  const handleFilterChange = (field: string, value: string) => {
    console.log(`JobFilters: Setting ${field} filter to "${value}"`);
    setFilters(field, value);
  };

  const handleSwitchChange = (field: string, checked: boolean) => {
    console.log(`JobFilters: Setting ${field} switch to ${checked}`);
    setFilters(field, checked);
  };

  // Log active filters for debugging
  React.useEffect(() => {
    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => typeof value === 'boolean' ? value : value !== '')
      .map(([key, value]) => `${key}: ${value}`);
      
    if (activeFilters.length > 0) {
      console.log('JobFilters: Current active filters:', activeFilters.join(', '));
    }
  }, [filters]);

  const hasActiveFilters = Object.values(filters).some(value => 
    typeof value === 'boolean' ? value : value !== ''
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button 
            onClick={clearAllFilters}
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            <X className="h-4 w-4" /> Clear all
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        <BasicFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onSwitchChange={handleSwitchChange} 
        />
        
        <hr className="my-4" />
        
        <AdvancedFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      </div>
    </>
  );
};

export default JobFilters;
