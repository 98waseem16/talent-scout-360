
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Edit, Eye, Trash2, CheckCircle, X } from 'lucide-react';
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
  source_url?: string;
}

const DraftJobsList: React.FC = () => {
  const [draftJobs, setDraftJobs] = useState<DraftJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);

  const fetchDraftJobs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('job_postings')
        .select('id, title, company, created_at, source_url')
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
      setIsPublishing(id);
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
    } finally {
      setIsPublishing(null);
    }
  };
  
  const handleDeclineDraft = async () => {
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
      
      toast.success('Draft job declined and removed successfully!');
      fetchDraftJobs();
      setJobToDelete(null);
    } catch (error: any) {
      console.error('Error declining job:', error);
      toast.error(`Failed to decline job: ${error.message}`);
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
        <CardDescription>Review and approve scraped job postings before they go live</CardDescription>
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
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>
                      {job.source_url ? (
                        <span className="text-sm text-blue-600">Scraped</span>
                      ) : (
                        <span className="text-sm text-gray-500">Manual</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(job.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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
                          title="Approve & publish job"
                          onClick={() => handlePublishDraft(job.id)}
                          disabled={isPublishing === job.id}
                          className="text-green-600 hover:text-green-700"
                        >
                          {isPublishing === job.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setJobToDelete(job.id)}
                              title="Decline & delete job"
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Decline Draft Job</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to decline and delete this draft job? 
                                This will permanently remove "{job.title}" at {job.company}. 
                                This action cannot be undone.
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
                                onClick={handleDeclineDraft}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Declining...
                                  </>
                                ) : (
                                  'Decline & Delete'
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
