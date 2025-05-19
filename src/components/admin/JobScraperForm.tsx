
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const JobScraperForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobUrl, setJobUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    toast.info('Starting job scraping process...');
    
    try {
      // First create a scraping job entry
      const { data: scrapingJob, error: createError } = await supabase
        .from('scraping_jobs')
        .insert({
          url: jobUrl,
          selectors: {}, // No selectors needed for this approach
          user_id: user?.id,
          status: 'pending'
        })
        .select();
      
      if (createError) {
        throw createError;
      }
      
      toast.info('Job URL submitted, now extracting data...');
      
      // Call our edge function to scrape the job
      const { data: functionData, error: functionError } = await supabase.functions
        .invoke('scrape-job', {
          body: { url: jobUrl, userId: user?.id }
        });
      
      if (functionError) {
        throw functionError;
      }
      
      console.log('Scraping result:', functionData);
      
      if (functionData.jobId) {
        toast.success('Job data extracted successfully!');
        // Navigate to the job edit form with the new job ID
        navigate(`/edit-job/${functionData.jobId}?fromScraper=true`);
      } else {
        toast.error('No job data could be extracted');
      }
    } catch (error: any) {
      console.error('Error scraping job:', error);
      toast.error(`Failed to scrape job: ${error.message}`);
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
            />
            <p className="text-xs text-muted-foreground">
              Paste the URL of any job posting to automatically extract its details
            </p>
          </div>
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
              Extracting Job Data...
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
