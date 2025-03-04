
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload } from 'lucide-react';

const companySize = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5001+ employees'
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Media',
  'Hospitality',
  'Transportation',
  'Construction',
  'Energy',
  'Agriculture',
  'Other'
];

const JobPosterProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    recruiter_title: '',
    company_size: '',
    industry: '',
    company_website: '',
    company_description: '',
    logo_url: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchJobPosterProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('job_poster_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setFormData({
            company_name: data.company_name || '',
            recruiter_title: data.recruiter_title || '',
            company_size: data.company_size || '',
            industry: data.industry || '',
            company_website: data.company_website || '',
            company_description: data.company_description || '',
            logo_url: data.logo_url || ''
          });
        }
      } catch (error) {
        console.error('Error fetching job poster profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile information',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobPosterProfile();
  }, [user, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      setLogoLoading(true);
      
      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      // Update the logo URL in the form data
      setFormData((prev) => ({ ...prev, logo_url: publicUrl }));
      
      toast({
        title: 'Success',
        description: 'Company logo uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload company logo',
        variant: 'destructive'
      });
    } finally {
      setLogoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name) {
      toast({
        title: 'Error',
        description: 'Company name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('job_poster_profiles')
        .upsert({
          id: user?.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
      
      // Redirect to jobs page after successful update
      navigate('/jobs');
    } catch (error) {
      console.error('Error updating job poster profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8">Company Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            This information will be visible to job seekers when they view your job postings.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="company_logo">Company Logo</Label>
              <div className="flex items-center space-x-4 mt-2">
                <Avatar className="h-20 w-20 border">
                  <AvatarImage src={formData.logo_url} />
                  <AvatarFallback className="text-lg">
                    {formData.company_name?.substring(0, 2).toUpperCase() || 'CO'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                      {logoLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>{formData.logo_url ? 'Change Logo' : 'Upload Logo'}</span>
                        </>
                      )}
                    </div>
                  </Label>
                  <Input 
                    id="logo-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={logoLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Recommended: Square image, 512x512px</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Enter your company name"
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="recruiter_title">Your Position</Label>
              <Input
                id="recruiter_title"
                name="recruiter_title"
                value={formData.recruiter_title}
                onChange={handleChange}
                placeholder="e.g. HR Manager, Recruiter, CEO"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="company_size">Company Size</Label>
                <Select
                  value={formData.company_size}
                  onValueChange={(value) => handleSelectChange('company_size', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySize.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleSelectChange('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="company_website">Company Website</Label>
              <Input
                id="company_website"
                name="company_website"
                value={formData.company_website}
                onChange={handleChange}
                placeholder="https://example.com"
                type="url"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="company_description">Company Description</Label>
              <Textarea
                id="company_description"
                name="company_description"
                value={formData.company_description}
                onChange={handleChange}
                placeholder="Tell potential candidates about your company"
                className="min-h-[120px]"
              />
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
                  Saving...
                </>
              ) : 'Save Profile'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
};

export default JobPosterProfile;
