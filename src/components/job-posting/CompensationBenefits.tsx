
import React from 'react';
import { DollarSign, BarChart4 } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { salaryRangeOptions, equityOptions } from '@/components/job-filters/constants/filterOptions';

interface CompensationBenefitsProps {
  formData: {
    salary_range?: string;
    equity?: string;
  };
  handleSelectChange: (name: string, value: string) => void;
}

const CompensationBenefits: React.FC<CompensationBenefitsProps> = ({ formData, handleSelectChange }) => {
  return (
    <>
      <div className="space-y-1 pt-4 border-t">
        <h2 className="text-xl font-medium">Compensation & Benefits</h2>
        <p className="text-sm text-muted-foreground">
          Financial and non-financial benefits of the position
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="salary_range" className="flex items-center space-x-2 text-sm font-medium">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span>Salary Range</span>
          </label>
          <Select 
            value={formData.salary_range} 
            onValueChange={(value) => handleSelectChange('salary_range', value)}
          >
            <SelectTrigger id="salary_range" className="w-full">
              <SelectValue placeholder="Select salary range" />
            </SelectTrigger>
            <SelectContent>
              {salaryRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="equity" className="flex items-center space-x-2 text-sm font-medium">
            <BarChart4 className="h-5 w-5 text-muted-foreground" />
            <span>Equity</span>
          </label>
          <Select 
            value={formData.equity} 
            onValueChange={(value) => handleSelectChange('equity', value)}
          >
            <SelectTrigger id="equity" className="w-full">
              <SelectValue placeholder="Select equity range" />
            </SelectTrigger>
            <SelectContent>
              {equityOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default CompensationBenefits;
