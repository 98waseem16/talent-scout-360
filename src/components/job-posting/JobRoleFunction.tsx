
import React from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
          Details about the position and responsibilities
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="department" className="flex items-center space-x-2 text-sm font-medium">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
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
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Customer Support">Customer Support</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="seniority_level" className="flex items-center space-x-2 text-sm font-medium">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
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
              <SelectItem value="Entry Level">Entry Level</SelectItem>
              <SelectItem value="Mid Level">Mid Level</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Director">Director</SelectItem>
              <SelectItem value="VP">VP</SelectItem>
              <SelectItem value="C-Level">C-Level</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default JobRoleFunction;
