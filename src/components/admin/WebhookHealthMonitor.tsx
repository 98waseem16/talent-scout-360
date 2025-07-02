
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface WebhookHealth {
  id: string;
  webhook_type: string;
  last_received_at: string | null;
  failure_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const WebhookHealthMonitor: React.FC = () => {
  const [webhookHealth, setWebhookHealth] = useState<WebhookHealth[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebhookHealth = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('webhook_health')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWebhookHealth(data || []);
    } catch (error) {
      console.error('Error fetching webhook health:', error);
      toast.error('Failed to fetch webhook health data');
    } finally {
      setLoading(false);
    }
  };

  const resetFailureCount = async (webhookId: string) => {
    try {
      const { error } = await supabase
        .from('webhook_health')
        .update({
          failure_count: 0,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', webhookId);

      if (error) throw error;

      toast.success('Webhook failure count reset successfully');
      await fetchWebhookHealth();
    } catch (error) {
      console.error('Error resetting failure count:', error);
      toast.error('Failed to reset failure count');
    }
  };

  const getHealthStatus = (webhook: WebhookHealth) => {
    const minutesSinceLastReceived = webhook.last_received_at 
      ? (Date.now() - new Date(webhook.last_received_at).getTime()) / (1000 * 60)
      : Infinity;

    if (!webhook.is_active || webhook.failure_count > 10) {
      return { status: 'critical', color: 'destructive', icon: WifiOff };
    } else if (webhook.failure_count > 5 || minutesSinceLastReceived > 60) {
      return { status: 'warning', color: 'default', icon: AlertCircle };
    } else {
      return { status: 'healthy', color: 'default', icon: CheckCircle };
    }
  };

  const formatLastReceived = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const minutesAgo = (Date.now() - date.getTime()) / (1000 * 60);
    
    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo < 60) return `${Math.floor(minutesAgo)} minutes ago`;
    if (minutesAgo < 1440) return `${Math.floor(minutesAgo / 60)} hours ago`;
    
    return format(date, 'MMM dd, HH:mm');
  };

  useEffect(() => {
    fetchWebhookHealth();
    
    // Check webhook health every 30 seconds
    const interval = setInterval(fetchWebhookHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-600" />
            Webhook Health Monitor
          </div>
          <Button onClick={fetchWebhookHealth} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading webhook health data...
          </div>
        ) : webhookHealth.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <WifiOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No webhook health data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {webhookHealth.map((webhook) => {
              const health = getHealthStatus(webhook);
              const IconComponent = health.icon;
              
              return (
                <div key={webhook.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${
                        health.status === 'healthy' ? 'text-green-600' :
                        health.status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} />
                      <div>
                        <h3 className="font-medium">{webhook.webhook_type}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last received: {formatLastReceived(webhook.last_received_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={health.color}>
                        {health.status.toUpperCase()}
                      </Badge>
                      
                      {webhook.failure_count > 0 && (
                        <Button
                          onClick={() => resetFailureCount(webhook.id)}
                          size="sm"
                          variant="outline"
                        >
                          Reset Failures
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Failure Count:</span>
                      <div className={`font-medium ${
                        webhook.failure_count === 0 ? 'text-green-600' :
                        webhook.failure_count < 5 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {webhook.failure_count}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className={`font-medium ${
                        webhook.is_active ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {webhook.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <div className="font-medium">
                        {format(new Date(webhook.updated_at), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  </div>
                  
                  {health.status === 'critical' && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      Webhook appears to be failing. Check your endpoint configuration and network connectivity.
                    </div>
                  )}
                  
                  {health.status === 'warning' && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      Webhook has some failures or hasn't received data recently. Monitor closely.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookHealthMonitor;
