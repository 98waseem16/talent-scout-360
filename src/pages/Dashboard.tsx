
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
import { Zap, Plus, Edit, Trash } from 'lucide-react';
import { Job } from '@/lib/types/job.types';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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
          // Transform database records to match our Job type
          const transformedJobs: Job[] = jobsData.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location || '',
            salary: job.salary || `${job.salary_min || ''}-${job.salary_max || ''} ${job.salary_currency || 'USD'}`,
            type: job.type as 'Full-time' | 'Part-time' | 'Contract' | 'Remote',
            posted: new Date(job.created_at).toLocaleDateString(),
            description: job.description,
            responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
            requirements: Array.isArray(job.requirements) ? job.requirements : [],
            benefits: Array.isArray(job.benefits) ? job.benefits : [],
            logo: job.logo || job.logo_url || '',
            featured: job.featured || job.is_featured || false,
            user_id: job.user_id,
            // Additional fields
            salary_min: job.salary_min?.toString() || '',
            salary_max: job.salary_max?.toString() || '',
            salary_currency: job.salary_currency || 'USD',
            application_url: job.application_url || '',
            contact_email: job.contact_email || '',
            logo_url: job.logo_url || job.logo || '',
            is_remote: job.is_remote || false,
            is_featured: job.is_featured || job.featured || false
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

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-balance">Dashboard</h1>
          <Button onClick={() => navigate('/post-job')} className="hover-scale">
            <Plus className="mr-2 h-4 w-4" /> Post a Job
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Jobs</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-2">
            {loading ? (
              <p>Loading jobs...</p>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="glass-card hover-scale">
                    <CardHeader>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.company}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                      <p className="text-sm mt-2">{job.description.substring(0, 100)}...</p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <Link to={`/edit-job/${job.id}`} className="underline hover:no-underline">
                        <Button variant="secondary" size="sm" className="hover-scale">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteJob(job.id)} className="hover-scale">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <Zap className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-lg text-muted-foreground">No active jobs found. Post a job to get started!</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="drafts">
            <p>No drafts available.</p>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
