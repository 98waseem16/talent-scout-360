
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { resetState } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback page: Starting callback handling");
        
        // Get the session - Supabase client will automatically handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          throw error;
        }
        
        console.log("Auth callback page: Session data received", !!data.session);
        
        // If we have a session, redirect to home page
        if (data.session) {
          navigate('/');
        } else {
          // If no session, redirect to auth page
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error during authentication callback:', error);
        navigate('/auth');
      }
    };

    // Set a timeout to detect stuck states
    const timeoutId = setTimeout(() => {
      console.warn("Auth callback page: Timeout - callback handling took too long");
    }, 5000);

    handleAuthCallback();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  const handleReset = () => {
    resetState();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex items-center mb-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Completing sign in...</span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 text-center">
        If you're stuck on this page for more than a few seconds, try resetting your session:
      </p>
      
      <Button 
        variant="destructive" 
        onClick={handleReset}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Reset Session
      </Button>
    </div>
  );
};

export default AuthCallback;
