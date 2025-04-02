import React from 'react';
import { X, Filter, Building, Briefcase, DollarSign, Users, BarChart2, Globe, Clock } from 'lucide-react';
import FilterSelect from './FilterSelect';
import { Switch } from '@/components/ui/switch';

// Filter option types
interface FilterOption {
  label: string;
  value: string;
}

// Department options
const departmentOptions: FilterOption[] = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Product', value: 'product' },
  { label: 'Design', value: 'design' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
  { label: 'Operations', value: 'operations' },
  { label: 'HR', value: 'hr' },
  { label: 'Customer Support', value: 'customer support' },
  { label: 'Legal', value: 'legal' },
  { label: 'Finance', value: 'finance' },
];

// Seniority options
const seniorityOptions: FilterOption[] = [
  { label: 'Internship', value: 'internship' },
  { label: 'Entry-Level', value: 'entry-level' },
  { label: 'Mid-Level', value: 'mid-level' },
  { label: 'Senior', value: 'senior' },
  { label: 'Lead', value: 'lead' },
  { label: 'Director', value: 'director' },
  { label: 'VP', value: 'vp' },
  { label: 'C-Level', value: 'c-level' },
];

// Salary range options
const salaryRangeOptions: FilterOption[] = [
  { label: '$40K-$60K', value: '$40k-$60k' },
  { label: '$60K-$80K', value: '$60k-$80k' },
  { label: '$80K-$120K', value: '$80k-$120k' },
  { label: '$120K+', value: '$120k+' },
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
  { label: 'Pre-seed', value: 'pre-seed' },
  { label: 'Seed', value: 'seed' },
  { label: 'Series A', value: 'series a' },
  { label: 'Series B', value: 'series b' },
  { label: 'Series C+', value: 'series c+' },
  { label: 'Public', value: 'public' },
  { label: 'Profitable', value: 'profitable' },
];

// Remote/onsite options
const remoteOptions: FilterOption[] = [
  { label: 'Fully Remote', value: 'fully remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Onsite', value: 'onsite' },
];

// Job type options - match exactly with type field in Job type
const jobTypeOptions: FilterOption[] = [
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Remote', value: 'remote' },
  { label: 'Freelance', value: 'freelance' },
  { label: 'Internship', value: 'internship' },
];

// Work hours options
const workHoursOptions: FilterOption[] = [
  { label: 'Flexible', value: 'flexible' },
  { label: 'Fixed', value: 'fixed' },
  { label: 'Async Work', value: 'async work' },
];

// Equity options
const equityOptions: FilterOption[] = [
  { label: 'None', value: 'none' },
  { label: '0.1%-0.5%', value: '0.1%-0.5%' },
  { label: '0.5%-1%', value: '0.5%-1%' },
  { label: '1%+', value: '1%+' },
];

// Hiring urgency options
const hiringUrgencyOptions: FilterOption[] = [
  { label: 'Immediate Hire', value: 'immediate hire' },
  { label: 'Within a Month', value: 'within a month' },
  { label: 'Open to Future Applicants', value: 'open to future applicants' },
];

// Revenue model options
const revenueModelOptions: FilterOption[] = [
  { label: 'SaaS', value: 'saas' },
  { label: 'Marketplace', value: 'marketplace' },
  { label: 'E-commerce', value: 'e-commerce' },
  { label: 'Subscription', value: 'subscription' },
  { label: 'Advertising', value: 'advertising' },
  { label: 'Services', value: 'services' },
];

interface JobFiltersProps {
  filters: {
    department: string;
    seniority: string;
    salaryRange: string;
    teamSize: string;
    investmentStage: string;
    remote: string;
    jobType: string;
    workHours: string;
    equity: string;
    hiringUrgency: string;
    revenueModel: string;
    visaSponsorship: boolean;
  };
  setFilters: (field: string, value: string | boolean) => void;
  clearAllFilters: () => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({ filters, setFilters, clearAllFilters }) => {
  const handleFilterChange = (field: string, value: string) => {
    console.log(`JobFilters: Setting ${field} filter to "${value}"`);
    setFilters(field, value);
  };

  const handleSwitchChange = (field: string, checked: boolean) => {
    console.log(`JobFilters: Setting ${field} switch to ${checked}`);
    setFilters(field, checked);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    typeof value === 'boolean' ? value : value !== ''
  );

  // Log active filters for debugging
  console.log('JobFilters: Current active filters:', Object.entries(filters)
    .filter(([_, value]) => typeof value === 'boolean' ? value : value !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join(', '));

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
        <FilterSelect
          label="Department"
          icon={<Building className="h-4 w-4" />}
          options={departmentOptions}
          value={filters.department}
          onChange={(value) => handleFilterChange('department', value)}
          placeholder="All departments"
        />
        
        <FilterSelect
          label="Seniority Level"
          icon={<Briefcase className="h-4 w-4" />}
          options={seniorityOptions}
          value={filters.seniority}
          onChange={(value) => handleFilterChange('seniority', value)}
          placeholder="All levels"
        />
        
        <FilterSelect
          label="Salary Range"
          icon={<DollarSign className="h-4 w-4" />}
          options={salaryRangeOptions}
          value={filters.salaryRange}
          onChange={(value) => handleFilterChange('salaryRange', value)}
          placeholder="All salary ranges"
        />
        
        <FilterSelect
          label="Job Type"
          icon={<Briefcase className="h-4 w-4" />}
          options={jobTypeOptions}
          value={filters.jobType}
          onChange={(value) => handleFilterChange('jobType', value)}
          placeholder="All job types"
        />
        
        <FilterSelect
          label="Remote / Onsite"
          icon={<Globe className="h-4 w-4" />}
          options={remoteOptions}
          value={filters.remote}
          onChange={(value) => handleFilterChange('remote', value)}
          placeholder="All locations"
        />
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="visa-sponsorship"
            checked={filters.visaSponsorship}
            onCheckedChange={(checked) => handleSwitchChange('visaSponsorship', checked)}
          />
          <label htmlFor="visa-sponsorship" className="text-sm cursor-pointer">
            Visa Sponsorship Available
          </label>
        </div>
        
        <hr className="my-4" />
        
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
              onChange={(value) => handleFilterChange('teamSize', value)}
              placeholder="All team sizes"
            />
            
            <FilterSelect
              label="Investment Stage"
              icon={<BarChart2 className="h-4 w-4" />}
              options={investmentStageOptions}
              value={filters.investmentStage}
              onChange={(value) => handleFilterChange('investmentStage', value)}
              placeholder="All investment stages"
            />
            
            <FilterSelect
              label="Work Hours"
              icon={<Clock className="h-4 w-4" />}
              options={workHoursOptions}
              value={filters.workHours}
              onChange={(value) => handleFilterChange('workHours', value)}
              placeholder="All work hours"
            />
            
            <FilterSelect
              label="Equity"
              icon={<BarChart2 className="h-4 w-4" />}
              options={equityOptions}
              value={filters.equity}
              onChange={(value) => handleFilterChange('equity', value)}
              placeholder="All equity options"
            />
            
            <FilterSelect
              label="Hiring Urgency"
              icon={<Clock className="h-4 w-4" />}
              options={hiringUrgencyOptions}
              value={filters.hiringUrgency}
              onChange={(value) => handleFilterChange('hiringUrgency', value)}
              placeholder="All hiring urgencies"
            />
            
            <FilterSelect
              label="Revenue Model"
              icon={<DollarSign className="h-4 w-4" />}
              options={revenueModelOptions}
              value={filters.revenueModel}
              onChange={(value) => handleFilterChange('revenueModel', value)}
              placeholder="All revenue models"
            />
          </div>
        </details>
      </div>
    </>
  );
};

export default JobFilters;
