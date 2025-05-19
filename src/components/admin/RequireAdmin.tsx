
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * A route guard component that only allows admin users to access
 * protected routes. If the user is not an admin, they are redirected
 * to an unauthorized page or the home page.
 */
const RequireAdmin: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    if (!isLoading) {
      checkAdminStatus();
    }
  }, [user, isLoading]);

  if (isLoading || isCheckingAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
