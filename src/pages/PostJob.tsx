
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Trash } from 'lucide-react';

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'Full-time',
    description: '',
    responsibilities: [''],
    requirements: [''],
    benefits: [''],
    featured: false,
    logo: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchCompanyProfile = async () => {
      try {
        setProfileLoading(true);
        const { data, error } = await supabase
          .from('job_poster_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Record not found, redirect to create profile
            navigate('/job-poster-profile');
            toast({
              title: 'Profile Required',
              description: 'Please complete your company profile before posting a job',
            });
          } else {
            throw error;
          }
        }

        if (data) {
          setCompanyProfile(data);
          setJobData(prev => ({
            ...prev,
            company: data.company_name || '',
            logo: data.logo_url || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load company profile',
          variant: 'destructive'
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [user, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setJobData(prev => ({ ...prev, [name]: checked }));
  };

  const handleArrayFieldChange = (
    arrayName: 'responsibilities' | 'requirements' | 'benefits',
    index: number,
    value: string
  ) => {
    setJobData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = value;
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayField = (arrayName: 'responsibilities' | 'requirements' | 'benefits') => {
    setJobData(prev => {
      return { ...prev, [arrayName]: [...prev[arrayName], ''] };
    });
  };

  const removeArrayField = (arrayName: 'responsibilities' | 'requirements' | 'benefits', index: number) => {
    if (jobData[arrayName].length === 1) return;
    
    setJobData(prev => {
      const newArray = [...prev[arrayName]];
      newArray.splice(index, 1);
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['title', 'company', 'location', 'salary', 'description'];
    for (const field of requiredFields) {
      if (!jobData[field as keyof typeof jobData]) {
        toast({
          title: 'Error',
          description: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
          variant: 'destructive'
        });
        return;
      }
    }

    // Filter out empty array items
    const filteredResponsibilities = jobData.responsibilities.filter(item => item.trim());
    const filteredRequirements = jobData.requirements.filter(item => item.trim());
    const filteredBenefits = jobData.benefits.filter(item => item.trim());

    if (filteredResponsibilities.length === 0 || filteredRequirements.length === 0 || filteredBenefits.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one entry for responsibilities, requirements, and benefits',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('job_postings')
        .insert({
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          salary: jobData.salary,
          type: jobData.type,
          description: jobData.description,
          responsibilities: filteredResponsibilities,
          requirements: filteredRequirements,
          benefits: filteredBenefits,
          featured: jobData.featured,
          logo: jobData.logo || '/placeholder.svg', // Use company logo or fallback
          user_id: user?.id
        });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Job posted successfully'
      });
      
      navigate('/jobs');
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to post job',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Fill out the form below to create a new job listing.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Company Information Section */}
            <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-md">
                <AvatarImage src={companyProfile?.logo_url} alt={companyProfile?.company_name} />
                <AvatarFallback className="rounded-md text-lg">
                  {companyProfile?.company_name?.substring(0, 2).toUpperCase() || 'CO'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-medium">{companyProfile?.company_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {companyProfile?.industry} · {companyProfile?.company_size || 'Company'}
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm" 
                  type="button"
                  onClick={() => navigate('/job-poster-profile')}
                >
                  Edit company profile
                </Button>
              </div>
            </div>
            
            {/* Job Information */}
            <div className="space-y-1">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                value={jobData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={jobData.location}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco, CA or Remote"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="salary">Salary *</Label>
                <Input
                  id="salary"
                  name="salary"
                  value={jobData.salary}
                  onChange={handleChange}
                  placeholder="e.g. $100,000 - $120,000"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="type">Job Type *</Label>
              <Select
                value={jobData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={jobData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of the job..."
                className="min-h-[120px]"
                required
              />
            </div>
            
            {/* Responsibilities */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Responsibilities *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('responsibilities')}
                  className="h-8 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              
              {jobData.responsibilities.map((item, index) => (
                <div key={`resp-${index}`} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayFieldChange('responsibilities', index, e.target.value)}
                    placeholder={`Responsibility ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayField('responsibilities', index)}
                    disabled={jobData.responsibilities.length === 1}
                    className="h-10 w-10 shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Requirements */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Requirements *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('requirements')}
                  className="h-8 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              
              {jobData.requirements.map((item, index) => (
                <div key={`req-${index}`} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayFieldChange('requirements', index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayField('requirements', index)}
                    disabled={jobData.requirements.length === 1}
                    className="h-10 w-10 shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Benefits *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('benefits')}
                  className="h-8 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              
              {jobData.benefits.map((item, index) => (
                <div key={`ben-${index}`} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayFieldChange('benefits', index, e.target.value)}
                    placeholder={`Benefit ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayField('benefits', index)}
                    disabled={jobData.benefits.length === 1}
                    className="h-10 w-10 shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Featured Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={jobData.featured}
                onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
              />
              <Label htmlFor="featured">Feature this job (increases visibility)</Label>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => navigate('/jobs')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting Job...
                </>
              ) : 'Post Job'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
};

export default PostJob;
