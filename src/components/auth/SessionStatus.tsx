
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, User, Clock, AlertCircle } from 'lucide-react';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';

const SessionStatus: React.FC = () => {
  const { session, user, isLoading } = useAuth();
  const { isRecovering, recoverSession } = useSessionRecovery();

  const getSessionStatus = () => {
    if (isLoading) return { status: 'loading', color: 'secondary' };
    if (!session || !user) return { status: 'signed out', color: 'destructive' };
    
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    
    if (expiresAt && expiresAt <= now) {
      return { status: 'expired', color: 'destructive' };
    }
    
    if (expiresAt && (expiresAt - now) < 300) { // Less than 5 minutes
      return { status: 'expiring soon', color: 'warning' };
    }
    
    return { status: 'active', color: 'success' };
  };

  const { status, color } = getSessionStatus();

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 opacity-90 hover:opacity-100 transition-opacity">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="h-4 w-4" />
          Session Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Status:</span>
          <Badge variant={color as any}>{status}</Badge>
        </div>
        
        {user && (
          <div className="flex items-center justify-between">
            <span className="text-sm">User:</span>
            <span className="text-xs truncate max-w-32" title={user.email}>
              {user.email}
            </span>
          </div>
        )}
        
        {session?.expires_at && (
          <div className="flex items-center justify-between">
            <span className="text-sm">Expires:</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs">
                {new Date(session.expires_at * 1000).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={recoverSession}
            disabled={isRecovering}
            className="flex-1"
          >
            {isRecovering ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Recovering...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Recover
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionStatus;
