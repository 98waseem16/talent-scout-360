
import React from 'react';
import { Input } from '@/components/ui/input';
import { Briefcase, Building, MapPin, DollarSign } from 'lucide-react';

interface JobBasicInfoProps {
  formData: {
    title: string;
    company: string;
    location: string;
    salary: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const JobBasicInfo: React.FC<JobBasicInfoProps> = ({ formData, handleInputChange }) => {
  return (
    <>
      <div className="space-y-1 pt-4 border-t">
        <h2 className="text-xl font-medium">Basic Information</h2>
        <p className="text-sm text-muted-foreground">
          Essential details about the position and company
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="title" className="flex items-center space-x-2 text-sm font-medium">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <span>Job Title*</span>
          </label>
          <Input 
            id="title" 
            name="title" 
            value={formData.title} 
            onChange={handleInputChange} 
            required 
            placeholder="e.g. Senior Frontend Developer"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="company" className="flex items-center space-x-2 text-sm font-medium">
            <Building className="h-5 w-5 text-muted-foreground" />
            <span>Company Name*</span>
          </label>
          <Input 
            id="company" 
            name="company" 
            value={formData.company} 
            onChange={handleInputChange} 
            required 
            placeholder="e.g. Acme Inc."
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="location" className="flex items-center space-x-2 text-sm font-medium">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span>Location</span>
          </label>
          <Input 
            id="location" 
            name="location" 
            value={formData.location} 
            onChange={handleInputChange} 
            placeholder="e.g. New York, NY (or Remote)"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="salary" className="flex items-center space-x-2 text-sm font-medium">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span>Salary Range</span>
          </label>
          <Input 
            id="salary" 
            name="salary" 
            value={formData.salary} 
            onChange={handleInputChange} 
            placeholder="e.g. $80,000 - $120,000"
          />
        </div>
      </div>
    </>
  );
};

export default JobBasicInfo;
