
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
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Briefcase, 
  Building, 
  DollarSign, 
  MapPin, 
  BarChart4, 
  Users, 
  Clock, 
  Globe, 
  X as XIcon,
  Loader2,
  Zap
} from 'lucide-react';
import { createJobListing, updateJobListing, getJobById } from '@/lib/jobs/jobsApi';
import { JobFormData } from '@/lib/types/job.types';

const PostJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    responsibilities: [''],
    requirements: [''],
    benefits: [''],
    logo: '/placeholder.svg',
    salary: '',
    investment_stage: '',
    team_size: '',
    revenue_model: '',
    department: '',
    seniority_level: '',
    job_type: '',
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
              salary: jobData.salary || '',
              investment_stage: jobData.investment_stage || '',
              team_size: jobData.team_size || '',
              revenue_model: jobData.revenue_model || '',
              department: jobData.department || '',
              seniority_level: jobData.seniority_level || '',
              job_type: jobData.job_type || '',
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

  // Fixed event handler to handle different element types
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
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
            {!isEditMode && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Reach Top Talent</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with motivated candidates actively seeking startup opportunities
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Quick Setup</h3>
                    <p className="text-sm text-muted-foreground">
                      Create and publish your job posting in just a few minutes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Globe className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Wide Distribution</h3>
                    <p className="text-sm text-muted-foreground">
                      Your job will be shared across our partner networks for maximum visibility
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Job Posting Form */}
            <form onSubmit={handleSubmit} className="grid gap-6">
              {/* Basic Information */}
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
              
              {/* Startup Specific Information */}
              <div className="space-y-1 pt-4 border-t">
                <h2 className="text-xl font-medium">Startup Details</h2>
                <p className="text-sm text-muted-foreground">
                  Help candidates understand your company's stage and culture
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="investment_stage" className="flex items-center space-x-2 text-sm font-medium">
                    <BarChart4 className="h-5 w-5 text-muted-foreground" />
                    <span>Investment Stage</span>
                  </label>
                  <Select 
                    value={formData.investment_stage} 
                    onValueChange={(value) => handleSelectChange('investment_stage', value)}
                  >
                    <SelectTrigger id="investment_stage">
                      <SelectValue placeholder="Select investment stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bootstrapped">Bootstrapped</SelectItem>
                      <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                      <SelectItem value="Seed">Seed</SelectItem>
                      <SelectItem value="Series A">Series A</SelectItem>
                      <SelectItem value="Series B">Series B</SelectItem>
                      <SelectItem value="Series C+">Series C+</SelectItem>
                      <SelectItem value="Public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="team_size" className="flex items-center space-x-2 text-sm font-medium">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>Team Size</span>
                  </label>
                  <Select 
                    value={formData.team_size} 
                    onValueChange={(value) => handleSelectChange('team_size', value)}
                  >
                    <SelectTrigger id="team_size">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="500+">500+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="revenue_model" className="flex items-center space-x-2 text-sm font-medium">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span>Revenue Model</span>
                  </label>
                  <Select 
                    value={formData.revenue_model} 
                    onValueChange={(value) => handleSelectChange('revenue_model', value)}
                  >
                    <SelectTrigger id="revenue_model">
                      <SelectValue placeholder="Select revenue model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Subscription">Subscription</SelectItem>
                      <SelectItem value="Marketplace">Marketplace</SelectItem>
                      <SelectItem value="SaaS">SaaS</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                      <SelectItem value="Ads">Ads</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="type" className="flex items-center space-x-2 text-sm font-medium">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <span>Job Type*</span>
                  </label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Job Role & Function */}
              <div className="space-y-1 pt-4 border-t">
                <h2 className="text-xl font-medium">Job Role & Function</h2>
                <p className="text-sm text-muted-foreground">
                  Details about the position's department and seniority level
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="department" className="flex items-center space-x-2 text-sm font-medium">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <span>Department</span>
                  </label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => handleSelectChange('department', value)}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Customer Support">Customer Support</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="seniority_level" className="flex items-center space-x-2 text-sm font-medium">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <span>Seniority Level</span>
                  </label>
                  <Select 
                    value={formData.seniority_level} 
                    onValueChange={(value) => handleSelectChange('seniority_level', value)}
                  >
                    <SelectTrigger id="seniority_level">
                      <SelectValue placeholder="Select seniority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Entry-Level">Entry-Level</SelectItem>
                      <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="VP">VP</SelectItem>
                      <SelectItem value="C-Level">C-Level</SelectItem>
                      <SelectItem value="Who Cares">Who Cares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="job_type" className="flex items-center space-x-2 text-sm font-medium">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <span>Job Type</span>
                  </label>
                  <Select 
                    value={formData.job_type} 
                    onValueChange={(value) => handleSelectChange('job_type', value)}
                  >
                    <SelectTrigger id="job_type">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Compensation & Benefits */}
              <div className="space-y-1 pt-4 border-t">
                <h2 className="text-xl font-medium">Compensation & Benefits</h2>
                <p className="text-sm text-muted-foreground">
                  Financial and non-financial benefits of the position
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="salary_range" className="flex items-center space-x-2 text-sm font-medium">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span>Salary Range</span>
                  </label>
                  <Select 
                    value={formData.salary_range} 
                    onValueChange={(value) => handleSelectChange('salary_range', value)}
                  >
                    <SelectTrigger id="salary_range">
                      <SelectValue placeholder="Select salary range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Negotiable">Negotiable</SelectItem>
                      <SelectItem value="$40K-$60K">$40K-$60K</SelectItem>
                      <SelectItem value="$60K-$80K">$60K-$80K</SelectItem>
                      <SelectItem value="$80K-$120K">$80K-$120K</SelectItem>
                      <SelectItem value="$120K+">$120K+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="equity" className="flex items-center space-x-2 text-sm font-medium">
                    <BarChart4 className="h-5 w-5 text-muted-foreground" />
                    <span>Equity</span>
                  </label>
                  <Select 
                    value={formData.equity} 
                    onValueChange={(value) => handleSelectChange('equity', value)}
                  >
                    <SelectTrigger id="equity">
                      <SelectValue placeholder="Select equity range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="0.1%-0.5%">0.1%-0.5%</SelectItem>
                      <SelectItem value="0.5%-1%">0.5%-1%</SelectItem>
                      <SelectItem value="1%+">1%+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Working Conditions */}
              <div className="space-y-1 pt-4 border-t">
                <h2 className="text-xl font-medium">Working Conditions</h2>
                <p className="text-sm text-muted-foreground">
                  Details about work location, schedule, and visa requirements
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="remote_onsite" className="flex items-center space-x-2 text-sm font-medium">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <span>Remote vs. Onsite</span>
                  </label>
                  <Select 
                    value={formData.remote_onsite} 
                    onValueChange={(value) => handleSelectChange('remote_onsite', value)}
                  >
                    <SelectTrigger id="remote_onsite">
                      <SelectValue placeholder="Select work location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fully Remote">Fully Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="work_hours" className="flex items-center space-x-2 text-sm font-medium">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>Work Hours</span>
                  </label>
                  <Select 
                    value={formData.work_hours} 
                    onValueChange={(value) => handleSelectChange('work_hours', value)}
                  >
                    <SelectTrigger id="work_hours">
                      <SelectValue placeholder="Select work hour structure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                      <SelectItem value="Async Work">Async Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="visa_sponsorship" className="flex items-center space-x-2 text-sm font-medium">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <span>Visa Sponsorship</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="visa_sponsorship"
                      checked={formData.visa_sponsorship}
                      onCheckedChange={(checked) => handleSwitchChange('visa_sponsorship', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.visa_sponsorship ? 'Yes, we offer visa sponsorship' : 'No visa sponsorship available'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="hiring_urgency" className="flex items-center space-x-2 text-sm font-medium">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>Hiring Urgency</span>
                  </label>
                  <Select 
                    value={formData.hiring_urgency} 
                    onValueChange={(value) => handleSelectChange('hiring_urgency', value)}
                  >
                    <SelectTrigger id="hiring_urgency">
                      <SelectValue placeholder="Select hiring timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Immediate Hire">Immediate Hire</SelectItem>
                      <SelectItem value="Within a Month">Within a Month</SelectItem>
                      <SelectItem value="Open to Future Applicants">Open to Future Applicants</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Job Details */}
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
              <div className="space-y-1 pt-4 border-t">
                <h2 className="text-xl font-medium">Visibility Options</h2>
                <p className="text-sm text-muted-foreground">
                  Control how your job posting appears on our platform
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="featured-job" className="flex items-center space-x-2 text-sm font-medium">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span>Feature this job in the Trending Section</span>
                  <span className="ml-2 text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Premium</span>
                </label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured-job"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.featured ? 'Your job will appear in the Trending Jobs section' : 'Standard job visibility'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Featured jobs receive up to 5x more visibility and applicants.
                </p>
              </div>
              
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PostJob;
