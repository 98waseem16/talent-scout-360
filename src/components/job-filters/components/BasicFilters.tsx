
import React from 'react';
import { Building, Briefcase, DollarSign, Globe } from 'lucide-react';
import FilterSelect from '../FilterSelect';
import { Switch } from '@/components/ui/switch';
import { JobFilters } from '@/hooks/filters/types';
import { 
  departmentOptions,
  seniorityOptions,
  salaryRangeOptions,
  jobTypeOptions,
  remoteOptions
} from '../constants/filterOptions';

interface BasicFiltersProps {
  filters: JobFilters;
  onFilterChange: (field: string, value: string) => void;
  onSwitchChange: (field: string, checked: boolean) => void;
}

const BasicFilters: React.FC<BasicFiltersProps> = ({
  filters,
  onFilterChange,
  onSwitchChange
}) => {
  return (
    <div className="space-y-4">
      <FilterSelect
        label="Department"
        icon={<Building className="h-4 w-4" />}
        options={departmentOptions}
        value={filters.department}
        onChange={(value) => onFilterChange('department', value)}
        placeholder="All departments"
      />
      
      <FilterSelect
        label="Seniority Level"
        icon={<Briefcase className="h-4 w-4" />}
        options={seniorityOptions}
        value={filters.seniority}
        onChange={(value) => onFilterChange('seniority', value)}
        placeholder="All levels"
      />
      
      <FilterSelect
        label="Salary Range"
        icon={<DollarSign className="h-4 w-4" />}
        options={salaryRangeOptions}
        value={filters.salaryRange}
        onChange={(value) => onFilterChange('salaryRange', value)}
        placeholder="All salary ranges"
      />
      
      <FilterSelect
        label="Job Type"
        icon={<Briefcase className="h-4 w-4" />}
        options={jobTypeOptions}
        value={filters.jobType}
        onChange={(value) => onFilterChange('jobType', value)}
        placeholder="All job types"
      />
      
      <FilterSelect
        label="Remote / Onsite"
        icon={<Globe className="h-4 w-4" />}
        options={remoteOptions}
        value={filters.remote}
        onChange={(value) => onFilterChange('remote', value)}
        placeholder="All locations"
      />
      
      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="visa-sponsorship"
          checked={filters.visaSponsorship}
          onCheckedChange={(checked) => onSwitchChange('visaSponsorship', checked)}
        />
        <label htmlFor="visa-sponsorship" className="text-sm cursor-pointer">
          Visa Sponsorship Available
        </label>
      </div>
    </div>
  );
};

export default BasicFilters;
