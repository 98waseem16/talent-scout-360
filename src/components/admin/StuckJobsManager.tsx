
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Clock, X, RefreshCw, Play, Zap, Eye } from 'lucide-react';
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
  last_polled_at: string | null;
}

const StuckJobsManager: React.FC = () => {
  const [stuckJobs, setStuckJobs] = useState<StuckJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusDetails, setStatusDetails] = useState<{[key: string]: any}>({});
  const { toast } = useToast();

  const fetchStuckJobs = async () => {
    try {
      // Reduced timeout from 10 to 5 minutes for faster detection
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select(`
          *,
          career_page_sources!inner(url, company_name)
        `)
        .eq('status', 'running')
        .lt('started_at', fiveMinutesAgo)
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

  const checkGobiStatus = async (jobId: string, gobiTaskId: string) => {
    setActionLoading(jobId);
    try {
      // Use the correct Gobi API endpoint
      const statusUrl = `https://gobii.ai/api/v1/tasks/browser-use/${gobiTaskId}`;
      
      const response = await fetch(statusUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.GOBI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Gobi API returned ${response.status}`);
      }

      const statusData = await response.json();
      
      // Store the status details for display
      setStatusDetails(prev => ({
        ...prev,
        [jobId]: statusData
      }));

      toast({
        title: "Status Retrieved",
        description: `Gobi status: ${statusData.status}`,
      });

      // If completed, trigger processing
      if (statusData.status === 'completed') {
        await supabase.functions.invoke('poll-gobi-tasks', {
          body: { 
            specific_job_id: jobId,
            trigger: 'manual_status_check'
          }
        });
        
        toast({
          title: "Processing Triggered",
          description: "Found completed job, processing results now.",
        });
      }

      setTimeout(fetchStuckJobs, 2000);
    } catch (error) {
      console.error('Error checking Gobi status:', error);
      toast({
        title: "Error",
        description: `Failed to check Gobi status: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
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

      // Log recovery action
      await supabase
        .from('job_recovery_log')
        .insert({
          scraping_job_id: jobId,
          recovery_action: 'manual_cancellation',
          old_status: 'running',
          new_status: 'failed',
          recovery_reason: 'Manually cancelled by admin from stuck jobs manager'
        });

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

      // Log recovery action
      await supabase
        .from('job_recovery_log')
        .insert({
          scraping_job_id: jobId,
          recovery_action: 'manual_retry',
          old_status: 'running',
          new_status: 'pending',
          recovery_reason: 'Manually reset for retry by admin'
        });

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

  const refreshJobStatus = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const { error } = await supabase.functions.invoke('poll-gobi-tasks', {
        body: { 
          specific_job_id: jobId,
          trigger: 'manual_refresh'
        }
      });

      if (error) throw error;

      toast({
        title: "Status Check Triggered",
        description: "Job status refresh has been triggered.",
      });

      setTimeout(fetchStuckJobs, 3000);
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

  const forceSyncJob = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const { error } = await supabase.functions.invoke('poll-gobi-tasks', {
        body: { 
          specific_job_id: jobId,
          trigger: 'force_sync'
        }
      });

      if (error) throw error;

      toast({
        title: "Force Sync Triggered",
        description: "Forcing immediate status synchronization.",
      });

      setTimeout(fetchStuckJobs, 2000);
    } catch (error) {
      console.error('Error force syncing job:', error);
      toast({
        title: "Error",
        description: "Failed to force sync job status",
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

  const getSeverityBadge = (startTime: string) => {
    const start = new Date(startTime);
    const diffHours = (Date.now() - start.getTime()) / (1000 * 60 * 60);
    
    if (diffHours > 12) {
      return <Badge variant="destructive">CRITICAL</Badge>;
    } else if (diffHours > 1) {
      return <Badge variant="destructive">HIGH</Badge>;
    } else if (diffHours > 0.5) {
      return <Badge className="bg-orange-500">MEDIUM</Badge>;
    } else {
      return <Badge variant="secondary">LOW</Badge>;
    }
  };

  useEffect(() => {
    fetchStuckJobs();
    
    // More frequent refresh for better monitoring
    const interval = setInterval(fetchStuckJobs, 15000); // Every 15 seconds
    
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
            Stuck Jobs Manager (Enhanced)
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
          Jobs running for more than 5 minutes with enhanced debugging and recovery
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
                <TableHead>Severity</TableHead>
                <TableHead>Last Check</TableHead>
                <TableHead>Status</TableHead>
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
                      {job.gobi_task_id && (
                        <span className="text-xs text-muted-foreground">
                          Task: {job.gobi_task_id.substring(0, 12)}...
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-orange-600">
                      {formatDuration(job.started_at)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getSeverityBadge(job.started_at)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {job.last_polled_at 
                        ? formatDuration(job.last_polled_at) + ' ago'
                        : 'Never'
                      }
                    </span>
                  </TableCell>
                  <TableCell>
                    {statusDetails[job.id] ? (
                      <div className="text-xs">
                        <Badge variant="outline">
                          {statusDetails[job.id].status}
                        </Badge>
                        {statusDetails[job.id].result && (
                          <div className="mt-1">
                            Jobs: {statusDetails[job.id].result.jobs?.length || 0}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Badge variant="secondary">Unknown</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {job.gobi_task_id && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => checkGobiStatus(job.id, job.gobi_task_id!)}
                            disabled={actionLoading === job.id}
                            title="Check actual Gobi API status"
                          >
                            <Eye className={`w-3 h-3 mr-1 ${actionLoading === job.id ? 'animate-spin' : ''}`} />
                            Gobi
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => refreshJobStatus(job.id)}
                            disabled={actionLoading === job.id}
                          >
                            <RefreshCw className={`w-3 h-3 mr-1 ${actionLoading === job.id ? 'animate-spin' : ''}`} />
                            Poll
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => forceSyncJob(job.id)}
                            disabled={actionLoading === job.id}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Force
                          </Button>
                        </>
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
