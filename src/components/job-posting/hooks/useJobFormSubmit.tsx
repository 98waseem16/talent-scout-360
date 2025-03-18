
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { JobFormData } from '@/lib/types/job.types';
import { createJobListing, updateJobListing } from '@/lib/jobs/jobsApi';
import { uploadCompanyLogo } from '@/lib/jobs';

export const useJobFormSubmit = (id?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, formData: JobFormData, logoFile: File | null) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to post a job');
      navigate('/auth', { state: { returnTo: window.location.pathname } });
      return;
    }
    
    // Validate required fields
    if (!formData.title || !formData.company || !formData.application_url) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validate logo file if provided
    if (logoFile) {
      if (!logoFile.type.startsWith('image/')) {
        toast.error('Invalid logo format. Please upload an image file.');
        return;
      }
      
      // Check file size (max 2MB)
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (logoFile.size > maxSizeInBytes) {
        toast.error('Logo file is too large. Maximum size is 2MB.');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting job form data:', formData);
      
      // Prepare job data with user_id
      let jobDataToSubmit: JobFormData = {
        ...formData,
        user_id: user.id
      };
      
      // Upload logo if provided
      if (logoFile) {
        try {
          console.log('Uploading logo file:', logoFile.name, logoFile.type, logoFile.size);
          toast.info('Uploading company logo...');
          
          const logoUrl = await uploadCompanyLogo(logoFile);
          console.log('Logo uploaded successfully, URL:', logoUrl);
          
          // Update form data with logo URL
          jobDataToSubmit = {
            ...jobDataToSubmit,
            logo: logoUrl
          };
          
          toast.success('Logo uploaded successfully');
        } catch (uploadError: any) {
          console.error('Error uploading logo:', uploadError);
          // Log the full error object for debugging
          console.log('Full upload error:', JSON.stringify(uploadError, null, 2));
          
          const errorMessage = typeof uploadError === 'object' ? uploadError.message || 'Unknown upload error' : String(uploadError);
          toast.error(`Logo upload failed: ${errorMessage}`);
          
          // If logo upload fails but we're in edit mode and there's an existing logo, 
          // we can continue with the existing logo
          if (!isEditMode || !formData.logo) {
            setIsSubmitting(false);
            return;
          }
          
          toast.warning('Continuing with existing logo due to upload error.');
        }
      }
      
      console.log('Final job data to submit:', jobDataToSubmit);
      
      if (isEditMode && id) {
        try {
          await updateJobListing(id, jobDataToSubmit);
          toast.success('Job listing updated successfully!');
          // Redirect to dashboard
          navigate('/dashboard');
        } catch (updateError: any) {
          console.error('Error updating job:', updateError);
          const errorMessage = typeof updateError === 'object' ? updateError.message || 'Unknown error' : String(updateError);
          toast.error(`Failed to update job listing: ${errorMessage}`);
          setIsSubmitting(false);
          return;
        }
      } else {
        try {
          await createJobListing(jobDataToSubmit);
          toast.success('Job listing created successfully!');
          // Redirect to dashboard
          navigate('/dashboard');
        } catch (createError: any) {
          console.error('Error creating job:', createError);
          const errorMessage = typeof createError === 'object' ? createError.message || 'Unknown error' : String(createError);
          toast.error(`Failed to create job listing: ${errorMessage}`);
          setIsSubmitting(false);
          return;
        }
      }
    } catch (error: any) {
      console.error('Error saving job:', error);
      const errorMessage = typeof error === 'object' ? error.message || 'Unknown error' : String(error);
      toast.error(`Failed to save job listing: ${errorMessage}`);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isEditMode,
    isSubmitting,
    handleSubmit
  };
};
