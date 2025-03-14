
import React from 'react';
import { Filter } from 'lucide-react';
import FilterGroup from './filter-components/FilterGroup';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface FilterSidebarProps {
  isFilterOpen: boolean;
  filters: Record<string, string | boolean>;
  setFilters: (filters: Record<string, string | boolean>) => void;
  clearAllFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isFilterOpen,
  filters,
  setFilters,
  clearAllFilters
}) => {
  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters({ ...filters, [filterKey]: value });
  };

  const handleSwitchChange = (filterKey: string, checked: boolean) => {
    setFilters({ ...filters, [filterKey]: checked });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (typeof value === 'boolean') return value === true;
    return value !== 'all';
  });

  return (
    <aside 
      className={`w-full md:w-64 md:sticky top-24 transition-all duration-300 ${
        isFilterOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 md:max-h-[2000px] opacity-0 md:opacity-100 overflow-hidden md:overflow-visible'
      }`}
    >
      <div className="bg-white rounded-xl border border-border shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </h3>
          {hasActiveFilters && (
            <Button 
              onClick={clearAllFilters}
              variant="ghost" 
              size="sm"
              className="text-sm text-primary hover:text-primary/80 h-8 px-2"
            >
              Clear all
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Primary Filters */}
          <FilterGroup
            label="Department"
            value={filters.department as string}
            onChange={(value) => handleFilterChange('department', value)}
            options={[
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
            ]}
          />
          
          <FilterGroup
            label="Seniority Level"
            value={filters.seniority_level as string}
            onChange={(value) => handleFilterChange('seniority_level', value)}
            options={[
              { label: 'Internship', value: 'internship' },
              { label: 'Entry-Level', value: 'entry-level' },
              { label: 'Mid-Level', value: 'mid-level' },
              { label: 'Senior', value: 'senior' },
              { label: 'Lead', value: 'lead' },
              { label: 'Director', value: 'director' },
              { label: 'VP', value: 'vp' },
              { label: 'C-Level', value: 'c-level' },
            ]}
          />
          
          <FilterGroup
            label="Job Type"
            value={filters.job_type as string}
            onChange={(value) => handleFilterChange('job_type', value)}
            options={[
              { label: 'Full-time', value: 'full-time' },
              { label: 'Part-time', value: 'part-time' },
              { label: 'Contract', value: 'contract' },
              { label: 'Freelance', value: 'freelance' },
              { label: 'Internship', value: 'internship' },
            ]}
          />
          
          <FilterGroup
            label="Salary Range"
            value={filters.salary_range as string}
            onChange={(value) => handleFilterChange('salary_range', value)}
            options={[
              { label: 'Negotiable', value: 'negotiable' },
              { label: '$40K-$60K', value: '$40k-$60k' },
              { label: '$60K-$80K', value: '$60k-$80k' },
              { label: '$80K-$120K', value: '$80k-$120k' },
              { label: '$120K+', value: '$120k+' },
            ]}
          />
          
          <FilterGroup
            label="Work Location"
            value={filters.remote_onsite as string}
            onChange={(value) => handleFilterChange('remote_onsite', value)}
            options={[
              { label: 'Fully Remote', value: 'fully remote' },
              { label: 'Hybrid', value: 'hybrid' },
              { label: 'Onsite', value: 'onsite' },
            ]}
          />
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="visa-sponsorship"
              checked={filters.visa_sponsorship as boolean}
              onCheckedChange={(checked) => handleSwitchChange('visa_sponsorship', checked)}
            />
            <Label htmlFor="visa-sponsorship" className="text-sm cursor-pointer">
              Visa Sponsorship Available
            </Label>
          </div>
          
          {/* Advanced Filters */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="advanced-filters" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm font-medium text-muted-foreground hover:no-underline">
                Advanced Filters
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0">
                <div className="space-y-4">
                  <FilterGroup
                    label="Team Size"
                    value={filters.team_size as string}
                    onChange={(value) => handleFilterChange('team_size', value)}
                    options={[
                      { label: '1-10', value: '1-10' },
                      { label: '11-50', value: '11-50' },
                      { label: '51-200', value: '51-200' },
                      { label: '201-500', value: '201-500' },
                      { label: '501+', value: '501+' },
                    ]}
                  />
                  
                  <FilterGroup
                    label="Investment Stage"
                    value={filters.investment_stage as string}
                    onChange={(value) => handleFilterChange('investment_stage', value)}
                    options={[
                      { label: 'Pre-seed', value: 'pre-seed' },
                      { label: 'Seed', value: 'seed' },
                      { label: 'Series A', value: 'series a' },
                      { label: 'Series B', value: 'series b' },
                      { label: 'Series C+', value: 'series c+' },
                      { label: 'Public', value: 'public' },
                      { label: 'Profitable', value: 'profitable' },
                    ]}
                  />
                  
                  <FilterGroup
                    label="Revenue Model"
                    value={filters.revenue_model as string}
                    onChange={(value) => handleFilterChange('revenue_model', value)}
                    options={[
                      { label: 'SaaS', value: 'saas' },
                      { label: 'Marketplace', value: 'marketplace' },
                      { label: 'E-commerce', value: 'e-commerce' },
                      { label: 'Subscription', value: 'subscription' },
                      { label: 'Advertising', value: 'advertising' },
                      { label: 'Services', value: 'services' },
                    ]}
                  />
                  
                  <FilterGroup
                    label="Equity"
                    value={filters.equity as string}
                    onChange={(value) => handleFilterChange('equity', value)}
                    options={[
                      { label: 'None', value: 'none' },
                      { label: '0.1%-0.5%', value: '0.1%-0.5%' },
                      { label: '0.5%-1%', value: '0.5%-1%' },
                      { label: '1%+', value: '1%+' },
                    ]}
                  />
                  
                  <FilterGroup
                    label="Hiring Urgency"
                    value={filters.hiring_urgency as string}
                    onChange={(value) => handleFilterChange('hiring_urgency', value)}
                    options={[
                      { label: 'Immediate Hire', value: 'immediate hire' },
                      { label: 'Within a Month', value: 'within a month' },
                      { label: 'Open to Future Applicants', value: 'open to future applicants' },
                    ]}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
