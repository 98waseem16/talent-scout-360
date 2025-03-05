
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface SignUpOptions {
  email: string;
  password: string;
  options?: {
    data?: {
      full_name?: string;
    };
  };
}

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (provider: 'google' | 'apple' | 'twitter' | 'linkedin_oidc') => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (options: SignUpOptions) => Promise<void>;
  signOut: () => Promise<void>;
  resetState: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const { toast } = useToast();

  // Reset auth state and redirect to home
  const resetState = () => {
    console.log("Resetting auth state");
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsLoading(false);
    
    // Clear any auth tokens from localStorage
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
    
    // Hard redirect to clear any potential corrupt state
    window.location.href = '/';
  };

  // Monitor user activity to detect potential stuck states
  useEffect(() => {
    const activityEvents = ['click', 'keydown', 'mousemove', 'scroll'];
    
    const updateLastActivity = () => {
      setLastActivity(Date.now());
    };
    
    // Add event listeners for user activity
    activityEvents.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });
    
    // Check for inactive but perpetually loading states
    const checkInactiveLoading = setInterval(() => {
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivity;
      
      // If app has been loading for over 15 seconds with no user activity for 10 seconds
      if (isLoading && inactiveTime > 10000) {
        console.warn("Detected inactive loading state for", inactiveTime, "ms");
        
        // If inactive and loading for too long, auto-reset
        if (inactiveTime > 15000) {
          console.warn("Auto-resetting after inactive loading state");
          resetState();
          toast({
            title: 'Session Reset',
            description: 'The app was automatically reset after detecting a stuck state',
          });
        }
      }
    }, 5000);
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
      clearInterval(checkInactiveLoading);
    };
  }, [isLoading, lastActivity]);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      if (!userId) return null;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
    };

    const getCurrentSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        // Auto-reset on critical errors
        if (error instanceof Error && error.message.includes('token')) {
          resetState();
        }
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentSession();

    // Set a timeout to prevent indefinite loading
    const loadingTimeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("Auth provider still loading after timeout, forcing state reset");
        resetState();
      }
    }, 15000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.info("Auth state changed:", event, newSession?.user?.id);
        
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          const profile = await fetchProfile(newSession.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false); // Ensure loading state is cleared on auth state change
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeoutId);
    };
  }, []);

  const signIn = async (provider: 'google' | 'apple' | 'twitter' | 'linkedin_oidc') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Authentication Error',
        description: error.message || 'Failed to sign in',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Sign in successful',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      toast({
        title: 'Authentication Error',
        description: error.message || 'Failed to sign in',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signUp = async (options: SignUpOptions) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: options.email,
        password: options.password,
        options: {
          data: options.options?.data,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: 'Registration successful',
        description: 'Please check your email for verification',
      });
    } catch (error: any) {
      toast({
        title: 'Registration Error',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Supabase sign out error:", error);
        throw error;
      }
      
      resetState();
      
      toast({
        title: 'Sign out successful',
        description: 'You have been signed out',
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: 'Sign out Error',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const resetState = () => {
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsLoading(false);
    
    localStorage.removeItem('supabase.auth.token');
    
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signIn,
        signInWithEmail,
        signUp,
        signOut,
        resetState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
