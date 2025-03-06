
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { JobFormData } from '@/lib/types/job.types';
import { createJobListing, updateJobListing } from '@/lib/jobs/jobsApi';

export const useJobFormSubmit = (id?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, formData: JobFormData, logoFile: File | null) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to post a job');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting job form data:', formData);
      
      // Upload logo if provided
      let logoUrl = formData.logo;
      
      if (logoFile) {
        const fileName = `${user.id}-${Date.now()}-${logoFile.name}`;
        console.log('Uploading logo file:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile);
          
        if (uploadError) {
          console.error('Error uploading logo:', uploadError);
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);
          
        logoUrl = urlData.publicUrl;
        console.log('Logo uploaded successfully, URL:', logoUrl);
      }
      
      // Prepare job data with user_id
      const jobDataToSubmit: JobFormData = {
        ...formData,
        logo: logoUrl,
        user_id: user.id
      };
      
      console.log('Final job data to submit:', jobDataToSubmit);
      
      if (isEditMode && id) {
        await updateJobListing(id, jobDataToSubmit);
        toast.success('Job listing updated successfully!');
      } else {
        await createJobListing(jobDataToSubmit);
        toast.success('Job listing created successfully!');
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job listing');
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
