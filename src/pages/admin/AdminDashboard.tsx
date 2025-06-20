
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Globe, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DraftJobsList from '@/components/admin/DraftJobsList';
import CareerPageScraper from '@/components/admin/CareerPageScraper';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [draftJobsCount, setDraftJobsCount] = useState<number | null>(null);
  const [recentScrapingCount, setRecentScrapingCount] = useState<number | null>(null);

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
          {/* Header Section */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground mb-6">
              Welcome back, {user?.email?.split('@')[0] || 'Admin'}. Manage job drafts and scrape career pages.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                <div className="text-2xl font-bold text-green-600">
                  {draftJobsCount !== null && recentScrapingCount !== null ? 
                    draftJobsCount + recentScrapingCount : '...'
                  }
                </div>
                <div className="text-sm text-muted-foreground">Total Activity</div>
              </div>
              <div className="bg-white border rounded-lg p-4 flex items-center">
                <Button asChild size="sm" className="w-full">
                  <Link to="/post-job">
                    <Plus className="mr-2 h-4 w-4" />
                    New Job
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Draft Jobs Management */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <FileText className="w-5 h-5 text-orange-500" />
                    </div>
                    Draft Jobs Management
                    {draftJobsCount !== null && draftJobsCount > 0 && (
                      <span className="bg-orange-100 text-orange-800 rounded-full px-2 py-1 text-xs font-medium">
                        {draftJobsCount}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Review and approve scraped job postings before they go live
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DraftJobsList />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Career Page Scraper */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Globe className="w-5 h-5 text-purple-500" />
                    </div>
                    Career Page Scraper
                    {recentScrapingCount !== null && recentScrapingCount > 0 && (
                      <span className="bg-purple-100 text-purple-800 rounded-full px-2 py-1 text-xs font-medium">
                        {recentScrapingCount} this week
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Add and manage career page URLs for automatic job scraping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CareerPageScraper />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminDashboard;
