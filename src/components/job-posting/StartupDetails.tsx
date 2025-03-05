
import React from 'react';
import { BarChart4, Users, DollarSign, Briefcase } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface StartupDetailsProps {
  formData: {
    investment_stage?: string;
    team_size?: string;
    revenue_model?: string;
    type: string;
  };
  handleSelectChange: (name: string, value: string) => void;
}

const StartupDetails: React.FC<StartupDetailsProps> = ({ formData, handleSelectChange }) => {
  return (
    <>
      <div className="space-y-1 pt-4 border-t">
        <h2 className="text-xl font-medium">Startup Details</h2>
        <p className="text-sm text-muted-foreground">
          Help candidates understand your company's stage and culture
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="investment_stage" className="flex items-center space-x-2 text-sm font-medium">
            <BarChart4 className="h-5 w-5 text-muted-foreground" />
            <span>Investment Stage</span>
          </label>
          <Select 
            value={formData.investment_stage} 
            onValueChange={(value) => handleSelectChange('investment_stage', value)}
          >
            <SelectTrigger id="investment_stage">
              <SelectValue placeholder="Select investment stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bootstrapped">Bootstrapped</SelectItem>
              <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
              <SelectItem value="Seed">Seed</SelectItem>
              <SelectItem value="Series A">Series A</SelectItem>
              <SelectItem value="Series B">Series B</SelectItem>
              <SelectItem value="Series C+">Series C+</SelectItem>
              <SelectItem value="Public">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="team_size" className="flex items-center space-x-2 text-sm font-medium">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span>Team Size</span>
          </label>
          <Select 
            value={formData.team_size} 
            onValueChange={(value) => handleSelectChange('team_size', value)}
          >
            <SelectTrigger id="team_size">
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10</SelectItem>
              <SelectItem value="11-50">11-50</SelectItem>
              <SelectItem value="51-200">51-200</SelectItem>
              <SelectItem value="201-500">201-500</SelectItem>
              <SelectItem value="500+">500+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="revenue_model" className="flex items-center space-x-2 text-sm font-medium">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span>Revenue Model</span>
          </label>
          <Select 
            value={formData.revenue_model} 
            onValueChange={(value) => handleSelectChange('revenue_model', value)}
          >
            <SelectTrigger id="revenue_model">
              <SelectValue placeholder="Select revenue model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Subscription">Subscription</SelectItem>
              <SelectItem value="Marketplace">Marketplace</SelectItem>
              <SelectItem value="SaaS">SaaS</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
              <SelectItem value="Ads">Ads</SelectItem>
              <SelectItem value="E-commerce">E-commerce</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="type" className="flex items-center space-x-2 text-sm font-medium">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <span>Job Type*</span>
          </label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => handleSelectChange('type', value)}
            required
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default StartupDetails;
