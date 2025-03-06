
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import LogoUpload from '@/components/LogoUpload';
import JobBasicInfo from './JobBasicInfo';
import StartupDetails from './StartupDetails';
import JobRoleFunction from './JobRoleFunction';
import CompensationBenefits from './CompensationBenefits';
import WorkingConditions from './WorkingConditions';
import JobDetails from './JobDetails';
import FeaturedOption from './FeaturedOption';
import PostJobBenefits from './PostJobBenefits';
import { JobFormData } from '@/lib/types/job.types';
import { createJobListing, updateJobListing, getJobById } from '@/lib/jobs/jobsApi';

const JobForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data - including the 'salary' property
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
    responsibilities: [''],
    requirements: [''],
    benefits: [''],
    logo: '/placeholder.svg',
    investment_stage: '',
    team_size: '',
    revenue_model: '',
    department: '',
    seniority_level: '',
    salary: '', // Added missing salary field
    salary_range: '',
    equity: '',
    remote_onsite: '',
    work_hours: '',
    visa_sponsorship: false,
    hiring_urgency: '',
    featured: false,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Fetch job data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchJobData = async () => {
        try {
          const jobData = await getJobById(id);
          if (jobData) {
            setFormData({
              title: jobData.title || '',
              company: jobData.company || '',
              location: jobData.location || '',
              type: jobData.type || 'Full-time',
              description: jobData.description || '',
              requirements: jobData.requirements || [''],
              benefits: jobData.benefits || [''],
              responsibilities: jobData.responsibilities || [''],
              logo: jobData.logo || '/placeholder.svg',
              featured: jobData.featured || false,
              salary: jobData.salary || '', // Added missing salary field
              investment_stage: jobData.investment_stage || '',
              team_size: jobData.team_size || '',
              revenue_model: jobData.revenue_model || '',
              department: jobData.department || '',
              seniority_level: jobData.seniority_level || '',
              salary_range: jobData.salary_range || '',
              equity: jobData.equity || '',
              remote_onsite: jobData.remote_onsite || '',
              work_hours: jobData.work_hours || '',
              visa_sponsorship: jobData.visa_sponsorship || false,
              hiring_urgency: jobData.hiring_urgency || '',
            });
          }
        } catch (error) {
          console.error('Error fetching job data:', error);
          toast.error('Failed to load job data');
        }
      };

      fetchJobData();
    }
  }, [id, isEditMode]);

  // Event handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleListChange = (index: number, value: string, field: 'responsibilities' | 'requirements' | 'benefits') => {
    const newList = [...(formData[field] as string[])];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [field]: newList }));
  };
  
  const addListItem = (field: 'responsibilities' | 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };
  
  const removeListItem = (index: number, field: 'responsibilities' | 'requirements' | 'benefits') => {
    if ((formData[field] as string[]).length <= 1) return;
    const newList = [...(formData[field] as string[])];
    newList.splice(index, 1);
    setFormData(prev => ({ ...prev, [field]: newList }));
  };

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
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
        const fileName = `${Date.now()}-${logoFile.name}`;
        console.log('Uploading logo file:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, {
            upsert: false,
            cacheControl: '3600'
          });
          
        if (uploadError) {
          console.error('Error uploading logo:', uploadError);
          toast.error(`Error uploading logo: ${uploadError.message}`);
          setIsSubmitting(false);
          return;
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
    } catch (error: any) {
      console.error('Error saving job:', error);
      toast.error(`Failed to save job listing: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-8 mb-8">
      <h1 className="text-3xl font-medium mb-2">
        {isEditMode ? 'Edit Job Listing' : 'Post a Startup Job'}
      </h1>
      <p className="text-muted-foreground mb-6">
        {isEditMode 
          ? 'Update your job listing with the latest information'
          : 'Reach thousands of qualified candidates looking to join innovative startups'}
      </p>
      
      {/* Benefits of posting */}
      {!isEditMode && <PostJobBenefits />}
      
      {/* Job Posting Form */}
      <form onSubmit={handleSubmit} className="grid gap-6">
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
        <FeaturedOption featured={formData.featured || false} handleSwitchChange={handleSwitchChange} />
        
        <div className="pt-6">
          <Button 
            type="submit" 
            className="w-full md:w-auto" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating Job...' : 'Posting Job...'}
              </>
            ) : isEditMode ? "Update Job" : "Post Job"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
