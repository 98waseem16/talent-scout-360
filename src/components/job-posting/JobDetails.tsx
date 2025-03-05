
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X as XIcon } from 'lucide-react';

interface JobDetailsProps {
  formData: {
    description: string;
    responsibilities: string[];
    requirements: string[];
    benefits: string[];
  };
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleListChange: (index: number, value: string, field: 'responsibilities' | 'requirements' | 'benefits') => void;
  addListItem: (field: 'responsibilities' | 'requirements' | 'benefits') => void;
  removeListItem: (index: number, field: 'responsibilities' | 'requirements' | 'benefits') => void;
}

const JobDetails: React.FC<JobDetailsProps> = ({ 
  formData, 
  handleInputChange, 
  handleListChange,
  addListItem,
  removeListItem
}) => {
  return (
    <>
      <div className="space-y-1 pt-4 border-t">
        <h2 className="text-xl font-medium">Job Details</h2>
        <p className="text-sm text-muted-foreground">
          Describe the role, responsibilities, and qualifications
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">Job Description*</label>
          <Textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            required 
            placeholder="Provide a detailed description of the role and company..."
            className="min-h-[150px]"
          />
        </div>
        
        {/* Responsibilities */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Responsibilities</label>
          {(formData.responsibilities as string[]).map((item, index) => (
            <div key={`resp-${index}`} className="flex space-x-2">
              <Input 
                value={item} 
                onChange={(e) => handleListChange(index, e.target.value, 'responsibilities')}
                placeholder="Enter a responsibility"
              />
              <button 
                type="button" 
                onClick={() => removeListItem(index, 'responsibilities')}
                className="p-2 text-muted-foreground hover:text-destructive rounded-md"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => addListItem('responsibilities')}
          >
            Add Responsibility
          </Button>
        </div>
        
        {/* Requirements */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Requirements</label>
          {(formData.requirements as string[]).map((item, index) => (
            <div key={`req-${index}`} className="flex space-x-2">
              <Input 
                value={item} 
                onChange={(e) => handleListChange(index, e.target.value, 'requirements')}
                placeholder="Enter a requirement"
              />
              <button 
                type="button" 
                onClick={() => removeListItem(index, 'requirements')}
                className="p-2 text-muted-foreground hover:text-destructive rounded-md"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => addListItem('requirements')}
          >
            Add Requirement
          </Button>
        </div>
        
        {/* Benefits */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Benefits</label>
          {(formData.benefits as string[]).map((item, index) => (
            <div key={`benefit-${index}`} className="flex space-x-2">
              <Input 
                value={item} 
                onChange={(e) => handleListChange(index, e.target.value, 'benefits')}
                placeholder="Enter a benefit"
              />
              <button 
                type="button" 
                onClick={() => removeListItem(index, 'benefits')}
                className="p-2 text-muted-foreground hover:text-destructive rounded-md"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => addListItem('benefits')}
          >
            Add Benefit
          </Button>
        </div>
      </div>
    </>
  );
};

export default JobDetails;
