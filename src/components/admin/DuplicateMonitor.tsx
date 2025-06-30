import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DuplicateStats {
  totalDrafts: number;
  duplicateGroups: number;
  duplicateJobs: number;
  uniqueJobs: number;
  duplicateRate: number;
}

const DuplicateMonitor: React.FC = () => {
  const [stats, setStats] = useState<DuplicateStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const fetchDuplicateStats = async () => {
    try {
      setLoading(true);
      
      // Get all draft jobs with scraping_job_id
      const { data: draftJobs, error } = await supabase
        .from('job_postings')
        .select('id, scraping_job_id, title, company, created_at')
        .eq('is_draft', true)
        .not('scraping_job_id', 'is', null);

      if (error) throw error;

      if (!draftJobs || draftJobs.length === 0) {
        setStats({
          totalDrafts: 0,
          duplicateGroups: 0,
          duplicateJobs: 0,
          uniqueJobs: 0,
          duplicateRate: 0
        });
        return;
      }

      // Group by scraping_job_id, title, company to find duplicates
      const groups = draftJobs.reduce((acc, job) => {
        const key = `${job.scraping_job_id}-${job.title}-${job.company}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(job);
        return acc;
      }, {} as Record<string, typeof draftJobs>);

      const duplicateGroups = Object.values(groups).filter(group => group.length > 1);
      const duplicateJobs = duplicateGroups.reduce((sum, group) => sum + (group.length - 1), 0);
      const uniqueJobs = Object.keys(groups).length;
      const duplicateRate = draftJobs.length > 0 ? (duplicateJobs / draftJobs.length) * 100 : 0;

      setStats({
        totalDrafts: draftJobs.length,
        duplicateGroups: duplicateGroups.length,
        duplicateJobs,
        uniqueJobs,
        duplicateRate
      });

    } catch (error) {
      console.error('Error fetching duplicate stats:', error);
      toast.error('Failed to fetch duplicate statistics');
    } finally {
      setLoading(false);
    }
  };

  const cleanupDuplicates = async () => {
    try {
      setCleaning(true);
      
      // Get all draft jobs with scraping_job_id to find duplicates
      const { data: draftJobs, error: fetchError } = await supabase
        .from('job_postings')
        .select('id, scraping_job_id, title, company, created_at')
        .eq('is_draft', true)
        .not('scraping_job_id', 'is', null)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (!draftJobs || draftJobs.length === 0) {
        toast.info('No draft jobs found to clean up');
        return;
      }

      // Group by scraping_job_id, title, company to find duplicates
      const groups = draftJobs.reduce((acc, job) => {
        const key = `${job.scraping_job_id}-${job.title}-${job.company}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(job);
        return acc;
      }, {} as Record<string, typeof draftJobs>);

      // Find IDs of duplicate jobs to delete (keep the first one, delete the rest)
      const idsToDelete: string[] = [];
      Object.values(groups).forEach(group => {
        if (group.length > 1) {
          // Keep the first (earliest created), delete the rest
          group.slice(1).forEach(job => {
            idsToDelete.push(job.id);
          });
        }
      });

      if (idsToDelete.length === 0) {
        toast.info('No duplicate jobs found to clean up');
        return;
      }

      // Delete the duplicate jobs
      const { error: deleteError } = await supabase
        .from('job_postings')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) throw deleteError;

      const remainingJobs = draftJobs.length - idsToDelete.length;
      toast.success(`Cleaned up ${idsToDelete.length} duplicate jobs. ${remainingJobs} unique jobs remaining.`);
      
      // Refresh stats
      await fetchDuplicateStats();
      
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      toast.error('Failed to clean up duplicates');
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => {
    fetchDuplicateStats();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Duplicate Job Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading statistics...
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold">{stats.totalDrafts}</div>
                <div className="text-sm text-muted-foreground">Total Drafts</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-green-600">{stats.uniqueJobs}</div>
                <div className="text-sm text-muted-foreground">Unique Jobs</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-orange-600">{stats.duplicateJobs}</div>
                <div className="text-sm text-muted-foreground">Duplicates</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-red-600">{stats.duplicateRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Duplicate Rate</div>
              </div>
            </div>

            {stats.duplicateJobs > 0 ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Duplicates Detected</span>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  Found {stats.duplicateJobs} duplicate jobs in {stats.duplicateGroups} groups.
                  This indicates a race condition between webhook and polling functions.
                </p>
                <Button
                  onClick={cleanupDuplicates}
                  disabled={cleaning}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {cleaning ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    'Clean Up Duplicates'
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">No Duplicates Found</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  All draft jobs are unique. The duplicate prevention system is working correctly.
                </p>
              </div>
            )}
          </>
        ) : null}

        <div className="flex gap-2">
          <Button
            onClick={fetchDuplicateStats}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              'Refresh Stats'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DuplicateMonitor;
