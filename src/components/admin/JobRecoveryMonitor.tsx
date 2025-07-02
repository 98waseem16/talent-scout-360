
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shield, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface RecoveryLog {
  id: string;
  scraping_job_id: string;
  recovery_action: string;
  old_status: string;
  new_status: string;
  recovery_reason: string;
  created_at: string;
}

interface RecoveryStats {
  totalRecoveries: number;
  last24Hours: number;
  mostCommonAction: string;
  successRate: number;
}

const JobRecoveryMonitor: React.FC = () => {
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLog[]>([]);
  const [stats, setStats] = useState<RecoveryStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecoveryData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent recovery logs
      const { data: logs, error: logsError } = await supabase
        .from('job_recovery_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      setRecoveryLogs(logs || []);

      // Calculate stats
      if (logs && logs.length > 0) {
        const last24Hours = logs.filter(log => 
          new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;

        const actionCounts = logs.reduce((acc, log) => {
          acc[log.recovery_action] = (acc[log.recovery_action] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const mostCommonAction = Object.entries(actionCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

        const successfulRecoveries = logs.filter(log => 
          ['completed', 'pending'].includes(log.new_status)
        ).length;

        setStats({
          totalRecoveries: logs.length,
          last24Hours,
          mostCommonAction,
          successRate: (successfulRecoveries / logs.length) * 100
        });
      }

    } catch (error) {
      console.error('Error fetching recovery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const badgeMap: Record<string, { variant: any; label: string }> = {
      'timeout_recovery': { variant: 'destructive', label: 'Timeout' },
      'webhook_backup_trigger': { variant: 'default', label: 'Webhook Backup' },
      'manual_cancellation': { variant: 'secondary', label: 'Manual Cancel' },
      'manual_retry': { variant: 'default', label: 'Manual Retry' },
      'status_sync': { variant: 'outline', label: 'Status Sync' },
      'force_sync': { variant: 'default', label: 'Force Sync' }
    };

    const config = badgeMap[action] || { variant: 'outline', label: action };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (oldStatus: string, newStatus: string) => {
    const isImprovement = newStatus === 'completed' || (newStatus === 'pending' && oldStatus === 'running');
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline">{oldStatus}</Badge>
        <span>→</span>
        <Badge variant={isImprovement ? 'default' : 'destructive'}>{newStatus}</Badge>
      </div>
    );
  };

  useEffect(() => {
    fetchRecoveryData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRecoveryData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Job Recovery Monitor
          </div>
          <Button onClick={fetchRecoveryData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRecoveries}</div>
              <div className="text-sm text-muted-foreground">Total Recoveries</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-green-600">{stats.last24Hours}</div>
              <div className="text-sm text-muted-foreground">Last 24 Hours</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-purple-600">{stats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-sm font-bold text-orange-600">{stats.mostCommonAction}</div>
              <div className="text-sm text-muted-foreground">Most Common</div>
            </div>
          </div>
        )}

        {/* Recent Recovery Logs */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recent Recovery Actions
          </h3>
          
          {recoveryLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recovery actions yet</p>
              <p className="text-sm">System is running smoothly</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status Change</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recoveryLogs.slice(0, 20).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getActionBadge(log.recovery_action)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.old_status, log.new_status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.recovery_reason}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobRecoveryMonitor;
