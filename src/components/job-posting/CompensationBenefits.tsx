
import React from 'react';
import { DollarSign, BarChart4 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface CompensationBenefitsProps {
  formData: {
    salary: string;
    salary_range?: string;
    equity?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

const CompensationBenefits: React.FC<CompensationBenefitsProps> = ({ 
  formData, 
  handleInputChange, 
  handleSelectChange 
}) => {
  return (
    <>
      <div className="space-y-1 pt-4 border-t">
        <h2 className="text-xl font-medium">Compensation & Benefits</h2>
        <p className="text-sm text-muted-foreground">
          Financial and non-financial benefits of the position
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="salary" className="flex items-center space-x-2 text-sm font-medium">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span>Salary</span>
          </label>
          <Input 
            id="salary" 
            name="salary" 
            value={formData.salary} 
            onChange={handleInputChange} 
            placeholder="e.g. $80,000 - $100,000"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="salary_range" className="flex items-center space-x-2 text-sm font-medium">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span>Salary Range</span>
          </label>
          <Select 
            value={formData.salary_range} 
            onValueChange={(value) => handleSelectChange('salary_range', value)}
          >
            <SelectTrigger id="salary_range">
              <SelectValue placeholder="Select salary range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Negotiable">Negotiable</SelectItem>
              <SelectItem value="$40K-$60K">$40K-$60K</SelectItem>
              <SelectItem value="$60K-$80K">$60K-$80K</SelectItem>
              <SelectItem value="$80K-$120K">$80K-$120K</SelectItem>
              <SelectItem value="$120K+">$120K+</SelectItem>
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
            <SelectTrigger id="equity">
              <SelectValue placeholder="Select equity range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="0.1%-0.5%">0.1%-0.5%</SelectItem>
              <SelectItem value="0.5%-1%">0.5%-1%</SelectItem>
              <SelectItem value="1%+">1%+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default CompensationBenefits;
