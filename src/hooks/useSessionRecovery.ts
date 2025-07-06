
import { useState, useEffect, useCallback } from 'react';
import { validateSession, forceAuthRefresh, cleanupAuthState } from '@/lib/auth-utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useSessionRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const queryClient = useQueryClient();

  const recoverSession = useCallback(async () => {
    if (isRecovering) return false;
    
    setIsRecovering(true);
    
    try {
      console.log('Starting session recovery...');
      
      // First, try to validate the current session
      const isValid = await validateSession();
      
      if (isValid) {
        console.log('Session is valid');
        setIsRecovering(false);
        return true;
      }
      
      console.log('Session invalid, attempting refresh...');
      
      // Try to force refresh
      const refreshedSession = await forceAuthRefresh();
      
      if (refreshedSession) {
        console.log('Session refreshed successfully');
        
        // Clear React Query cache to force fresh data
        queryClient.clear();
        
        toast.success('Session recovered successfully');
        setIsRecovering(false);
        return true;
      }
      
      console.log('Session recovery failed, cleaning up...');
      
      // Complete cleanup if all else fails
      cleanupAuthState();
      queryClient.clear();
      
      toast.error('Session expired. Please sign in again.');
      setIsRecovering(false);
      return false;
      
    } catch (error) {
      console.error('Session recovery error:', error);
      cleanupAuthState();
      queryClient.clear();
      toast.error('Session recovery failed. Please sign in again.');
      setIsRecovering(false);
      return false;
    }
  }, [isRecovering, queryClient]);

  // Auto-recovery on mount and periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      const isValid = await validateSession();
      if (!isValid) {
        await recoverSession();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [recoverSession]);

  return {
    isRecovering,
    recoverSession
  };
};
