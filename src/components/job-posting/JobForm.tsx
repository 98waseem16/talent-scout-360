import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LogoUpload from '@/components/LogoUpload';
import JobBasicInfo from './JobBasicInfo';
import StartupDetails from './StartupDetails';
import JobRoleFunction from './JobRoleFunction';
import CompensationBenefits from './CompensationBenefits';
import WorkingConditions from './WorkingConditions';
import JobDetails from './JobDetails';
import FeaturedOption from './FeaturedOption';
import PostJobBenefits from './PostJobBenefits';
import JobFormHeader from './JobFormHeader';
import JobFormActions from './JobFormActions';
import { useJobFormData } from './hooks/useJobFormData';
import { useJobFormSubmit } from './hooks/useJobFormSubmit';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const JobForm: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  
  const {
    formData,
    logoFile,
    isEditMode,
    isFromScraper,
    handleInputChange,
    handleSelectChange,
    handleSwitchChange,
    handleListChange,
    addListItem,
    removeListItem,
    handleLogoChange
  } = useJobFormData(id);

  const { isSubmitting, handleSubmit } = useJobFormSubmit(id);

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, formData, logoFile);
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-8 mb-8">
      <JobFormHeader isEditMode={isEditMode} />
      
      {/* Show info message if coming from scraper */}
      {isFromScraper && (
        <Alert className="mb-6 bg-blue-50 border border-blue-200">
          <InfoIcon className="h-5 w-5 text-blue-500" />
          <AlertTitle>Draft Job from URL</AlertTitle>
          <AlertDescription>
            This job was created from a URL. Please review and edit the information before publishing.
            {formData.source_url && (
              <p className="mt-2">
                Source: <a href={formData.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{formData.source_url}</a>
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Benefits of posting */}
      {!isEditMode && !isFromScraper && <PostJobBenefits />}
      
      {/* Job Posting Form */}
      <form onSubmit={onSubmit} className="grid gap-6">
        {/* Basic Information */}
        <JobBasicInfo formData={formData} handleInputChange={handleInputChange} />
        
        {/* Startup Details */}
        <StartupDetails formData={formData} handleSelectChange={handleSelectChange} />
        
        {/* Job Role & Function */}
        <JobRoleFunction formData={formData} handleSelectChange={handleSelectChange} />
        
        {/* Compensation & Benefits */}
        <CompensationBenefits formData={formData} handleSelectChange={handleSelectChange} />
        
        {/* Working Conditions */}
        <WorkingConditions 
          formData={formData} 
          handleSelectChange={handleSelectChange} 
          handleSwitchChange={handleSwitchChange} 
        />
        
        {/* Job Details */}
        <JobDetails 
          formData={formData}
          handleInputChange={handleInputChange}
          handleListChange={handleListChange}
          addListItem={addListItem}
          removeListItem={removeListItem}
        />
        
        {/* Company Logo */}
        <div className="space-y-1 pt-4 border-t">
          <h2 className="text-xl font-medium">Company Logo</h2>
          <p className="text-sm text-muted-foreground">
            Upload your company logo
          </p>
        </div>
        
        <LogoUpload 
          currentLogoUrl={formData.logo} 
          onLogoChange={handleLogoChange} 
        />
        
        {/* Featured Job Option */}
        <FeaturedOption 
          featured={formData.featured || false} 
          handleSwitchChange={handleSwitchChange} 
        />
        
        {/* Form Actions */}
        <JobFormActions 
          isSubmitting={isSubmitting} 
          isEditMode={isEditMode} 
          isFromScraper={isFromScraper} 
        />
      </form>
    </div>
  );
};

export default JobForm;
