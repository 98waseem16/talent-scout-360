
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Building, 
  Users, 
  Globe,
  Upload, 
  Briefcase, 
  Loader2, 
  Save,
  X as XIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  company_name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  company_website: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal('')),
  company_size: z.string().optional(),
  industry: z.string().optional(),
  company_description: z.string().min(10, {
    message: "Company description must be at least 10 characters.",
  }),
  recruiter_title: z.string().optional(),
  logo_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const JobPosterProfile: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: '',
      company_website: '',
      company_size: '',
      industry: '',
      company_description: '',
      recruiter_title: '',
      logo_url: '',
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }

    if (profile && !profile.user_type) {
      navigate('/profile-type');
    }

    if (profile?.user_type === 'job_seeker') {
      navigate('/profile/job-seeker');
    }

    const fetchProfileData = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('job_poster_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (data) {
            setProfileData(data);
            
            form.reset({
              company_name: data.company_name || '',
              company_website: data.company_website || '',
              company_size: data.company_size || '',
              industry: data.industry || '',
              company_description: data.company_description || '',
              recruiter_title: data.recruiter_title || '',
              logo_url: data.logo_url || '',
            });
          }
        } catch (error: any) {
          console.error('Error fetching profile data:', error.message);
        }
      }
    };

    fetchProfileData();
  }, [user, profile, isLoading, navigate, form]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { data: existingProfile } = await supabase
        .from('job_poster_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      let error;
      
      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('job_poster_profiles')
          .update(values)
          .eq('id', user.id);
          
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('job_poster_profiles')
          .insert({
            id: user.id,
            company_name: values.company_name,
            company_website: values.company_website || null,
            company_size: values.company_size || null,
            industry: values.industry || null,
            company_description: values.company_description || null,
            recruiter_title: values.recruiter_title || null,
            logo_url: values.logo_url || null,
          });
          
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'Profile saved',
        description: 'Your company profile has been updated successfully.',
      });

      navigate('/post-job');
    } catch (error: any) {
      toast({
        title: 'Error saving profile',
        description: error.message || 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const allowedTypes = ['jpg', 'jpeg', 'png', 'svg'];
    
    if (!allowedTypes.includes(fileExt?.toLowerCase() || '')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG or SVG image.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: 'File too large',
        description: 'Logo must be less than 2MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingLogo(true);
      
      const fileName = `${user?.id}/logo_${new Date().getTime()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      form.setValue('logo_url', urlData.publicUrl);

      toast({
        title: 'Logo uploaded',
        description: 'Your company logo has been uploaded successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload logo',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Company Profile</h1>
        <p className="text-muted-foreground mb-8">
          Complete your company profile to attract the best candidates for your job postings.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span>Company Information</span>
                </CardTitle>
                <CardDescription>
                  Tell us about your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="w-full md:w-1/3">
                    <div className="mb-4">
                      <FormLabel>Company Logo</FormLabel>
                      <div className="mt-2">
                        {form.watch('logo_url') ? (
                          <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                            <img 
                              src={form.watch('logo_url')} 
                              alt="Company logo" 
                              className="w-full h-full object-contain" 
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 rounded-full"
                              onClick={() => form.setValue('logo_url', '')}
                            >
                              <XIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="w-32 h-32 border border-dashed rounded-md flex items-center justify-center cursor-pointer"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            <div className="text-center p-2">
                              <Upload className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">Upload logo</p>
                            </div>
                          </div>
                        )}
                        <input
                          id="logo-upload"
                          type="file"
                          accept=".jpg,.jpeg,.png,.svg"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="logo_url"
                        render={({ field }) => (
                          <FormItem className="hidden">
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3 space-y-4">
                    <FormField
                      control={form.control}
                      name="company_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Acme Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company_website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Website</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. https://www.acme.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="501-1000">501-1000 employees</SelectItem>
                            <SelectItem value="1001-5000">1001-5000 employees</SelectItem>
                            <SelectItem value="5001+">5001+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Media">Media</SelectItem>
                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                            <SelectItem value="Hospitality">Hospitality</SelectItem>
                            <SelectItem value="Transportation">Transportation</SelectItem>
                            <SelectItem value="Energy">Energy</SelectItem>
                            <SelectItem value="Construction">Construction</SelectItem>
                            <SelectItem value="Real Estate">Real Estate</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="company_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell candidates about your company, mission, values, and culture" 
                          className="min-h-32 resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Recruiter Information</span>
                </CardTitle>
                <CardDescription>
                  Tell us about your role at the company
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="recruiter_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Talent Acquisition Manager, HR Director" {...field} />
                      </FormControl>
                      <FormDescription>
                        This helps candidates understand who they'll be in contact with
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/post-job')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
};

export default JobPosterProfile;
