
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Clock, X, RefreshCw, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface StuckJob {
  id: string;
  gobi_task_id: string | null;
  started_at: string;
  status: string;
  career_page_sources: {
    url: string;
    company_name: string | null;
  };
  retry_count: number | null;
  error_message: string | null;
}

const StuckJobsManager: React.FC = () => {
  const [stuckJobs, setStuckJobs] = useState<StuckJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStuckJobs = async () => {
    try {
      // Find jobs running for more than 15 minutes
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select(`
          *,
          career_page_sources!inner(url, company_name)
        `)
        .eq('status', 'running')
        .lt('started_at', fifteenMinutesAgo)
        .order('started_at', { ascending: true });

      if (error) throw error;

      setStuckJobs(data || []);
    } catch (error) {
      console.error('Error fetching stuck jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stuck jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const { error } = await supabase
        .from('scraping_jobs')
        .update({
          status: 'failed',
          error_message: 'Job cancelled manually by admin',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job Cancelled",
        description: "The stuck job has been cancelled successfully.",
      });

      fetchStuckJobs();
    } catch (error) {
      console.error('Error cancelling job:', error);
      toast({
        title: "Error",
        description: "Failed to cancel job",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const retryJob = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const { error } = await supabase
        .from('scraping_jobs')
        .update({
          status: 'pending',
          retry_count: 0,
          error_message: null,
          gobi_task_id: null,
          task_data: null
        })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job Reset",
        description: "The job has been reset to pending status.",
      });

      fetchStuckJobs();
    } catch (error) {
      console.error('Error retrying job:', error);
      toast({
        title: "Error",
        description: "Failed to retry job",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const refreshJobStatus = async (jobId: string, gobiTaskId: string) => {
    setActionLoading(jobId);
    try {
      // Trigger the poll function for this specific job
      const { error } = await supabase.functions.invoke('poll-gobi-tasks', {
        body: { specific_job_id: jobId }
      });

      if (error) throw error;

      toast({
        title: "Status Refresh Triggered",
        description: "Job status refresh has been triggered.",
      });

      // Refresh the list after a short delay
      setTimeout(fetchStuckJobs, 2000);
    } catch (error) {
      console.error('Error refreshing job status:', error);
      toast({
        title: "Error",
        description: "Failed to refresh job status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    
    return `${diffHours}hr ${remainingMinutes}min`;
  };

  useEffect(() => {
    fetchStuckJobs();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStuckJobs, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 animate-spin" />
            Loading Stuck Jobs...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Stuck Jobs Manager
            {stuckJobs.length > 0 && (
              <Badge variant="destructive">{stuckJobs.length}</Badge>
            )}
          </div>
          <Button onClick={fetchStuckJobs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Jobs running for more than 15 minutes that may be stuck
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stuckJobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No stuck jobs found</p>
            <p className="text-sm">All jobs are processing normally</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Retries</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stuckJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {job.career_page_sources.company_name || 'Unknown Company'}
                      </span>
                      <span className="text-sm text-muted-foreground truncate max-w-xs">
                        {job.career_page_sources.url}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-orange-600">
                      {formatDuration(job.started_at)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{job.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{job.retry_count || 0}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {job.gobi_task_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => refreshJobStatus(job.id, job.gobi_task_id!)}
                          disabled={actionLoading === job.id}
                        >
                          <RefreshCw className={`w-3 h-3 mr-1 ${actionLoading === job.id ? 'animate-spin' : ''}`} />
                          Check
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryJob(job.id)}
                        disabled={actionLoading === job.id}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelJob(job.id)}
                        disabled={actionLoading === job.id}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StuckJobsManager;
