
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Building2, CheckCircle, XCircle, Clock, RefreshCw, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ScrapingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  jobs_found: number | null;
  jobs_created: number | null;
  error_message?: string | null;
  started_at: string;
  completed_at?: string | null;
  source_url: string;
  company_name?: string | null;
}

const CareerPageScraper: React.FC = () => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewResults, setPreviewResults] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<ScrapingJob[]>([]);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [runningJobsCount, setRunningJobsCount] = useState(0);

  const validateUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const cleanupStuckJobs = async () => {
    setIsCleaningUp(true);
    try {
      console.log('Cleaning up stuck jobs...');
      
      // Find jobs that have been running for more than 8 minutes (allowing for 5-minute processing + buffer)
      const eightMinutesAgo = new Date(Date.now() - 8 * 60 * 1000).toISOString();
      
      const { data: stuckJobs, error: fetchError } = await supabase
        .from('scraping_jobs')
        .select('id, started_at')
        .eq('status', 'running')
        .lt('started_at', eightMinutesAgo);

      if (fetchError) {
        console.error('Error fetching stuck jobs:', fetchError);
        throw fetchError;
      }

      if (stuckJobs && stuckJobs.length > 0) {
        console.log(`Found ${stuckJobs.length} stuck jobs to clean up`);
        
        const { error: updateError } = await supabase
          .from('scraping_jobs')
          .update({
            status: 'failed',
            error_message: 'Job timed out after 8 minutes and was automatically cleaned up',
            completed_at: new Date().toISOString()
          })
          .in('id', stuckJobs.map(job => job.id));

        if (updateError) {
          console.error('Error updating stuck jobs:', updateError);
          throw updateError;
        }

        toast.success(`Cleaned up ${stuckJobs.length} stuck job(s)`);
      } else {
        toast.info('No stuck jobs found to clean up');
      }
      
      // Refresh the recent jobs list
      fetchRecentJobs();
    } catch (error: any) {
      console.error('Error cleaning up stuck jobs:', error);
      toast.error(`Failed to clean up stuck jobs: ${error.message}`);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleScrapeNow = async () => {
    if (!url.trim()) {
      toast.error('Please enter a career page URL');
      return;
    }

    if (!validateUrl(url)) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);
    setPreviewResults([]);

    try {
      console.log('Starting scrape process for:', url);

      // First, save the career page source
      const { data: sourceData, error: sourceError } = await supabase
        .from('career_page_sources')
        .upsert({
          url: url.trim(),
          company_name: companyName.trim() || null,
          added_by: user?.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'url'
        })
        .select()
        .single();

      if (sourceError) {
        console.error('Error saving career page source:', sourceError);
        throw sourceError;
      }

      console.log('Career page source saved:', sourceData.id);

      // Create a scraping job record
      const { data: jobData, error: jobError } = await supabase
        .from('scraping_jobs')
        .insert({
          source_id: sourceData.id,
          status: 'pending',
          created_by: user?.id
        })
        .select()
        .single();

      if (jobError) {
        console.error('Error creating scraping job:', jobError);
        throw jobError;
      }

      console.log('Scraping job created:', jobData.id);

      // Call the scraping edge function
      console.log('Invoking comprehensive scraping edge function...');
      const { data, error } = await supabase.functions.invoke('scrape-career-page', {
        body: {
          url: url.trim(),
          companyName: companyName.trim() || null,
          scrapingJobId: jobData.id
        }
      });

      console.log('Edge function response:', data);

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      // Reset isSubmitting immediately after successful edge function call
      setIsSubmitting(false);

      // Handle different response types
      if (data?.success) {
        setPreviewResults(data.jobs || []);
        toast.success(data.message || `Found ${data.jobsFound || 0} job postings with comprehensive data!`);
        console.log('Comprehensive scraping completed successfully:', {
          jobsFound: data.jobsFound,
          jobsCreated: data.jobsCreated
        });
      } else if (data?.status === 'in_progress') {
        toast.success('Comprehensive scraping job queued successfully! Check the recent jobs list for updates.');
        console.log('Comprehensive scraping in progress, will need to check back later');
      } else {
        const errorMessage = data?.message || data?.error || 'Comprehensive scraping failed';
        console.error('Comprehensive scraping failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Clear form and refresh recent jobs
      setUrl('');
      setCompanyName('');
      fetchRecentJobs();

    } catch (error: any) {
      console.error('Comprehensive scraping process error:', error);
      toast.error(`Comprehensive scraping failed: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  const fetchRecentJobs = async () => {
    try {
      console.log('Fetching recent scraping jobs...');
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select(`
          *,
          career_page_sources!inner(url, company_name)
        `)
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent jobs:', error);
        throw error;
      }

      const jobs: ScrapingJob[] = data.map(job => ({
        id: job.id,
        status: job.status as 'pending' | 'running' | 'completed' | 'failed',
        jobs_found: job.jobs_found,
        jobs_created: job.jobs_created,
        error_message: job.error_message,
        started_at: job.started_at,
        completed_at: job.completed_at,
        source_url: job.career_page_sources.url,
        company_name: job.career_page_sources.company_name
      }));

      console.log('Recent jobs fetched:', jobs.length);
      setRecentJobs(jobs);
      
      // Count running jobs for UI feedback
      const running = jobs.filter(job => job.status === 'running' || job.status === 'pending').length;
      setRunningJobsCount(running);
    } catch (error: any) {
      console.error('Error fetching recent jobs:', error);
      toast.error('Failed to fetch recent jobs');
    }
  };

  // Set up real-time updates for scraping jobs
  useEffect(() => {
    fetchRecentJobs();

    // Subscribe to real-time updates for scraping_jobs table
    const channel = supabase
      .channel('scraping_jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scraping_jobs'
        },
        (payload) => {
          console.log('Real-time scraping job update:', payload);
          // Refresh the jobs list when any scraping job changes
          fetchRecentJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getJobDuration = (startedAt: string, completedAt?: string | null) => {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.round(duration / 60)}m`;
    return `${Math.round(duration / 3600)}h`;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Scraper Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Enhanced Career Page Scraper
            {runningJobsCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {runningJobsCount} running
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Add a company's career page URL for comprehensive AI-powered job extraction (5-minute deep analysis).
            Multiple requests can run simultaneously.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="career-url">Career Page URL *</Label>
              <Input
                id="career-url"
                type="url"
                placeholder="https://jobs.lever.co/company or https://company.com/careers"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name (Optional)</Label>
              <Input
                id="company-name"
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Enhanced scraping with 5-minute comprehensive analysis per request. 
              AI intelligently clicks through individual job pages for detailed extraction.
              Multiple requests can run concurrently. Jobs are saved as drafts for review.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button 
              onClick={handleScrapeNow} 
              disabled={isSubmitting || !url.trim()}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Queuing Job...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Comprehensive Scrape
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={cleanupStuckJobs} 
              disabled={isCleaningUp}
              title="Clean up jobs that have been running for more than 8 minutes"
            >
              {isCleaningUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Cleanup Stuck Jobs
                </>
              )}
            </Button>
          </div>

          {/* Preview Results */}
          {previewResults.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully extracted {previewResults.length} job postings with comprehensive data. 
                They have been saved as drafts for review in the Job Drafts section.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Recent Scraping Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Recent Scraping Jobs
            {runningJobsCount > 0 && (
              <Badge variant="secondary" className="animate-pulse">
                {runningJobsCount} active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Track comprehensive AI-powered scraping operations. Updates automatically in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No scraping jobs yet. Start by adding a career page URL above.
            </p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3 transition-colors ${
                    job.status === 'running' ? 'border-blue-200 bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getStatusIcon(job.status)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {job.company_name || new URL(job.source_url).hostname}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {job.source_url}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Duration: {getJobDuration(job.started_at, job.completed_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:text-right">
                    <div className="text-sm min-w-0 flex-1">
                      {job.status === 'completed' && (
                        <p className="text-green-600 font-medium">
                          {job.jobs_created} of {job.jobs_found} jobs imported
                        </p>
                      )}
                      {job.status === 'failed' && job.error_message && (
                        <p className="text-red-500 break-words text-xs" title={job.error_message}>
                          {job.error_message.length > 50 
                            ? `${job.error_message.substring(0, 50)}...` 
                            : job.error_message
                          }
                        </p>
                      )}
                      {job.status === 'running' && (
                        <p className="text-blue-500 flex items-center gap-1 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Comprehensive Analysis...
                        </p>
                      )}
                      {job.status === 'pending' && (
                        <p className="text-yellow-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Queued
                        </p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        {new Date(job.started_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(job.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerPageScraper;
