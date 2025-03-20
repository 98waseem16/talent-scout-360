
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

  // Debug active filters
  console.log('Active filters:', activeFilters);

  // Helper function to format filter labels for display
  const formatFilterLabel = (filter: ActiveFilter): string => {
    // Convert database field names to more readable form
    switch (filter.type) {
      case 'seniority':
        return `Seniority: ${filter.label}`;
      case 'salaryRange':
        return `Salary: ${filter.label}`;
      case 'teamSize':
        return `Team: ${filter.label}`;
      case 'investmentStage':
        return `Investment: ${filter.label}`;
      case 'remote':
        return `Work Location: ${filter.label}`;
      case 'jobType':
        return `Job Type: ${filter.label}`;
      case 'workHours':
        return `Hours: ${filter.label}`;
      case 'hiringUrgency':
        return `Urgency: ${filter.label}`;
      case 'revenueModel':
        return `Revenue: ${filter.label}`;
      case 'department':
        return `Dept: ${filter.label}`;
      case 'visa_sponsorship':
        return 'Visa Sponsorship';
      case 'visaSponsorship':
        return 'Visa Sponsorship';
      case 'search':
        return `Search: ${filter.label}`;
      case 'location':
        return `Location: ${filter.label}`;
      case 'equity':
        return `Equity: ${filter.label}`;
      default:
        return filter.label;
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
      {activeFilters.map((filter, index) => (
        <div key={index} className="inline-flex items-center bg-secondary text-sm rounded-full px-3 py-1">
          <span className="mr-1">{formatFilterLabel(filter)}</span>
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
