
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, LineChart, Settings, User, Box, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DraftJobsList from '@/components/admin/DraftJobsList';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [draftJobsCount, setDraftJobsCount] = useState<number | null>(null);
  const [scrapingJobsCount, setScrapingJobsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchDraftJobsCount = async () => {
      try {
        const { count, error } = await supabase
          .from('job_postings')
          .select('*', { count: 'exact', head: true })
          .eq('is_draft', true);
          
        if (error) {
          console.error('Error fetching draft jobs count:', error);
          return;
        }
        
        setDraftJobsCount(count);
      } catch (error) {
        console.error('Error fetching draft jobs count:', error);
      }
    };

    const fetchScrapingJobsCount = async () => {
      try {
        const { count, error } = await supabase
          .from('scraping_jobs')
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error('Error fetching scraping jobs count:', error);
          return;
        }
        
        setScrapingJobsCount(count);
      } catch (error) {
        console.error('Error fetching scraping jobs count:', error);
      }
    };
    
    fetchDraftJobsCount();
    fetchScrapingJobsCount();
  }, []);

  const adminTools = [
    {
      title: 'Scraping Tool',
      description: 'Configure and run web scraping jobs',
      icon: <Database className="w-5 h-5" />,
      link: '/admin/scraping',
      color: 'bg-primary/10',
      iconColor: 'text-primary',
      count: scrapingJobsCount
    },
    {
      title: 'Job Drafts',
      description: 'Manage scraped job drafts',
      icon: <FileText className="w-5 h-5" />,
      link: '#job-drafts',
      color: 'bg-green-500/10',
      iconColor: 'text-green-500',
      count: draftJobsCount
    },
    {
      title: 'Analytics',
      description: 'View site statistics and metrics',
      icon: <LineChart className="w-5 h-5" />,
      link: '/admin/analytics',
      color: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      comingSoon: true
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: <User className="w-5 h-5" />,
      link: '/admin/users',
      color: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      comingSoon: true
    },
    {
      title: 'Site Settings',
      description: 'Configure global application settings',
      icon: <Settings className="w-5 h-5" />,
      link: '/admin/settings',
      color: 'bg-green-500/10',
      iconColor: 'text-green-500',
      comingSoon: true
    }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email?.split('@')[0] || 'Admin'}. Manage your application settings and tools.
            </p>
          </div>

          <Tabs defaultValue="tools">
            <TabsList className="mb-8">
              <TabsTrigger value="tools">Admin Tools</TabsTrigger>
              <TabsTrigger value="drafts">Job Drafts {draftJobsCount ? `(${draftJobsCount})` : ''}</TabsTrigger>
            </TabsList>
          
            <TabsContent value="tools">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminTools.map((tool, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg w-fit ${tool.color}`}>
                          <div className={tool.iconColor}>{tool.icon}</div>
                        </div>
                        {typeof tool.count === 'number' && (
                          <span className="bg-muted rounded-full px-2 py-1 text-xs font-medium">
                            {tool.count}
                          </span>
                        )}
                      </div>
                      <CardTitle className="mt-4">{tool.title}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button 
                        asChild={!tool.comingSoon} 
                        variant={!tool.comingSoon ? "default" : "secondary"} 
                        className="w-full"
                      >
                        {!tool.comingSoon ? (
                          <Link to={tool.link}>
                            Access Tool
                          </Link>
                        ) : (
                          <>Coming Soon</>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="mt-12 p-6 bg-muted rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Box className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h2 className="text-xl font-medium">Job Posting Automation</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Use the Job Scraper to quickly import job postings from external sources.
                  Simply paste a URL, review the extracted data, and publish to your job board.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button asChild variant="default">
                    <Link to="/admin/scraping?tab=job-scraper">
                      Extract Job from URL
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/post-job">
                      Create Job Manually
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="drafts" id="job-drafts">
              <DraftJobsList />
              
              <div className="mt-8 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <p>Draft jobs can be edited and published when ready.</p>
                </div>
                <Button asChild>
                  <Link to="/admin/scraping?tab=job-scraper">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Extract New Job
                  </Link>
                </Button>
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
