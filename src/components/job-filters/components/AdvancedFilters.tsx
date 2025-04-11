
import React from 'react';
import { Users, BarChart2, Clock, DollarSign } from 'lucide-react';
import FilterSelect from '../FilterSelect';
import { JobFilters } from '@/hooks/filters/types';
import {
  teamSizeOptions,
  investmentStageOptions,
  workHoursOptions,
  equityOptions,
  hiringUrgencyOptions,
  revenueModelOptions
} from '../constants/filterOptions';

interface AdvancedFiltersProps {
  filters: JobFilters;
  onFilterChange: (field: string, value: string) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  return (
    <details className="group">
      <summary className="flex cursor-pointer items-center justify-between font-medium text-sm text-muted-foreground">
        <span>Advanced Filters</span>
        <span className="transition group-open:rotate-180">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </span>
      </summary>
      
      <div className="pt-4 space-y-4">
        <FilterSelect
          label="Team Size"
          icon={<Users className="h-4 w-4" />}
          options={teamSizeOptions}
          value={filters.teamSize}
          onChange={(value) => onFilterChange('teamSize', value)}
          placeholder="All team sizes"
        />
        
        <FilterSelect
          label="Investment Stage"
          icon={<BarChart2 className="h-4 w-4" />}
          options={investmentStageOptions}
          value={filters.investmentStage}
          onChange={(value) => onFilterChange('investmentStage', value)}
          placeholder="All investment stages"
        />
        
        <FilterSelect
          label="Work Hours"
          icon={<Clock className="h-4 w-4" />}
          options={workHoursOptions}
          value={filters.workHours}
          onChange={(value) => onFilterChange('workHours', value)}
          placeholder="All work hours"
        />
        
        <FilterSelect
          label="Equity"
          icon={<BarChart2 className="h-4 w-4" />}
          options={equityOptions}
          value={filters.equity}
          onChange={(value) => onFilterChange('equity', value)}
          placeholder="All equity options"
        />
        
        <FilterSelect
          label="Hiring Urgency"
          icon={<Clock className="h-4 w-4" />}
          options={hiringUrgencyOptions}
          value={filters.hiringUrgency}
          onChange={(value) => onFilterChange('hiringUrgency', value)}
          placeholder="All hiring urgencies"
        />
        
        <FilterSelect
          label="Revenue Model"
          icon={<DollarSign className="h-4 w-4" />}
          options={revenueModelOptions}
          value={filters.revenueModel}
          onChange={(value) => onFilterChange('revenueModel', value)}
          placeholder="All revenue models"
        />
      </div>
    </details>
  );
};

export default AdvancedFilters;
