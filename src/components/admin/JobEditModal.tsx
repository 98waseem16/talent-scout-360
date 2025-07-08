import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { updateJob } from '@/lib/jobs/operations/manageJobs';
import { uploadCompanyLogo } from '@/lib/jobs/logoUpload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import LogoUpload from '@/components/LogoUpload';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  logo: string;
  featured: boolean;
  application_url: string | null;
  department: string | null;
  seniority_level: string | null;
  salary_range: string | null;
  investment_stage: string | null;
  team_size: string | null;
  revenue_model: string | null;
  remote_onsite: string | null;
  work_hours: string | null;
  equity: string | null;
  hiring_urgency: string | null;
  visa_sponsorship: boolean | null;
  is_draft: boolean;
  is_expired: boolean;
  expires_at: string;
}

interface JobEditModalProps {
  job: JobPosting;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const JobEditModal: React.FC<JobEditModalProps> = ({ job, open, onClose, onSave }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    type: job.type,
    description: job.description,
    responsibilities: job.responsibilities.join('\n'),
    requirements: job.requirements.join('\n'),
    benefits: job.benefits.join('\n'),
    application_url: job.application_url || '',
    department: job.department || '',
    seniority_level: job.seniority_level || '',
    salary_range: job.salary_range || '',
    investment_stage: job.investment_stage || '',
    team_size: job.team_size || '',
    revenue_model: job.revenue_model || '',
    remote_onsite: job.remote_onsite || '',
    work_hours: job.work_hours || '',
    equity: job.equity || '',
    hiring_urgency: job.hiring_urgency || '',
    visa_sponsorship: job.visa_sponsorship || false,
    featured: job.featured,
    is_draft: job.is_draft,
    logo: job.logo,
  });

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Update form data when job changes
  useEffect(() => {
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: job.type,
      description: job.description,
      responsibilities: job.responsibilities.join('\n'),
      requirements: job.requirements.join('\n'),
      benefits: job.benefits.join('\n'),
      application_url: job.application_url || '',
      department: job.department || '',
      seniority_level: job.seniority_level || '',
      salary_range: job.salary_range || '',
      investment_stage: job.investment_stage || '',
      team_size: job.team_size || '',
      revenue_model: job.revenue_model || '',
      remote_onsite: job.remote_onsite || '',
      work_hours: job.work_hours || '',
      equity: job.equity || '',
      hiring_urgency: job.hiring_urgency || '',
      visa_sponsorship: job.visa_sponsorship || false,
      featured: job.featured,
      is_draft: job.is_draft,
      logo: job.logo,
    });
    setLogoFile(null);
    setLogoUploading(false);
    setUploadProgress(0);
  }, [job]);

  // Update job mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      let logoUrl = data.logo;
      
      // Upload new logo if selected
      if (logoFile) {
        setLogoUploading(true);
        setUploadProgress(20);
        
        try {
          console.log('Starting logo upload for job:', job.id, 'with file:', logoFile.name);
          
          setUploadProgress(50);
          logoUrl = await uploadCompanyLogo(logoFile);
          
          console.log('Logo uploaded successfully:', logoUrl);
          setUploadProgress(80);
          
          toast({
            title: "Logo Uploaded",
            description: "Logo uploaded successfully, now updating job...",
          });
        } catch (error: any) {
          console.error('Logo upload failed:', error);
          setLogoUploading(false);
          setUploadProgress(0);
          throw new Error(`Logo upload failed: ${error.message || 'Unknown error'}`);
        }
      }

      const updateData = {
        ...data,
        logo: logoUrl,
        responsibilities: data.responsibilities.split('\n').filter((item: string) => item.trim()),
        requirements: data.requirements.split('\n').filter((item: string) => item.trim()),
        benefits: data.benefits.split('\n').filter((item: string) => item.trim()),
      };
      
      console.log('Updating job with data:', updateData);
      setUploadProgress(90);
      
      const result = await updateJob(job.id, updateData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update job');
      }
      
      setUploadProgress(100);
      return result;
    },
    onSuccess: () => {
      console.log('Job update completed successfully');
      toast({
        title: "Job Updated",
        description: "The job posting has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
      
      // Reset states
      setLogoFile(null);
      setLogoUploading(false);
      setUploadProgress(0);
      
      onSave();
    },
    onError: (error: any) => {
      console.error('Job update failed:', error);
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update job posting.",
        variant: "destructive",
      });
      
      // Reset states on error
      setLogoUploading(false);
      setUploadProgress(0);
    },
    onSettled: () => {
      // Always reset loading states
      setLogoUploading(false);
      setUploadProgress(0);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (updateMutation.isPending) {
      console.log('Update already in progress, ignoring submit');
      return;
    }
    
    console.log('Starting job update process');
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (file: File | null) => {
    console.log('Logo file selected:', file?.name || 'none');
    setLogoFile(file);
    setUploadProgress(0);
  };

  const isUpdating = updateMutation.isPending || logoUploading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Posting</DialogTitle>
          <DialogDescription>
            Make changes to the job posting. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Core job posting details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Job Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="salary">Salary *</Label>
                      <Input
                        id="salary"
                        value={formData.salary}
                        onChange={(e) => handleInputChange('salary', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="application_url">Application URL</Label>
                    <Input
                      id="application_url"
                      type="url"
                      value={formData.application_url}
                      onChange={(e) => handleInputChange('application_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                  <CardDescription>Responsibilities, requirements, and benefits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
                    <Textarea
                      id="responsibilities"
                      value={formData.responsibilities}
                      onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                      rows={5}
                      placeholder="Enter each responsibility on a new line"
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">Requirements (one per line)</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      rows={5}
                      placeholder="Enter each requirement on a new line"
                    />
                  </div>

                  <div>
                    <Label htmlFor="benefits">Benefits (one per line)</Label>
                    <Textarea
                      id="benefits"
                      value={formData.benefits}
                      onChange={(e) => handleInputChange('benefits', e.target.value)}
                      rows={5}
                      placeholder="Enter each benefit on a new line"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company & Role Details</CardTitle>
                  <CardDescription>Additional company and role information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="seniority_level">Seniority Level</Label>
                      <Select value={formData.seniority_level} onValueChange={(value) => handleInputChange('seniority_level', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Entry Level">Entry Level</SelectItem>
                          <SelectItem value="Mid Level">Mid Level</SelectItem>
                          <SelectItem value="Senior Level">Senior Level</SelectItem>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="Principal">Principal</SelectItem>
                          <SelectItem value="Director">Director</SelectItem>
                          <SelectItem value="VP">VP</SelectItem>
                          <SelectItem value="C-Level">C-Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salary_range">Salary Range</Label>
                      <Input
                        id="salary_range"
                        value={formData.salary_range}
                        onChange={(e) => handleInputChange('salary_range', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="equity">Equity</Label>
                      <Input
                        id="equity"
                        value={formData.equity}
                        onChange={(e) => handleInputChange('equity', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="team_size">Team Size</Label>
                      <Input
                        id="team_size"
                        value={formData.team_size}
                        onChange={(e) => handleInputChange('team_size', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="investment_stage">Investment Stage</Label>
                      <Select value={formData.investment_stage} onValueChange={(value) => handleInputChange('investment_stage', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                          <SelectItem value="Seed">Seed</SelectItem>
                          <SelectItem value="Series A">Series A</SelectItem>
                          <SelectItem value="Series B">Series B</SelectItem>
                          <SelectItem value="Series C">Series C</SelectItem>
                          <SelectItem value="Series D+">Series D+</SelectItem>
                          <SelectItem value="IPO">IPO</SelectItem>
                          <SelectItem value="Public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="remote_onsite">Work Model</Label>
                      <Select value={formData.remote_onsite} onValueChange={(value) => handleInputChange('remote_onsite', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Remote">Remote</SelectItem>
                          <SelectItem value="On-site">On-site</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="work_hours">Work Hours</Label>
                      <Input
                        id="work_hours"
                        value={formData.work_hours}
                        onChange={(e) => handleInputChange('work_hours', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Logo</CardTitle>
                  <CardDescription>Upload or update the company logo</CardDescription>
                </CardHeader>
                <CardContent>
                  <LogoUpload
                    currentLogoUrl={formData.logo}
                    onLogoChange={handleLogoChange}
                  />
                  
                  {logoFile && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        New logo selected: {logoFile.name}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Logo will be uploaded when you save the job.
                      </p>
                    </div>
                  )}
                  
                  {logoUploading && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                      <p className="text-sm text-yellow-800">
                        Uploading logo... {uploadProgress}%
                      </p>
                      <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Job Settings</CardTitle>
                  <CardDescription>Visibility and feature settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Draft Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Draft jobs are not visible to the public
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_draft}
                      onCheckedChange={(checked) => handleInputChange('is_draft', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Featured Job</Label>
                      <p className="text-sm text-muted-foreground">
                        Featured jobs appear prominently on the homepage
                      </p>
                    </div>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Visa Sponsorship</Label>
                      <p className="text-sm text-muted-foreground">
                        Company provides visa sponsorship
                      </p>
                    </div>
                    <Switch
                      checked={formData.visa_sponsorship}
                      onCheckedChange={(checked) => handleInputChange('visa_sponsorship', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                logoUploading ? `Uploading... ${uploadProgress}%` : 'Saving...'
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobEditModal;
