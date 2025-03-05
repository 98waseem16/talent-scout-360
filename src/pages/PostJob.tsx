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
        description: "You need to sign in to post a job",
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    description: '',
    requirements: '',
    benefits: '',
    application_url: '',
    contact_email: '',
    logo_url: '',
    is_remote: false,
    is_featured: false,
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
              salary_min: jobData.salary_min?.toString() || '',
              salary_max: jobData.salary_max?.toString() || '',
              salary_currency: jobData.salary_currency || 'USD',
              description: jobData.description || '',
              requirements: jobData.requirements || '',
              benefits: jobData.benefits || '',
              application_url: jobData.application_url || '',
              contact_email: jobData.contact_email || '',
              logo_url: jobData.logo_url || '',
              is_remote: jobData.is_remote || false,
              is_featured: jobData.is_featured || false,
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
      let logoUrl = formData.logo_url;
      
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
      
      // Prepare job data
      const jobData = {
        ...formData,
        logo_url: logoUrl,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        user_id: user.id
      };
      
      if (isEditMode && id) {
        await updateJobListing(id, jobData);
        toast.success('Job listing updated successfully!');
      } else {
        await createJobListing(jobData);
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
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_remote" 
                checked={formData.is_remote} 
                onCheckedChange={(checked) => 
                  handleCheckboxChange('is_remote', checked as boolean)
                } 
              />
              <Label htmlFor="is_remote">This is a remote position</Label>
            </div>
          </div>
          
          {/* Salary Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Salary Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_min">Minimum Salary</Label>
                <Input 
                  id="salary_min" 
                  name="salary_min" 
                  type="number" 
                  value={formData.salary_min} 
                  onChange={handleChange} 
                  placeholder="e.g. 50000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary_max">Maximum Salary</Label>
                <Input 
                  id="salary_max" 
                  name="salary_max" 
                  type="number" 
                  value={formData.salary_max} 
                  onChange={handleChange} 
                  placeholder="e.g. 80000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary_currency">Currency</Label>
                <select
                  id="salary_currency"
                  name="salary_currency"
                  value={formData.salary_currency}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
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
              currentLogoUrl={formData.logo_url} 
              onLogoChange={handleLogoChange} 
            />
          </div>
          
          {/* Featured Option */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Listing Options</h2>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_featured" 
                checked={formData.is_featured} 
                onCheckedChange={(checked) => 
                  handleCheckboxChange('is_featured', checked as boolean)
                } 
              />
              <Label htmlFor="is_featured">
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
