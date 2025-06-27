
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QueueStats {
  id: string;
  processed_jobs: number;
  failed_jobs: number;
  queue_size: number;
  processing_time_ms: number | null;
  created_at: string;
  trigger_source: string;
}

interface QueueSummary {
  totalPending: number;
  totalRunning: number;
  totalCompleted: number;
  totalFailed: number;
  recentStats: QueueStats[];
  averageProcessingTime: number;
  successRate: number;
}

export const useQueueMonitoring = () => {
  const [queueSummary, setQueueSummary] = useState<QueueSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQueueStats = async () => {
    try {
      // Get current queue status
      const [
        { count: pendingCount },
        { count: runningCount },
        { count: completedCount },
        { count: failedCount }
      ] = await Promise.all([
        supabase.from('scraping_jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('scraping_jobs').select('*', { count: 'exact', head: true }).eq('status', 'running'),
        supabase.from('scraping_jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('scraping_jobs').select('*', { count: 'exact', head: true }).eq('status', 'failed')
      ]);

      // Get recent monitoring stats
      const { data: recentStats, error: statsError } = await supabase
        .from('queue_monitoring')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (statsError) throw statsError;

      // Calculate averages
      const validStats = (recentStats || []).filter(s => s.processing_time_ms !== null);
      const avgProcessingTime = validStats.length > 0 
        ? validStats.reduce((sum, stat) => sum + (stat.processing_time_ms || 0), 0) / validStats.length
        : 0;

      const totalJobs = (completedCount || 0) + (failedCount || 0);
      const successRate = totalJobs > 0 ? ((completedCount || 0) / totalJobs) * 100 : 0;

      setQueueSummary({
        totalPending: pendingCount || 0,
        totalRunning: runningCount || 0,
        totalCompleted: completedCount || 0,
        totalFailed: failedCount || 0,
        recentStats: (recentStats || []) as QueueStats[],
        averageProcessingTime: Math.round(avgProcessingTime),
        successRate: Math.round(successRate * 100) / 100
      });
    } catch (error) {
      console.error('Error fetching queue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerQueueProcess = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('process-scraping-queue', {
        body: { trigger: 'manual' }
      });

      if (error) throw error;

      console.log('Queue processing triggered:', data);
      
      // Refresh stats after triggering
      setTimeout(fetchQueueStats, 2000);
      
      return { success: true, data };
    } catch (error) {
      console.error('Error triggering queue process:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchQueueStats();

    // Subscribe to real-time updates for scraping jobs
    const channel = supabase
      .channel('queue_monitoring_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scraping_jobs'
        },
        () => {
          fetchQueueStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_monitoring'
        },
        () => {
          fetchQueueStats();
        }
      )
      .subscribe();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchQueueStats, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return {
    queueSummary,
    loading,
    refresh: fetchQueueStats,
    triggerQueueProcess
  };
};
