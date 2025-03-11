
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

const JobForm: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  
  const {
    formData,
    logoFile,
    isEditMode,
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
      
      {/* Benefits of posting */}
      {!isEditMode && <PostJobBenefits />}
      
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
        <JobFormActions isSubmitting={isSubmitting} isEditMode={isEditMode} />
      </form>
    </div>
  );
};

export default JobForm;
