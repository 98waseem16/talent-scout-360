
import React from 'react';
import { X, Filter, Building, Briefcase, DollarSign, Users, BarChart2, Globe, Clock } from 'lucide-react';
import FilterSelect from './FilterSelect';
import { Switch } from '@/components/ui/switch';

// Filter option type
interface FilterOption {
  label: string;
  value: string;
}

// Department options
const departmentOptions: FilterOption[] = [
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Product', value: 'Product' },
  { label: 'Design', value: 'Design' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Sales', value: 'Sales' },
  { label: 'Operations', value: 'Operations' },
  { label: 'HR', value: 'HR' },
  { label: 'Customer Support', value: 'Customer Support' },
  { label: 'Legal', value: 'Legal' },
  { label: 'Finance', value: 'Finance' },
];

// Seniority options
const seniorityOptions: FilterOption[] = [
  { label: 'Internship', value: 'Internship' },
  { label: 'Entry-Level', value: 'Entry-Level' },
  { label: 'Mid-Level', value: 'Mid-Level' },
  { label: 'Senior', value: 'Senior' },
  { label: 'Lead', value: 'Lead' },
  { label: 'Director', value: 'Director' },
  { label: 'VP', value: 'VP' },
  { label: 'C-Level', value: 'C-Level' },
];

// Salary range options
const salaryRangeOptions: FilterOption[] = [
  { label: 'Negotiable', value: 'Negotiable' },
  { label: '$40K-$60K', value: '$40K-$60K' },
  { label: '$60K-$80K', value: '$60K-$80K' },
  { label: '$80K-$120K', value: '$80K-$120K' },
  { label: '$120K+', value: '$120K+' },
];

// Team size options
const teamSizeOptions: FilterOption[] = [
  { label: '1-10', value: '1-10' },
  { label: '11-50', value: '11-50' },
  { label: '51-200', value: '51-200' },
  { label: '201-500', value: '201-500' },
  { label: '501+', value: '501+' },
];

// Investment stage options
const investmentStageOptions: FilterOption[] = [
  { label: 'Pre-seed', value: 'Pre-seed' },
  { label: 'Seed', value: 'Seed' },
  { label: 'Series A', value: 'Series A' },
  { label: 'Series B', value: 'Series B' },
  { label: 'Series C+', value: 'Series C+' },
  { label: 'Public', value: 'Public' },
  { label: 'Profitable', value: 'Profitable' },
];

// Remote/onsite options
const remoteOptions: FilterOption[] = [
  { label: 'Fully Remote', value: 'Fully Remote' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'Onsite', value: 'Onsite' },
];

// Job type options
const jobTypeOptions: FilterOption[] = [
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Part-time', value: 'Part-time' },
  { label: 'Contract', value: 'Contract' },
  { label: 'Remote', value: 'Remote' },
];

// Work hours options
const workHoursOptions: FilterOption[] = [
  { label: 'Flexible', value: 'Flexible' },
  { label: 'Fixed', value: 'Fixed' },
  { label: 'Async Work', value: 'Async Work' },
];

// Equity options
const equityOptions: FilterOption[] = [
  { label: 'None', value: 'None' },
  { label: '0.1%-0.5%', value: '0.1%-0.5%' },
  { label: '0.5%-1%', value: '0.5%-1%' },
  { label: '1%+', value: '1%+' },
];

// Hiring urgency options
const hiringUrgencyOptions: FilterOption[] = [
  { label: 'Immediate Hire', value: 'Immediate Hire' },
  { label: 'Within a Month', value: 'Within a Month' },
  { label: 'Open to Future Applicants', value: 'Open to Future Applicants' },
];

// Revenue model options
const revenueModelOptions: FilterOption[] = [
  { label: 'SaaS', value: 'SaaS' },
  { label: 'Marketplace', value: 'Marketplace' },
  { label: 'E-commerce', value: 'E-commerce' },
  { label: 'Subscription', value: 'Subscription' },
  { label: 'Advertising', value: 'Advertising' },
  { label: 'Services', value: 'Services' },
];

interface JobFiltersProps {
  filters: {
    department: string;
    seniority_level: string;
    salary_range: string;
    team_size: string;
    investment_stage: string;
    remote_onsite: string;
    type: string;
    work_hours: string;
    equity: string;
    hiring_urgency: string;
    revenue_model: string;
    visa_sponsorship: boolean;
  };
  setFilters: (field: string, value: string | boolean) => void;
  clearAllFilters: () => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({ filters, setFilters, clearAllFilters }) => {
  // Handle changes from select components
  const handleFilterChange = (field: string, value: string) => {
    console.log(`JobFilters: Change ${field} to "${value}"`);
    setFilters(field, value);
  };

  // Handle visa sponsorship switch
  const handleSwitchChange = (checked: boolean) => {
    console.log(`JobFilters: Change visa_sponsorship to ${checked}`);
    setFilters('visa_sponsorship', checked);
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => 
    typeof value === 'boolean' ? value : value !== 'all'
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
        {/* Department */}
        <FilterSelect
          label="Department"
          icon={<Building className="h-4 w-4" />}
          options={departmentOptions}
          value={filters.department}
          onChange={(value) => handleFilterChange('department', value)}
          placeholder="All departments"
        />
        
        {/* Seniority Level */}
        <FilterSelect
          label="Seniority Level"
          icon={<Briefcase className="h-4 w-4" />}
          options={seniorityOptions}
          value={filters.seniority_level}
          onChange={(value) => handleFilterChange('seniority_level', value)}
          placeholder="All levels"
        />
        
        {/* Salary Range */}
        <FilterSelect
          label="Salary Range"
          icon={<DollarSign className="h-4 w-4" />}
          options={salaryRangeOptions}
          value={filters.salary_range}
          onChange={(value) => handleFilterChange('salary_range', value)}
          placeholder="All salary ranges"
        />
        
        {/* Job Type */}
        <FilterSelect
          label="Job Type"
          icon={<Briefcase className="h-4 w-4" />}
          options={jobTypeOptions}
          value={filters.type}
          onChange={(value) => handleFilterChange('type', value)}
          placeholder="All job types"
        />
        
        {/* Remote / Onsite */}
        <FilterSelect
          label="Remote / Onsite"
          icon={<Globe className="h-4 w-4" />}
          options={remoteOptions}
          value={filters.remote_onsite}
          onChange={(value) => handleFilterChange('remote_onsite', value)}
          placeholder="All locations"
        />
        
        {/* Visa Sponsorship Switch */}
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="visa-sponsorship"
            checked={filters.visa_sponsorship}
            onCheckedChange={handleSwitchChange}
          />
          <label htmlFor="visa-sponsorship" className="text-sm cursor-pointer">
            Visa Sponsorship Available
          </label>
        </div>
        
        <hr className="my-4" />
        
        {/* Advanced Filters Dropdown */}
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
            {/* Team Size */}
            <FilterSelect
              label="Team Size"
              icon={<Users className="h-4 w-4" />}
              options={teamSizeOptions}
              value={filters.team_size}
              onChange={(value) => handleFilterChange('team_size', value)}
              placeholder="All team sizes"
            />
            
            {/* Investment Stage */}
            <FilterSelect
              label="Investment Stage"
              icon={<BarChart2 className="h-4 w-4" />}
              options={investmentStageOptions}
              value={filters.investment_stage}
              onChange={(value) => handleFilterChange('investment_stage', value)}
              placeholder="All investment stages"
            />
            
            {/* Work Hours */}
            <FilterSelect
              label="Work Hours"
              icon={<Clock className="h-4 w-4" />}
              options={workHoursOptions}
              value={filters.work_hours}
              onChange={(value) => handleFilterChange('work_hours', value)}
              placeholder="All work hours"
            />
            
            {/* Equity */}
            <FilterSelect
              label="Equity"
              icon={<BarChart2 className="h-4 w-4" />}
              options={equityOptions}
              value={filters.equity}
              onChange={(value) => handleFilterChange('equity', value)}
              placeholder="All equity options"
            />
            
            {/* Hiring Urgency */}
            <FilterSelect
              label="Hiring Urgency"
              icon={<Clock className="h-4 w-4" />}
              options={hiringUrgencyOptions}
              value={filters.hiring_urgency}
              onChange={(value) => handleFilterChange('hiring_urgency', value)}
              placeholder="All hiring urgencies"
            />
            
            {/* Revenue Model */}
            <FilterSelect
              label="Revenue Model"
              icon={<DollarSign className="h-4 w-4" />}
              options={revenueModelOptions}
              value={filters.revenue_model}
              onChange={(value) => handleFilterChange('revenue_model', value)}
              placeholder="All revenue models"
            />
          </div>
        </details>
      </div>
    </>
  );
};

export default JobFilters;
