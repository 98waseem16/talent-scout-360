
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LogoUpload from '@/components/LogoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle } from 'lucide-react';
import { createJobListing, updateJobListing, getJobById } from '@/lib/jobs/jobsApi';
import { JobFormData } from '@/lib/types/job.types';

const PostJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      // Store the current path for redirection after login
      navigate('/auth', { 
        state: { returnTo: window.location.pathname } 
      });
      
      // Show error toast
      toast.error("Authentication Required", {
        description: "You need to sign in to post a job"
      });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: '',
    benefits: '',
    application_url: '',
    contact_email: '',
    logo: '',
    featured: false,
    salary: '',
  });

  const [loading, setLoading] = useState(false);
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
              requirements: Array.isArray(jobData.requirements) 
                ? jobData.requirements.join('\n') 
                : '',
              benefits: Array.isArray(jobData.benefits) 
                ? jobData.benefits.join('\n') 
                : '',
              responsibilities: Array.isArray(jobData.responsibilities)
                ? jobData.responsibilities.join('\n')
                : '',
              application_url: '', // These fields aren't in the DB schema
              contact_email: '',   // These fields aren't in the DB schema
              logo: jobData.logo || '',
              featured: jobData.featured || false,
              salary: jobData.salary || '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to post a job');
      return;
    }
    
    setLoading(true);
    
    try {
      // Upload logo if provided
      let logoUrl = formData.logo;
      
      if (logoFile) {
        const fileName = `${user.id}-${Date.now()}-${logoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);
          
        logoUrl = urlData.publicUrl;
      }
      
      // Prepare job data with user_id
      const jobDataToSubmit: JobFormData = {
        ...formData,
        logo: logoUrl,
        user_id: user.id
      };
      
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isEditMode ? 'Edit Job Listing' : 'Post a New Job'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode 
              ? 'Update your job listing with the latest information'
              : 'Fill out the form below to post your job to our platform'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input 
                  id="company" 
                  name="company" 
                  value={formData.company} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Acme Inc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  placeholder="e.g. New York, NY"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Job Type *</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Salary Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Salary Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input 
                id="salary" 
                name="salary" 
                value={formData.salary} 
                onChange={handleChange} 
                placeholder="e.g. $50,000 - $80,000"
              />
            </div>
          </div>
          
          {/* Job Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Job Details</h2>
            
            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
                placeholder="Describe the role, responsibilities, and ideal candidate"
                className="min-h-[150px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea 
                id="requirements" 
                name="requirements" 
                value={formData.requirements} 
                onChange={handleChange} 
                placeholder="List the skills, qualifications, and experience required"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea 
                id="benefits" 
                name="benefits" 
                value={formData.benefits} 
                onChange={handleChange} 
                placeholder="Describe the benefits, perks, and company culture"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <Textarea 
                id="responsibilities" 
                name="responsibilities" 
                value={formData.responsibilities} 
                onChange={handleChange} 
                placeholder="List the key responsibilities for this role"
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          {/* Application Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Application Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="application_url">Application URL *</Label>
                <Input 
                  id="application_url" 
                  name="application_url" 
                  type="url" 
                  value={formData.application_url} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. https://yourcompany.com/careers/apply"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input 
                  id="contact_email" 
                  name="contact_email" 
                  type="email" 
                  value={formData.contact_email} 
                  onChange={handleChange} 
                  placeholder="e.g. jobs@yourcompany.com"
                />
              </div>
            </div>
          </div>
          
          {/* Company Logo */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Company Logo</h2>
            <LogoUpload 
              currentLogoUrl={formData.logo} 
              onLogoChange={handleLogoChange} 
            />
          </div>
          
          {/* Featured Option */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Listing Options</h2>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="featured" 
                checked={formData.featured} 
                onCheckedChange={(checked) => 
                  handleCheckboxChange('featured', checked as boolean)
                } 
              />
              <Label htmlFor="featured">
                Feature this job listing (additional fee applies)
              </Label>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? 'Saving...' : isEditMode ? 'Update Job Listing' : 'Post Job Listing'}
            </Button>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
};

export default PostJob;
