
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Mail, Calendar, Briefcase, Plus, Edit, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [userJobs, setUserJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Fetch user's job postings
  useEffect(() => {
    const fetchUserJobs = async () => {
      if (!user) return;
      
      try {
        setJobsLoading(true);
        const { data, error } = await supabase
          .from('job_postings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setUserJobs(data || []);
      } catch (error) {
        console.error('Error fetching job postings:', error);
        toast.error("Failed to load your job postings");
      } finally {
        setJobsLoading(false);
      }
    };
    
    fetchUserJobs();
  }, [user]);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    
    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId);
        
      if (error) throw error;
      
      // Update local state
      setUserJobs(userJobs.filter(job => job.id !== jobId));
      toast.success("Job posting deleted successfully");
    } catch (error) {
      console.error('Error deleting job posting:', error);
      toast.error("Failed to delete job posting");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-32 w-32 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-primary" />
                Your Profile
              </CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  {user.email}
                </p>
              </div>
              
              {user.created_at && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Account Created</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {format(new Date(user.created_at), "MMMM dd, yyyy")}
                  </p>
                </div>
              )}
              
              {profile && (
                <>
                  {profile.full_name && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                      <p>{profile.full_name}</p>
                    </div>
                  )}
                  
                  {profile.company && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Company</p>
                      <p>{profile.company}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
            
            <CardFooter>
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-primary" />
                  Job Postings
                </CardTitle>
                <CardDescription>Manage your job listings</CardDescription>
              </div>
              <Button onClick={() => navigate("/post-job")} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post New Job
              </Button>
            </CardHeader>
            
            <CardContent className="overflow-auto max-h-[400px]">
              {jobsLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userJobs.length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-center text-muted-foreground">
                    You haven't posted any jobs yet. Create your first job listing to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                          {job.featured && (
                            <span className="inline-flex items-center bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full mt-1">
                              <Zap className="h-3 w-3 mr-1" />
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/job/${job.id}`} target="_blank" className="text-muted-foreground hover:text-primary">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button className="text-muted-foreground hover:text-primary" onClick={() => navigate(`/edit-job/${job.id}`)}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteJob(job.id)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Posted on {format(new Date(job.created_at), "MMMM dd, yyyy")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
