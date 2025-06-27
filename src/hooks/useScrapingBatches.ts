
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ScrapingBatch {
  id: string;
  total_urls: number;
  completed_urls: number;
  failed_urls: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export const useScrapingBatches = () => {
  const [batches, setBatches] = useState<ScrapingBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching scraping batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBatch = async (urls: string[]) => {
    try {
      // Create batch record
      const { data: batch, error: batchError } = await supabase
        .from('scraping_batches')
        .insert({
          total_urls: urls.length,
          status: 'pending'
        })
        .select()
        .single();

      if (batchError) throw batchError;
      console.log('Created batch:', batch.id);

      // Create individual scraping jobs for each URL
      const scrapingJobs = [];
      for (const url of urls) {
        try {
          // First, create or get the career page source
          const { data: source, error: sourceError } = await supabase
            .from('career_page_sources')
            .upsert({
              url: url.trim(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'url'
            })
            .select()
            .single();

          if (sourceError) throw sourceError;

          // Create scraping job
          scrapingJobs.push({
            source_id: source.id,
            batch_id: batch.id,
            status: 'pending'
          });
        } catch (error) {
          console.error(`Error processing URL ${url}:`, error);
          // Continue with other URLs even if one fails
        }
      }

      if (scrapingJobs.length === 0) {
        throw new Error('No valid URLs to process');
      }

      // Insert all scraping jobs
      const { error: jobsError } = await supabase
        .from('scraping_jobs')
        .insert(scrapingJobs);

      if (jobsError) throw jobsError;

      // Update batch status to processing
      await supabase
        .from('scraping_batches')
        .update({ status: 'processing' })
        .eq('id', batch.id);

      console.log(`Created batch ${batch.id} with ${scrapingJobs.length} jobs`);
      
      // Refresh batches
      fetchBatches();
      
      return { success: true, batch, jobsCreated: scrapingJobs.length };
    } catch (error) {
      console.error('Error creating batch:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchBatches();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('scraping_batches_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scraping_batches'
        },
        () => {
          fetchBatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    batches,
    loading,
    createBatch,
    refresh: fetchBatches
  };
};
