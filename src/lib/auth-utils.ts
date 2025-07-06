
import { supabase } from '@/integrations/supabase/client';

/**
 * Clean up all authentication-related storage items
 */
export const cleanupAuthState = () => {
  // Clear all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear from sessionStorage if it exists
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
  
  // Clear any auth return paths
  localStorage.removeItem('authReturnPath');
};

/**
 * Validate if the current session is still valid
 */
export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return false;
    }
    
    if (!session) {
      return false;
    }
    
    // Check if token is expired (with 5 minute buffer)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const buffer = 5 * 60; // 5 minutes
    
    if (expiresAt && (expiresAt - buffer) <= now) {
      console.log('Session expiring soon, refreshing...');
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !data.session) {
        console.error('Session refresh failed:', refreshError);
        return false;
      }
      
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
};

/**
 * Force a complete auth state refresh
 */
export const forceAuthRefresh = async () => {
  try {
    // First try to refresh the session
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      // If refresh fails, clean up and force re-authentication
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      return null;
    }
    
    return data.session;
  } catch (error) {
    console.error('Force auth refresh failed:', error);
    cleanupAuthState();
    return null;
  }
};

/**
 * Check if we should force a page refresh due to deployment
 */
export const checkForDeploymentRefresh = () => {
  const currentVersion = Date.now().toString();
  const storedVersion = localStorage.getItem('app_version');
  
  if (!storedVersion) {
    localStorage.setItem('app_version', currentVersion);
    return false;
  }
  
  // If we detect a new deployment (this is a simple approach)
  // In production, you'd check against an actual version endpoint
  const timeDiff = parseInt(currentVersion) - parseInt(storedVersion);
  const oneHour = 60 * 60 * 1000;
  
  if (timeDiff > oneHour) {
    localStorage.setItem('app_version', currentVersion);
    return true;
  }
  
  return false;
};
