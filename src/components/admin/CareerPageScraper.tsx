
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [previewResults, setPreviewResults] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<ScrapingJob[]>([]);

  const validateUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
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

    setIsLoading(true);
    setPreviewResults([]);

    try {
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
        throw sourceError;
      }

      // Create a scraping job record
      const { data: jobData, error: jobError } = await supabase
        .from('scraping_jobs')
        .insert({
          source_id: sourceData.id,
          status: 'running',
          created_by: user?.id
        })
        .select()
        .single();

      if (jobError) {
        throw jobError;
      }

      // Call the scraping edge function
      const { data, error } = await supabase.functions.invoke('scrape-career-page', {
        body: {
          url: url.trim(),
          companyName: companyName.trim() || null,
          scrapingJobId: jobData.id
        }
      });

      if (error) {
        throw error;
      }

      setPreviewResults(data.jobs || []);
      toast.success(`Found ${data.jobs?.length || 0} job postings!`);
      
      // Refresh recent jobs
      fetchRecentJobs();

    } catch (error: any) {
      console.error('Scraping error:', error);
      toast.error(`Scraping failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select(`
          *,
          career_page_sources!inner(url, company_name)
        `)
        .order('started_at', { ascending: false })
        .limit(5);

      if (error) throw error;

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

      setRecentJobs(jobs);
    } catch (error: any) {
      console.error('Error fetching recent jobs:', error);
    }
  };

  React.useEffect(() => {
    fetchRecentJobs();
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

  return (
    <div className="space-y-6">
      {/* Scraper Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Career Page Scraper
          </CardTitle>
          <CardDescription>
            Add a company's career page URL to automatically scrape and import job listings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="career-url">Career Page URL *</Label>
              <Input
                id="career-url"
                type="url"
                placeholder="https://company.com/careers"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </div>

          <Button onClick={handleScrapeNow} disabled={isLoading || !url.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              'Scrape Now'
            )}
          </Button>

          {/* Preview Results */}
          {previewResults.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully scraped {previewResults.length} job postings. They have been saved as drafts and can be reviewed in the Job Drafts section.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Scraping Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Recent Scraping Jobs
          </CardTitle>
          <CardDescription>
            Track the status of your recent scraping operations
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
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="font-medium">
                        {job.company_name || new URL(job.source_url).hostname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {job.source_url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div className="text-sm">
                      {job.status === 'completed' && (
                        <p>
                          {job.jobs_created} of {job.jobs_found} jobs imported
                        </p>
                      )}
                      {job.status === 'failed' && job.error_message && (
                        <p className="text-red-500">
                          {job.error_message}
                        </p>
                      )}
                      <p className="text-muted-foreground">
                        {new Date(job.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
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
