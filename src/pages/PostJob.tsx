import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Briefcase, 
  Building, 
  DollarSign, 
  CreditCard, 
  MapPin, 
  BarChart4, 
  Users, 
  LineChart, 
  Layers, 
  Clock, 
  Award, 
  Globe, 
  Calendar, 
  PlaneLanding, 
  AlertCircle,
  X as XIcon,
  Loader2
} from 'lucide-react';

const PostJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    responsibilities: [''],
    requirements: [''],
    benefits: [''],
    logo: '/placeholder.svg',
    salary: '',
    type: 'Full-time',
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
    hiring_urgency: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [field]: newList }));
  };
  
  const addListItem = (field: 'responsibilities' | 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };
  
  const removeListItem = (index: number, field: 'responsibilities' | 'requirements' | 'benefits') => {
    if (formData[field].length <= 1) return;
    const newList = [...formData[field]];
    newList.splice(index, 1);
    setFormData(prev => ({ ...prev, [field]: newList }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.company || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Filter out empty list items
      const dataToSubmit = {
        ...formData,
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        requirements: formData.requirements.filter(r => r.trim()),
        benefits: formData.benefits.filter(b => b.trim()),
        user_id: user?.id
      };
      
      const { error } = await supabase
        .from('job_postings')
        .insert([dataToSubmit]);
        
      if (error) throw error;
      
      toast.success("Job posted successfully!");
      navigate('/jobs');
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error("Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-border shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-medium mb-2">Post a Startup Job</h1>
          <p className="text-muted-foreground mb-6">
            Reach thousands of qualified candidates looking to join innovative startups
          </p>
          
          {/* Benefits of posting */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Reach Startup Talent</h3>
              <p className="text-sm text-muted-foreground">
                Connect with candidates who specifically want to work at startups
              </p>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                <BarChart4 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium mb-1">AI-Powered Matching</h3>
              <p className="text-sm text-muted-foreground">
                Our algorithms match your job with the best qualified candidates
              </p>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Quick Process</h3>
              <p className="text-sm text-muted-foreground">
                Post your job in minutes and start receiving applications today
              </p>
            </div>
          </div>
          
          {/* Job Posting Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="space-y-1">
                <h2 className="text-xl font-medium">Basic Information</h2>
                <p className="text-sm text-muted-foreground">
                  General information about the position and company
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium">
                    Job Title <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g. Senior Frontend Developer"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="company" className="block text-sm font-medium">
                    Company Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="company"
                      name="company"
                      placeholder="e.g. TechStartup Inc."
                      value={formData.company}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-medium">
                    Location <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g. San Francisco, CA or Remote"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="salary" className="block text-sm font-medium">
                    Custom Salary Display (Optional)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="salary"
                      name="salary"
                      placeholder="e.g. $120,000 - $150,000"
                      value={formData.salary}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium">
                  Job Description <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the role and what the candidate will be doing..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  required
                />
              </div>
              
              {/* Startup Information */}
              <div className="space-y-1 pt-4 border-t">
                <h2 className="text-xl font-medium">Startup Information</h2>
                <p className="text-sm text-muted-foreground">
                  Tell candidates about your startup's stage and environment
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="investment-stage" className="block text-sm font-medium">
                    Investment Stage
                  </label>
                  <Select 
                    value={formData.investment_stage} 
                    onValueChange={(value) => handleSelectChange('investment_stage', value)}
                  >
                    <SelectTrigger id="investment-stage" className="w-full">
                      <SelectValue placeholder="Select stage" />
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
                  <label htmlFor="team-size" className="block text-sm font-medium">
                    Team Size
                  </label>
                  <Select 
                    value={formData.team_size} 
                    onValueChange={(value) => handleSelectChange('team_size', value)}
                  >
                    <SelectTrigger id="team-size" className="w-full">
                      <SelectValue placeholder="Select size" />
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
                  <label htmlFor="revenue-model" className="block text-sm font-medium">
                    Revenue Model
                  </label>
                  <Select 
                    value={formData.revenue_model} 
                    onValueChange={(value) => handleSelectChange('revenue_model', value)}
                  >
                    <SelectTrigger id="revenue-model" className="w-full">
                      <SelectValue placeholder="Select model" />
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
              </div>
              
              {/* Role Information */}
              <div className="space-y-1 pt-4 border-t">
                <h2 className="text-xl font-medium">Role Information</h2>
                <p className="text-sm text-muted-foreground">
                  Specify details about the role and requirements
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="department" className="block text-sm font-medium">
                    Department
                  </label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => handleSelectChange('department', value)}
                  >
                    <SelectTrigger id="department" className="w-full">
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
                  <label htmlFor="seniority-level" className="block text-sm font-medium">
                    Seniority Level
                  </label>
                  <Select 
                    value={formData.seniority_level} 
                    onValueChange={(value) => handleSelectChange('seniority_level', value)}
                  >
                    <SelectTrigger id="seniority-level" className="w-full">
                      <SelectValue placeholder="Select level" />
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
                  <label htmlFor="job-type" className="block text-sm font-medium">
                    Job Type
                  </label>
                  <Select 
                    value={formData.job_type} 
                    onValueChange={(value) => handleSelectChange('job_type', value)}
                  >
                    <SelectTrigger id="job-type" className="w-full">
                      <SelectValue placeholder="Select type" />
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
              
              {/* Compensation & Work Details */}
              <div className="space-y-1 pt-4 border-t">
                <h2 className="text-xl font-medium">Compensation & Work Details</h2>
                <p className="text-sm text-muted-foreground">
                  Provide compensation and work arrangement details
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="salary-range" className="block text-sm font-medium">
                    Salary Range
                  </label>
                  <Select 
                    value={formData.salary_range} 
                    onValueChange={(value) => handleSelectChange('salary_range', value)}
                  >
                    <SelectTrigger id="salary-range" className="w-full">
                      <SelectValue placeholder="Select range" />
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
                  <label htmlFor="equity" className="block text-sm font-medium">
                    Equity
                  </label>
                  <Select 
                    value={formData.equity} 
                    onValueChange={(value) => handleSelectChange('equity', value)}
                  >
                    <SelectTrigger id="equity" className="w-full">
                      <SelectValue placeholder="Select equity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="0.1%-0.5%">0.1%-0.5%</SelectItem>
                      <SelectItem value="0.5%-1%">0.5%-1%</SelectItem>
                      <SelectItem value="1%+">1%+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="remote-onsite" className="block text-sm font-medium">
                    Remote vs. Onsite
                  </label>
                  <Select 
                    value={formData.remote_onsite} 
                    onValueChange={(value) => handleSelectChange('remote_onsite', value)}
                  >
                    <SelectTrigger id="remote-onsite" className="w-full">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fully Remote">Fully Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="work-hours" className="block text-sm font-medium">
                    Work Hours
                  </label>
                  <Select 
                    value={formData.work_hours} 
                    onValueChange={(value) => handleSelectChange('work_hours', value)}
                  >
                    <SelectTrigger id="work-hours" className="w-full">
                      <SelectValue placeholder="Select hours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                      <SelectItem value="Async Work">Async Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="visa-sponsorship" className="flex items-center space-x-2 text-sm font-medium">
                    <span>Visa Sponsorship Available</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="visa-sponsorship"
                      checked={formData.visa_sponsorship}
                      onCheckedChange={(checked) => handleSwitchChange('visa_sponsorship', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.visa_sponsorship ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="hiring-urgency" className="block text-sm font-medium">
                    Hiring Urgency
                  </label>
                  <Select 
                    value={formData.hiring_urgency} 
                    onValueChange={(value) => handleSelectChange('hiring_urgency', value)}
                  >
                    <SelectTrigger id="hiring-urgency" className="w-full">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Immediate Hire">Immediate Hire</SelectItem>
                      <SelectItem value="Within a Month">Within a Month</SelectItem>
                      <SelectItem value="Open to Future Applicants">Open to Future Applicants</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Responsibilities, Requirements, and Benefits */}
              <div className="space-y-1 pt-4 border-t">
                <h2 className="text-xl font-medium">Job Details</h2>
                <p className="text-sm text-muted-foreground">
                  Add specific responsibilities, requirements, and benefits
                </p>
              </div>
              
              {/* Responsibilities */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Key Responsibilities</label>
                {formData.responsibilities.map((item, index) => (
                  <div key={`resp-${index}`} className="flex gap-2">
                    <Input
                      placeholder={`Responsibility ${index + 1}`}
                      value={item}
                      onChange={(e) => handleListChange(index, e.target.value, 'responsibilities')}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeListItem(index, 'responsibilities')}
                    >
                      <span className="sr-only">Remove</span>
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => addListItem('responsibilities')}
                >
                  Add Responsibility
                </Button>
              </div>
              
              {/* Requirements */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Requirements</label>
                {formData.requirements.map((item, index) => (
                  <div key={`req-${index}`} className="flex gap-2">
                    <Input
                      placeholder={`Requirement ${index + 1}`}
                      value={item}
                      onChange={(e) => handleListChange(index, e.target.value, 'requirements')}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeListItem(index, 'requirements')}
                    >
                      <span className="sr-only">Remove</span>
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => addListItem('requirements')}
                >
                  Add Requirement
                </Button>
              </div>
              
              {/* Benefits */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Benefits</label>
                {formData.benefits.map((item, index) => (
                  <div key={`benefit-${index}`} className="flex gap-2">
                    <Input
                      placeholder={`Benefit ${index + 1}`}
                      value={item}
                      onChange={(e) => handleListChange(index, e.target.value, 'benefits')}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeListItem(index, 'benefits')}
                    >
                      <span className="sr-only">Remove</span>
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => addListItem('benefits')}
                >
                  Add Benefit
                </Button>
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
                      Posting Job...
                    </>
                  ) : "Post Job"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default PostJob;
