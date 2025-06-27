
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQueueMonitoring } from '@/hooks/useQueueMonitoring';
import { Play, RefreshCw, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QueueStatus: React.FC = () => {
  const { queueSummary, loading, refresh, triggerQueueProcess } = useQueueMonitoring();
  const { toast } = useToast();

  const handleTriggerQueue = async () => {
    const result = await triggerQueueProcess();
    
    if (result.success) {
      toast({
        title: "Queue Processing Triggered",
        description: "The scraping queue is now being processed manually.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to trigger queue processing",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader className="w-5 h-5 animate-spin" />
            Loading Queue Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!queueSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Queue Status</CardTitle>
          <CardDescription>Unable to load queue statistics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Queue Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Queue Status Overview
            <div className="flex gap-2">
              <Button onClick={refresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button onClick={handleTriggerQueue} size="sm">
                <Play className="w-4 h-4 mr-1" />
                Process Now
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Real-time monitoring of the scraping queue system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {queueSummary.totalPending}
              </div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {queueSummary.totalRunning}
              </div>
              <div className="text-sm text-blue-700">Running</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {queueSummary.totalCompleted}
              </div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {queueSummary.totalFailed}
              </div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                Avg Processing Time: <strong>{formatDuration(queueSummary.averageProcessingTime)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">
                Success Rate: <strong>{queueSummary.successRate}%</strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Queue Activity</CardTitle>
          <CardDescription>
            Last 20 queue processing runs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Processed</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Queue Size</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queueSummary.recentStats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="text-sm">
                    {formatDate(stat.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={stat.trigger_source === 'cron' ? 'secondary' : 'default'}>
                      {stat.trigger_source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {stat.processed_jobs}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-red-500" />
                      {stat.failed_jobs}
                    </div>
                  </TableCell>
                  <TableCell>{stat.queue_size}</TableCell>
                  <TableCell>
                    {stat.processing_time_ms ? formatDuration(stat.processing_time_ms) : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueStatus;
