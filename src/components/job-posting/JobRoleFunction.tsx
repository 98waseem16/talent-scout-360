
import React from 'react';
import { Building, Briefcase } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { departmentOptions, seniorityOptions } from '@/components/job-filters/constants/filterOptions';

interface JobRoleFunctionProps {
  formData: {
    department?: string;
    seniority_level?: string;
  };
  handleSelectChange: (name: string, value: string) => void;
}

const JobRoleFunction: React.FC<JobRoleFunctionProps> = ({ formData, handleSelectChange }) => {
  return (
    <>
      <div className="space-y-1 pt-4 border-t">
        <h2 className="text-xl font-medium">Job Role & Function</h2>
        <p className="text-sm text-muted-foreground">
          Details about the position's department and seniority level
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="department" className="flex items-center space-x-2 text-sm font-medium">
            <Building className="h-5 w-5 text-muted-foreground" />
            <span>Department</span>
          </label>
          <Select 
            value={formData.department} 
            onValueChange={(value) => handleSelectChange('department', value)}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="seniority_level" className="flex items-center space-x-2 text-sm font-medium">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <span>Seniority Level</span>
          </label>
          <Select 
            value={formData.seniority_level} 
            onValueChange={(value) => handleSelectChange('seniority_level', value)}
          >
            <SelectTrigger id="seniority_level">
              <SelectValue placeholder="Select seniority level" />
            </SelectTrigger>
            <SelectContent>
              {seniorityOptions.map(option => (
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

export default JobRoleFunction;
