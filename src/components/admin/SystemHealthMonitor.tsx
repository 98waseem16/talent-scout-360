
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealth {
  pollingFunction: 'healthy' | 'error' | 'unknown';
  gobiApi: 'healthy' | 'error' | 'unknown';
  webhookHealth: 'healthy' | 'error' | 'unknown';
  lastPollingRun: string | null;
  activeJobs: number;
  completedToday: number;
  failedToday: number;
}

const SystemHealthMonitor: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth>({
    pollingFunction: 'unknown',
    gobiApi: 'unknown',
    webhookHealth: 'unknown',
    lastPollingRun: null,
    activeJobs: 0,
    completedToday: 0,
    failedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const { toast } = useToast();

  const checkSystemHealth = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check active jobs
      const { count: activeCount } = await supabase
        .from('scraping_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'running');

      // Check completed jobs today
      const { count: completedCount } = await supabase
        .from('scraping_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', today);

      // Check failed jobs today
      const { count: failedCount } = await supabase
        .from('scraping_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
        .gte('completed_at', today);

      // Check last polling run from queue monitoring
      const { data: lastRun } = await supabase
        .from('queue_monitoring')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setHealth({
        pollingFunction: 'unknown', // Will be determined by other checks
        gobiApi: 'unknown',
        webhookHealth: 'unknown',
        lastPollingRun: lastRun?.created_at || null,
        activeJobs: activeCount || 0,
        completedToday: completedCount || 0,
        failedToday: failedCount || 0
      });

    } catch (error) {
      console.error('Error checking system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const testPollingFunction = async () => {
    setTesting('polling');
    try {
      const { data, error } = await supabase.functions.invoke('poll-gobi-tasks', {
        body: { trigger: 'health_check' }
      });

      if (error) throw error;

      setHealth(prev => ({ ...prev, pollingFunction: 'healthy' }));
      toast({
        title: "Polling Function Healthy",
        description: "Function responded successfully",
      });
    } catch (error) {
      setHealth(prev => ({ ...prev, pollingFunction: 'error' }));
      toast({
        title: "Polling Function Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const testGobiApi = async () => {
    setTesting('gobi');
    try {
      // Test with a dummy task ID to see if API is reachable
      const response = await fetch('https://gobii.ai/api/v1/tasks/browser-use/test-connection', {
        headers: {
          'Authorization': `Bearer ${process.env.GOBI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Even a 404 means the API is reachable
      if (response.status === 404 || response.status === 200) {
        setHealth(prev => ({ ...prev, gobiApi: 'healthy' }));
        toast({
          title: "Gobi API Reachable",
          description: "API endpoint is accessible",
        });
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      setHealth(prev => ({ ...prev, gobiApi: 'error' }));
      toast({
        title: "Gobi API Error",
        description: "Cannot reach Gobi API endpoint",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          System Health Monitor
        </CardTitle>
        <CardDescription>
          Monitor scraping system components and API connectivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{health.activeJobs}</div>
            <div className="text-sm text-muted-foreground">Active Jobs</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">{health.completedToday}</div>
            <div className="text-sm text-muted-foreground">Completed Today</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-red-600">{health.failedToday}</div>
            <div className="text-sm text-muted-foreground">Failed Today</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-sm font-medium">
              {health.lastPollingRun 
                ? new Date(health.lastPollingRun).toLocaleTimeString()
                : 'Never'
              }
            </div>
            <div className="text-sm text-muted-foreground">Last Poll</div>
          </div>
        </div>

        {/* Component Health */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(health.pollingFunction)}
              <div>
                <div className="font-medium">Polling Function</div>
                <div className="text-sm text-muted-foreground">Poll Gobi Tasks Function</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(health.pollingFunction)}
              <Button
                size="sm"
                variant="outline"
                onClick={testPollingFunction}
                disabled={testing === 'polling'}
              >
                Test
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(health.gobiApi)}
              <div>
                <div className="font-medium">Gobi API</div>
                <div className="text-sm text-muted-foreground">gobii.ai API connectivity</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(health.gobiApi)}
              <Button
                size="sm"
                variant="outline"
                onClick={testGobiApi}
                disabled={testing === 'gobi'}
              >
                Test
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={checkSystemHealth} variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh Health
          </Button>
          <Button
            onClick={() => {
              testPollingFunction();
              testGobiApi();
            }}
            variant="default"
            size="sm"
            disabled={testing !== null}
          >
            Test All Components
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthMonitor;
