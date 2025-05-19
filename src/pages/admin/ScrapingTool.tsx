
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Globe, Plus, FileJson, RefreshCw, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ScrapingJob {
  id: string;
  url: string;
  selectors: Record<string, string>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: any;
  created_at: string;
  updated_at: string;
}

const ScrapingTool: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [newJobUrl, setNewJobUrl] = useState('');
  const [newJobSelectors, setNewJobSelectors] = useState('');
  const [currentJob, setCurrentJob] = useState<ScrapingJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load scraping jobs');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchJobs();
  }, []);
  
  const handleCreateJob = async () => {
    try {
      if (!newJobUrl.trim()) {
        toast.error('Please enter a URL');
        return;
      }
      
      let selectors: Record<string, string>;
      try {
        selectors = JSON.parse(newJobSelectors || '{}');
      } catch (e) {
        toast.error('Invalid JSON for selectors');
        return;
      }
      
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('scraping_jobs')
        .insert({
          url: newJobUrl,
          selectors,
          user_id: user?.id,
          status: 'pending'
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success('Scraping job created');
      setNewJobUrl('');
      setNewJobSelectors('');
      fetchJobs();
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast.error(`Failed to create job: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scraping_jobs')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast.error(`Failed to delete job: ${error.message}`);
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600';
      case 'failed':
        return 'bg-red-500/10 text-red-600';
      case 'running':
        return 'bg-blue-500/10 text-blue-600';
      default:
        return 'bg-yellow-500/10 text-yellow-600';
    }
  };
  
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <Button asChild variant="outline" size="sm" className="mb-2">
                <Link to="/admin"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Link>
              </Button>
              <h1 className="text-3xl font-bold">Web Scraping Tool</h1>
              <p className="text-muted-foreground mt-1">
                Configure and run web scraping tasks
              </p>
            </div>
            <Button onClick={fetchJobs} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
          
          <Tabs defaultValue="jobs">
            <TabsList className="mb-8">
              <TabsTrigger value="jobs">Scraping Jobs</TabsTrigger>
              <TabsTrigger value="create">Create New Job</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>Scraping Jobs</CardTitle>
                  <CardDescription>View and manage your web scraping jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No scraping jobs found. Create your first job to get started.</p>
                      <Button asChild variant="outline" className="mt-4">
                        <Link to="#" onClick={() => document.querySelector('button[value="create"]')?.click()}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create New Job
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>URL</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {jobs.map((job) => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium truncate max-w-[200px]">
                                {job.url}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>{formatDate(job.created_at)}</TableCell>
                              <TableCell>{formatDate(job.updated_at)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="icon"
                                        onClick={() => setCurrentJob(job)}
                                      >
                                        <FileJson className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Scraping Job Details</DialogTitle>
                                        <DialogDescription>
                                          {currentJob?.url}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                          <Label>Selectors</Label>
                                          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                                            {JSON.stringify(currentJob?.selectors, null, 2)}
                                          </pre>
                                        </div>
                                        <div className="grid gap-2">
                                          <Label>Results</Label>
                                          <pre className="bg-muted p-4 rounded-md overflow-x-auto max-h-[300px]">
                                            {currentJob?.results ? JSON.stringify(currentJob.results, null, 2) : 'No results yet'}
                                          </pre>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button 
                                    variant="destructive" 
                                    size="icon"
                                    onClick={() => handleDeleteJob(job.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
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
            </TabsContent>
            
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Scraping Job</CardTitle>
                  <CardDescription>
                    Configure a new web scraping job by specifying the target URL and CSS selectors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="url">Target URL</Label>
                      <Input 
                        id="url" 
                        placeholder="https://example.com" 
                        value={newJobUrl}
                        onChange={(e) => setNewJobUrl(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="selectors">
                        CSS Selectors (JSON format)
                        <span className="text-muted-foreground text-xs ml-2">
                          e.g. {"{ \"title\": \"h1\", \"price\": \".price\" }"}
                        </span>
                      </Label>
                      <Textarea 
                        id="selectors" 
                        placeholder='{
  "title": "h1",
  "price": ".price",
  "description": ".product-description"
}'
                        value={newJobSelectors}
                        onChange={(e) => setNewJobSelectors(e.target.value)}
                        rows={8}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => {
                    setNewJobUrl('');
                    setNewJobSelectors('');
                  }}>
                    Reset
                  </Button>
                  <Button onClick={handleCreateJob} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Job
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ScrapingTool;
