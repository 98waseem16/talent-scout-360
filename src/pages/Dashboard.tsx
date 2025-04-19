import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Plus, Edit, Trash, UserCircle, Settings, Briefcase, FileEdit } from 'lucide-react';
import { Job } from '@/lib/types/job.types';
import { formatPostedDate } from '@/lib/utils/dateUtils';

const Dashboard: React.FC = () => {
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      fetchJobs();
    }
  }, [user, navigate]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      if (user) {
        const { data: jobsData, error } = await supabase
          .from('job_postings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        if (jobsData) {
          const transformedJobs: Job[] = jobsData.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location || '',
            salary: job.salary || '',
            type: job.type as 'Full-time' | 'Part-time' | 'Contract' | 'Remote',
            posted: formatPostedDate(job.created_at),
            description: job.description,
            responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
            requirements: Array.isArray(job.requirements) ? job.requirements : [],
            benefits: Array.isArray(job.benefits) ? job.benefits : [],
            logo: job.logo || '',
            featured: job.featured || false,
            user_id: job.user_id,
            application_url: job.application_url || '',
            expires_at: job.expires_at || new Date(new Date(job.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }));
          
          setJobs(transformedJobs);
        }
      }
    } catch (error: any) {
      toast.error(`Failed to fetch jobs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId)
        .eq('user_id', user?.id);

      if (error) {
        throw new Error(error.message);
      }

      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success('Job deleted successfully!');
    } catch (error: any) {
      toast.error(`Failed to delete job: ${error.message}`);
    }
  };

  const handleRenewJob = async (jobId: string) => {
    try {
      const newExpirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('job_postings')
        .update({ expires_at: newExpirationDate })
        .eq('id', jobId)
        .eq('user_id', user?.id);

      if (error) {
        throw new Error(error.message);
      }

      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { ...job, expires_at: newExpirationDate } 
          : job
      ));
      
      toast.success('Job listing renewed for 30 more days!');
    } catch (error: any) {
      toast.error(`Failed to renew job: ${error.message}`);
    }
  };

  const getDaysUntilExpiration = (expiresAt: string | undefined): number | null => {
    if (!expiresAt) return null;
    return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getExpirationStatusText = (daysUntil: number | null): string => {
    if (daysUntil === null) return 'No expiration';
    if (daysUntil <= 0) return 'Expired';
    if (daysUntil === 1) return 'Expires tomorrow';
    if (daysUntil <= 7) return `Expires in ${daysUntil} days`;
    return `Expires in ${daysUntil} days`;
  };

  const getExpirationStatusClass = (daysUntil: number | null): string => {
    if (daysUntil === null) return 'bg-gray-100 text-gray-800';
    if (daysUntil <= 0) return 'bg-red-100 text-red-800';
    if (daysUntil <= 7) return 'bg-amber-100 text-amber-800';
    return 'bg-green-100 text-green-800';
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-16 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your job postings and account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="col-span-1 md:col-span-3">
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    <button 
                      onClick={() => setActiveTab('jobs')}
                      className={`flex items-center gap-2 py-3 px-4 text-left hover:bg-muted transition-colors ${activeTab === 'jobs' ? 'bg-muted font-medium' : ''}`}
                    >
                      <Briefcase className="h-4 w-4" />
                      My Job Listings
                    </button>
                    <button 
                      onClick={() => setActiveTab('drafts')}
                      className={`flex items-center gap-2 py-3 px-4 text-left hover:bg-muted transition-colors ${activeTab === 'drafts' ? 'bg-muted font-medium' : ''}`}
                    >
                      <FileEdit className="h-4 w-4" />
                      Drafts
                    </button>
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className={`flex items-center gap-2 py-3 px-4 text-left hover:bg-muted transition-colors ${activeTab === 'profile' ? 'bg-muted font-medium' : ''}`}
                    >
                      <UserCircle className="h-4 w-4" />
                      My Profile
                    </button>
                    <button 
                      onClick={() => setActiveTab('settings')}
                      className={`flex items-center gap-2 py-3 px-4 text-left hover:bg-muted transition-colors ${activeTab === 'settings' ? 'bg-muted font-medium' : ''}`}
                    >
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-1 md:col-span-9">
              {activeTab === 'jobs' && (
                <>
                  <h2 className="text-2xl font-semibold mb-4">My Job Listings</h2>
                  {loading ? (
                    <p>Loading jobs...</p>
                  ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                      {jobs.map((job) => {
                        const daysUntil = getDaysUntilExpiration(job.expires_at);
                        const expirationText = getExpirationStatusText(daysUntil);
                        const expirationClass = getExpirationStatusClass(daysUntil);
                        
                        return (
                          <Card key={job.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <CardTitle className="flex justify-between items-start">
                                <span>{job.title}</span>
                                <div className="flex flex-col gap-2 items-end">
                                  {job.featured && (
                                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">Featured</span>
                                  )}
                                  <span className={`text-xs font-medium px-2 py-1 rounded ${expirationClass}`}>
                                    {expirationText}
                                  </span>
                                </div>
                              </CardTitle>
                              <CardDescription className="flex items-center">
                                <span className="font-medium">{job.company}</span>
                                <span className="mx-2">•</span>
                                <span>{job.location}</span>
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-2">Posted: {job.posted}</p>
                              <p className="text-sm mb-2 line-clamp-2">{job.description}</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                                  {job.type}
                                </span>
                                {job.salary && (
                                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                    {job.salary}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-2 justify-between items-center">
                              <div className="flex gap-2">
                                <Link to={`/edit-job/${job.id}`}>
                                  <Button variant="secondary" size="sm" className="hover-scale">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Button>
                                </Link>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => handleDeleteJob(job.id)} 
                                  className="hover-scale"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                              {daysUntil !== null && daysUntil < 14 && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleRenewJob(job.id)}
                                  className="hover-scale"
                                >
                                  <Zap className="mr-2 h-4 w-4" />
                                  Renew for 30 days
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-lg">
                      <Zap className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-lg text-muted-foreground mb-4">No active jobs found</p>
                      <Button onClick={() => navigate('/post-job')} className="hover-scale">
                        <Plus className="mr-2 h-4 w-4" /> Post Your First Job
                      </Button>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'drafts' && (
                <>
                  <h2 className="text-2xl font-semibold mb-4">Saved Drafts</h2>
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-lg">
                    <FileEdit className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-lg text-muted-foreground mb-4">No drafts available</p>
                    <p className="text-sm text-muted-foreground mb-4">Draft functionality will be coming soon!</p>
                  </div>
                </>
              )}

              {activeTab === 'profile' && (
                <>
                  <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal and company details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <h3 className="text-sm font-medium mb-1">Email</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-1">Full Name</h3>
                            <p className="text-sm text-muted-foreground">
                              {profile?.full_name || 'Not set'}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-1">Company</h3>
                            <p className="text-sm text-muted-foreground">
                              {profile?.company_name || 'Not set'}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-1">Company Website</h3>
                            <p className="text-sm text-muted-foreground">
                              {profile?.company_website ? (
                                <a href={profile.company_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  {profile.company_website}
                                </a>
                              ) : 'Not set'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" disabled className="mr-2">
                        Edit Profile
                      </Button>
                      <p className="text-xs text-muted-foreground">Profile editing coming soon</p>
                    </CardFooter>
                  </Card>
                </>
              )}

              {activeTab === 'settings' && (
                <>
                  <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Management</CardTitle>
                      <CardDescription>Manage your account settings and preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-1">Email Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Manage email notification preferences
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-1">Password</h3>
                          <p className="text-sm text-muted-foreground">
                            Update your password
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="destructive" 
                        onClick={signOut}
                        className="w-full"
                      >
                        Sign Out
                      </Button>
                    </CardFooter>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
