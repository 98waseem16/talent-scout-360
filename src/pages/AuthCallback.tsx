
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session - Supabase client will automatically handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
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

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Completing sign in...</span>
    </div>
  );
};

export default AuthCallback;
