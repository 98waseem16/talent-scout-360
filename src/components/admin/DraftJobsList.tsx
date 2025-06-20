
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Edit, Eye, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DraftJob {
  id: string;
  title: string;
  company: string;
  created_at: string;
}

const DraftJobsList: React.FC = () => {
  const [draftJobs, setDraftJobs] = useState<DraftJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDraftJobs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('job_postings')
        .select('id, title, company, created_at')
        .eq('is_draft', true)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setDraftJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching draft jobs:', error);
      toast.error('Failed to load draft jobs');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDraftJobs();
  }, []);
  
  const handlePublishDraft = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_postings')
        .update({ is_draft: false })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast.success('Job published successfully!');
      fetchDraftJobs();
    } catch (error: any) {
      console.error('Error publishing job:', error);
      toast.error(`Failed to publish job: ${error.message}`);
    }
  };
  
  const handleDeleteDraft = async () => {
    if (!jobToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobToDelete);
        
      if (error) {
        throw error;
      }
      
      toast.success('Draft job deleted successfully!');
      fetchDraftJobs();
      setJobToDelete(null);
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast.error(`Failed to delete job: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft Jobs</CardTitle>
        <CardDescription>Manage your draft job postings</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : draftJobs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No draft jobs found.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/post-job">
                Create New Job
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>{formatDate(job.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Edit draft"
                          asChild
                        >
                          <Link to={`/edit-job/${job.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          title="Preview job"
                          asChild
                        >
                          <Link to={`/jobs/${job.id}?preview=true`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          title="Publish job"
                          onClick={() => handlePublishDraft(job.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => setJobToDelete(job.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this draft job? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="mt-4">
                              <Button 
                                variant="outline" 
                                onClick={() => setJobToDelete(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={handleDeleteDraft}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  'Delete Draft'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DraftJobsList;
