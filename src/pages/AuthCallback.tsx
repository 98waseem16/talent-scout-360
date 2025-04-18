
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session - Supabase client will automatically handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // Extract returnTo from URL if present
        const url = new URL(window.location.href);
        const returnTo = url.searchParams.get('returnTo');
        const redirectPath = returnTo || '/dashboard';
        
        // Clear stored return path
        localStorage.removeItem('authReturnPath');
        
        // Navigate to the return path or dashboard
        navigate(redirectPath, { replace: true });
      } catch (error) {
        console.error('Error during authentication callback:', error);
        setError('Authentication failed. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  const handleGoBack = () => {
    navigate('/auth');
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleGoBack}>Go Back to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg mt-4">Completing sign in...</span>
      </div>
    </div>
  );
};

export default AuthCallback;
