import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Globe, Plus, Upload, Activity, AlertTriangle, FileInput, Shield, Wifi, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DraftJobsList from '@/components/admin/DraftJobsList';
import CareerPageScraper from '@/components/admin/CareerPageScraper';
import BulkScrapingUpload from '@/components/admin/BulkScrapingUpload';
import QueueStatus from '@/components/admin/QueueStatus';
import StuckJobsManager from '@/components/admin/StuckJobsManager';
import EnhancedManualImport from '@/components/admin/EnhancedManualImport';
import DuplicateMonitor from '@/components/admin/DuplicateMonitor';
import JobRecoveryMonitor from '@/components/admin/JobRecoveryMonitor';
import WebhookHealthMonitor from '@/components/admin/WebhookHealthMonitor';
import SystemHealthMonitor from '@/components/admin/SystemHealthMonitor';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [draftJobsCount, setDraftJobsCount] = useState<number | null>(null);
  const [recentScrapingCount, setRecentScrapingCount] = useState<number | null>(null);
  const [activeBatchesCount, setActiveBatchesCount] = useState<number | null>(null);
  const [queuePendingCount, setQueuePendingCount] = useState<number | null>(null);
  const [stuckJobsCount, setStuckJobsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch draft jobs count
        const { count: draftsCount, error: draftsError } = await supabase
          .from('job_postings')
          .select('*', { count: 'exact', head: true })
          .eq('is_draft', true);
          
        if (draftsError) {
          console.error('Error fetching draft jobs count:', draftsError);
        } else {
          setDraftJobsCount(draftsCount);
        }

        // Fetch recent scraping jobs count (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 1000).toISOString();
        const { count: scrapingCount, error: scrapingError } = await supabase
          .from('scraping_jobs')
          .select('*', { count: 'exact', head: true })
          .gte('started_at', sevenDaysAgo);
          
        if (scrapingError) {
          console.error('Error fetching scraping jobs count:', scrapingError);
        } else {
          setRecentScrapingCount(scrapingCount);
        }

        // Fetch active batches count
        const { count: batchesCount, error: batchesError } = await supabase
          .from('scraping_batches')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'processing']);
          
        if (batchesError) {
          console.error('Error fetching active batches count:', batchesError);
        } else {
          setActiveBatchesCount(batchesCount);
        }

        // Fetch pending queue jobs count
        const { count: pendingCount, error: pendingError } = await supabase
          .from('scraping_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        if (pendingError) {
          console.error('Error fetching pending jobs count:', pendingError);
        } else {
          setQueuePendingCount(pendingCount);
        }

        // PHASE 2: Improved stuck detection (reduced from 15 to 10 minutes)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const { count: stuckCount, error: stuckError } = await supabase
          .from('scraping_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'running')
          .lt('started_at', tenMinutesAgo);
          
        if (stuckError) {
          console.error('Error fetching stuck jobs count:', stuckError);
        } else {
          setStuckJobsCount(stuckCount);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section - Simplified */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.email?.split('@')[0] || 'Admin'}. Manage your job scraping operations.
                </p>
              </div>
              <Button asChild>
                <Link to="/post-job">
                  <Plus className="mr-2 h-4 w-4" />
                  New Job
                </Link>
              </Button>
            </div>
            
            {/* Quick Stats - Condensed */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white border rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {draftJobsCount !== null ? draftJobsCount : '...'}
                </div>
                <div className="text-sm text-muted-foreground">Draft Jobs</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {recentScrapingCount !== null ? recentScrapingCount : '...'}
                </div>
                <div className="text-sm text-muted-foreground">Recent Scrapes</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {activeBatchesCount !== null ? activeBatchesCount : '...'}
                </div>
                <div className="text-sm text-muted-foreground">Active Batches</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {queuePendingCount !== null ? queuePendingCount : '...'}
                </div>
                <div className="text-sm text-muted-foreground">Queue Pending</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {stuckJobsCount !== null ? stuckJobsCount : '...'}
                </div>
                <div className="text-sm text-muted-foreground">Stuck Jobs</div>
              </div>
            </div>
          </div>

          {/* Main Content - Enhanced Tabbed Interface */}
          <Tabs defaultValue="drafts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="drafts" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Drafts
                {draftJobsCount !== null && draftJobsCount > 0 && (
                  <span className="bg-orange-100 text-orange-800 rounded-full px-2 py-1 text-xs font-medium ml-1">
                    {draftJobsCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Single
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Bulk
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <FileInput className="w-4 h-4" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="queue" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Queue
              </TabsTrigger>
              <TabsTrigger value="stuck" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Stuck
                {stuckJobsCount !== null && stuckJobsCount > 0 && (
                  <span className="bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs font-medium ml-1">
                    {stuckJobsCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="recovery" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Recovery
              </TabsTrigger>
              <TabsTrigger value="webhook" className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Webhook
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Monitoring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="drafts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <FileText className="w-5 h-5 text-orange-500" />
                    </div>
                    Draft Jobs Management
                  </CardTitle>
                  <CardDescription>
                    Review and approve scraped job postings before they go live
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DraftJobsList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="single">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Globe className="w-5 h-5 text-purple-500" />
                    </div>
                    Single Career Page Scraper
                  </CardTitle>
                  <CardDescription>
                    Add individual career page URLs for immediate scraping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CareerPageScraper />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk">
              <BulkScrapingUpload />
            </TabsContent>

            <TabsContent value="manual">
              <EnhancedManualImport />
            </TabsContent>

            <TabsContent value="queue">
              <div className="space-y-6">
                {/* System Health Monitor in Queue Tab */}
                <SystemHealthMonitor />
                <QueueStatus />
              </div>
            </TabsContent>

            <TabsContent value="stuck">
              <StuckJobsManager />
            </TabsContent>

            <TabsContent value="recovery">
              <div className="space-y-6">
                {/* Job Recovery Monitor with Duplicate Monitor */}
                <JobRecoveryMonitor />
                <DuplicateMonitor />
              </div>
            </TabsContent>

            <TabsContent value="webhook">
              <WebhookHealthMonitor />
            </TabsContent>

            {/* New Monitoring Tab */}
            <TabsContent value="monitoring">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SystemHealthMonitor />
                  <DuplicateMonitor />
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <WebhookHealthMonitor />
                  <JobRecoveryMonitor />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminDashboard;
