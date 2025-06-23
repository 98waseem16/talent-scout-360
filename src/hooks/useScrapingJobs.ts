
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useScrapingJobs = () => {
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningCount, setRunningCount] = useState(0);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select(`
          *,
          career_page_sources!inner(url, company_name)
        `)
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const mappedJobs: ScrapingJob[] = data.map(job => ({
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

      setJobs(mappedJobs);
      setRunningCount(mappedJobs.filter(job => job.status === 'running' || job.status === 'pending').length);
    } catch (error) {
      console.error('Error fetching scraping jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('scraping_jobs_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scraping_jobs'
        },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    jobs,
    loading,
    runningCount,
    refresh: fetchJobs
  };
};
