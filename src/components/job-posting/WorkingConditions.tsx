
import React from 'react';
import { Globe, Clock } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface WorkingConditionsProps {
  formData: {
    remote_onsite?: string;
    work_hours?: string;
    visa_sponsorship?: boolean;
    hiring_urgency?: string;
  };
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
}

const WorkingConditions: React.FC<WorkingConditionsProps> = ({ 
  formData, 
  handleSelectChange,
  handleSwitchChange
}) => {
  return (
    <>
      <div className="space-y-1 pt-4 border-t">
        <h2 className="text-xl font-medium">Working Conditions</h2>
        <p className="text-sm text-muted-foreground">
          Details about work location, schedule, and visa requirements
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="remote_onsite" className="flex items-center space-x-2 text-sm font-medium">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span>Remote vs. Onsite</span>
          </label>
          <Select 
            value={formData.remote_onsite} 
            onValueChange={(value) => handleSelectChange('remote_onsite', value)}
          >
            <SelectTrigger id="remote_onsite">
              <SelectValue placeholder="Select work location type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fully Remote">Fully Remote</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="Onsite">Onsite</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="work_hours" className="flex items-center space-x-2 text-sm font-medium">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span>Work Hours</span>
          </label>
          <Select 
            value={formData.work_hours} 
            onValueChange={(value) => handleSelectChange('work_hours', value)}
          >
            <SelectTrigger id="work_hours">
              <SelectValue placeholder="Select work hour structure" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Flexible">Flexible</SelectItem>
              <SelectItem value="Fixed">Fixed</SelectItem>
              <SelectItem value="Async Work">Async Work</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="visa_sponsorship" className="flex items-center space-x-2 text-sm font-medium">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span>Visa Sponsorship</span>
          </label>
          <div className="flex items-center space-x-2">
            <Switch
              id="visa_sponsorship"
              checked={formData.visa_sponsorship}
              onCheckedChange={(checked) => handleSwitchChange('visa_sponsorship', checked)}
            />
            <span className="text-sm text-muted-foreground">
              {formData.visa_sponsorship ? 'Yes, we offer visa sponsorship' : 'No visa sponsorship available'}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="hiring_urgency" className="flex items-center space-x-2 text-sm font-medium">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span>Hiring Urgency</span>
          </label>
          <Select 
            value={formData.hiring_urgency} 
            onValueChange={(value) => handleSelectChange('hiring_urgency', value)}
          >
            <SelectTrigger id="hiring_urgency">
              <SelectValue placeholder="Select hiring timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Immediate Hire">Immediate Hire</SelectItem>
              <SelectItem value="Within a Month">Within a Month</SelectItem>
              <SelectItem value="Open to Future Applicants">Open to Future Applicants</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default WorkingConditions;
