
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApplicationUrlFieldProps {
  applicationUrl: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ApplicationUrlField: React.FC<ApplicationUrlFieldProps> = ({ 
  applicationUrl, 
  handleInputChange 
}) => {
  return (
    <div className="space-y-1 pt-4 border-t">
      <h2 className="text-xl font-medium">Application Information</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Provide the URL where candidates can apply for this position
      </p>
      
      <div className="space-y-2">
        <Label htmlFor="application_url" className="text-sm font-medium">
          Application URL <span className="text-red-500">*</span>
        </Label>
        <Input
          id="application_url"
          name="application_url"
          type="url"
          placeholder="https://yourcompany.com/careers/job-title"
          value={applicationUrl}
          onChange={handleInputChange}
          className="w-full"
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter the direct URL to the job posting on your careers page
        </p>
      </div>
    </div>
  );
};

export default ApplicationUrlField;
