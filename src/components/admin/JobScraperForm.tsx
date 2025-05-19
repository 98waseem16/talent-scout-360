
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Globe, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SCRAPE_TIMEOUT = 30000; // 30 second client-side timeout

const JobScraperForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobUrl, setJobUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleScrapeJob = async () => {
    if (!jobUrl.trim()) {
      toast.error('Please enter a job URL');
      return;
    }
    
    if (!jobUrl.startsWith('http')) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }
    
    setIsSubmitting(true);
    setScrapingStatus('Submitting job URL...');
    setError(null);
    toast.info('Starting job scraping process...');
    
    try {
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT);
      
      setScrapingStatus('Extracting job data...');
      
      // Call our edge function to scrape the job
      const { data: functionData, error: functionError } = await supabase.functions
        .invoke('scrape-job', {
          body: { url: jobUrl, userId: user?.id }
        });
      
      clearTimeout(timeoutId);
      
      if (functionError) {
        throw functionError;
      }
      
      console.log('Scraping result:', functionData);
      
      if (functionData.jobId) {
        setScrapingStatus('Job data extracted successfully!');
        toast.success('Job data extracted successfully!');
        // Navigate to the job edit form with the new job ID
        navigate(`/edit-job/${functionData.jobId}?fromScraper=true`);
      } else {
        setError('No job data could be extracted');
        toast.error('No job data could be extracted');
      }
    } catch (error: any) {
      console.error('Error scraping job:', error);
      
      // Handle specific error cases
      if (error.name === 'AbortError') {
        setError('Scraping timed out. Please try again or use a different URL.');
        toast.error('Scraping timed out. Please try again or use a different URL.');
      } else {
        setError(`Failed to scrape job: ${error.message || 'Unknown error'}`);
        toast.error(`Failed to scrape job: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Quick Job Scraper</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <label htmlFor="job-url" className="font-medium">
                Job Posting URL
              </label>
            </div>
            <Input
              id="job-url"
              placeholder="https://example.com/jobs/software-engineer"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Paste the URL of any job posting to automatically extract its details
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
          
          {scrapingStatus && !error && (
            <Alert className="mt-4 bg-blue-50 border border-blue-200">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <AlertDescription className="text-sm">{scrapingStatus}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleScrapeJob} 
          disabled={isSubmitting || !jobUrl.trim()}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {scrapingStatus || 'Processing...'}
            </>
          ) : (
            'Extract Job Data'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobScraperForm;
