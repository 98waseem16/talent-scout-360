
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
  User, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  MapPin, 
  Tags, 
  Building, 
  Clock, 
  Upload, 
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
  job_title: z.string().min(2, {
    message: "Job title must be at least 2 characters.",
  }),
  education: z.string().optional(),
  experience_years: z.string().min(1, {
    message: "Please select your years of experience.",
  }),
  desired_salary_range: z.string().optional(),
  skills: z.string().optional(),
  preferred_locations: z.string().optional(),
  preferred_job_types: z.string().optional(),
  preferred_industries: z.string().optional(),
  resume_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const JobSeekerProfile: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [newJobType, setNewJobType] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [newIndustry, setNewIndustry] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      job_title: '',
      education: '',
      experience_years: '',
      desired_salary_range: '',
      skills: '',
      preferred_locations: '',
      preferred_job_types: '',
      preferred_industries: '',
      resume_url: '',
    },
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      navigate('/auth');
    }

    // Redirect to profile type selection if no user type
    if (profile && !profile.user_type) {
      navigate('/profile-type');
    }

    // Redirect to job poster profile if user is a job poster
    if (profile?.user_type === 'job_poster') {
      navigate('/profile/job-poster');
    }

    // Fetch job seeker profile data
    const fetchProfileData = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('job_seeker_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (data) {
            setProfileData(data);
            
            // Set form values
            form.reset({
              job_title: data.job_title || '',
              education: data.education || '',
              experience_years: data.experience_years?.toString() || '',
              desired_salary_range: data.desired_salary_range || '',
              resume_url: data.resume_url || '',
            });

            // Set array values
            if (data.skills) setSkills(data.skills);
            if (data.preferred_locations) setLocations(data.preferred_locations);
            if (data.preferred_job_types) setJobTypes(data.preferred_job_types);
            if (data.preferred_industries) setIndustries(data.preferred_industries);
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
      // Prepare data with arrays
      const profileData = {
        ...values,
        skills: skills,
        preferred_locations: locations,
        preferred_job_types: jobTypes,
        preferred_industries: industries,
        experience_years: parseInt(values.experience_years),
      };

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('job_seeker_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      let error;
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('job_seeker_profiles')
          .update(profileData)
          .eq('id', user.id);
          
        error = updateError;
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('job_seeker_profiles')
          .insert([{ id: user.id, ...profileData }]);
          
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'Profile saved',
        description: 'Your job seeker profile has been updated successfully.',
      });

      // Redirect to jobs page
      navigate('/jobs');
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

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const allowedTypes = ['pdf', 'doc', 'docx'];
    
    if (!allowedTypes.includes(fileExt?.toLowerCase() || '')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or Word document.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: 'File too large',
        description: 'Resume must be less than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingResume(true);
      
      // Upload file to Supabase Storage
      const fileName = `${user?.id}/resume_${new Date().getTime()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // Set the URL in the form
      form.setValue('resume_url', urlData.publicUrl);

      toast({
        title: 'Resume uploaded',
        description: 'Your resume has been uploaded successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload resume',
        variant: 'destructive',
      });
    } finally {
      setUploadingResume(false);
    }
  };

  // Functions to manage array fields
  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      setLocations([...locations, newLocation]);
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const addJobType = () => {
    if (newJobType && !jobTypes.includes(newJobType)) {
      setJobTypes([...jobTypes, newJobType]);
      setNewJobType('');
    }
  };

  const removeJobType = (index: number) => {
    setJobTypes(jobTypes.filter((_, i) => i !== index));
  };

  const addIndustry = () => {
    if (newIndustry && !industries.includes(newIndustry)) {
      setIndustries([...industries, newIndustry]);
      setNewIndustry('');
    }
  };

  const removeIndustry = (index: number) => {
    setIndustries(industries.filter((_, i) => i !== index));
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
        <h1 className="text-3xl font-semibold mb-4">Job Seeker Profile</h1>
        <p className="text-muted-foreground mb-8">
          Complete your profile to help employers find you and match with relevant job opportunities.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Professional Information</span>
                </CardTitle>
                <CardDescription>
                  Tell us about your current role and experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current/Desired Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience_years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select years of experience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Less than 1 year</SelectItem>
                          <SelectItem value="1">1 year</SelectItem>
                          <SelectItem value="2">2 years</SelectItem>
                          <SelectItem value="3">3 years</SelectItem>
                          <SelectItem value="4">4 years</SelectItem>
                          <SelectItem value="5">5 years</SelectItem>
                          <SelectItem value="6">6-9 years</SelectItem>
                          <SelectItem value="10">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. Bachelor's in Computer Science, University of California" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel htmlFor="skills">Skills</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {skills.map((skill, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                      >
                        <span>{skill}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full"
                          onClick={() => removeSkill(index)}
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill (e.g. JavaScript, Project Management)"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addSkill}>Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Job Preferences</span>
                </CardTitle>
                <CardDescription>
                  Tell us what you're looking for in your next role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="desired_salary_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Salary Range</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select desired salary range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="$0-$50k">$0-$50k</SelectItem>
                          <SelectItem value="$50k-$70k">$50k-$70k</SelectItem>
                          <SelectItem value="$70k-$90k">$70k-$90k</SelectItem>
                          <SelectItem value="$90k-$120k">$90k-$120k</SelectItem>
                          <SelectItem value="$120k-$150k">$120k-$150k</SelectItem>
                          <SelectItem value="$150k-$200k">$150k-$200k</SelectItem>
                          <SelectItem value="$200k+">$200k+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel htmlFor="locations">Preferred Locations</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {locations.map((location, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                      >
                        <span>{location}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full"
                          onClick={() => removeLocation(index)}
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="locations"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Add a location (e.g. San Francisco, Remote)"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addLocation}>Add</Button>
                  </div>
                </div>

                <div>
                  <FormLabel htmlFor="jobTypes">Preferred Job Types</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {jobTypes.map((jobType, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                      >
                        <span>{jobType}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full"
                          onClick={() => removeJobType(index)}
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="jobTypes"
                      value={newJobType}
                      onChange={(e) => setNewJobType(e.target.value)}
                      placeholder="Add a job type (e.g. Full-time, Contract)"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addJobType}>Add</Button>
                  </div>
                </div>

                <div>
                  <FormLabel htmlFor="industries">Preferred Industries</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {industries.map((industry, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                      >
                        <span>{industry}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full"
                          onClick={() => removeIndustry(index)}
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="industries"
                      value={newIndustry}
                      onChange={(e) => setNewIndustry(e.target.value)}
                      placeholder="Add an industry (e.g. Technology, Healthcare)"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addIndustry}>Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  <span>Resume</span>
                </CardTitle>
                <CardDescription>
                  Upload your resume to make it easier for employers to find you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="resume_url"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch('resume_url') ? (
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="bg-muted rounded p-2">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Resume uploaded</p>
                          <a 
                            href={form.watch('resume_url')} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View resume
                          </a>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => form.setValue('resume_url', '')}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 border border-dashed rounded-md">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="mb-1 font-medium">Upload your resume</p>
                        <p className="text-sm text-muted-foreground mb-4">PDF or Word document, max 5MB</p>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingResume}
                          onClick={() => document.getElementById('resume-upload')?.click()}
                        >
                          {uploadingResume ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            'Select File'
                          )}
                        </Button>
                        <input
                          id="resume-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleResumeUpload}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/jobs')}
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

export default JobSeekerProfile;
