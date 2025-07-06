
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cleanupAuthState, validateSession, forceAuthRefresh } from '@/lib/auth-utils';

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
  recoverSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchProfile = useCallback(async (userId: string) => {
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
  }, []);

  // Session recovery function
  const recoverSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log('Attempting session recovery...');
      
      const isValid = await validateSession();
      if (isValid) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Defer profile fetching
          setTimeout(async () => {
            const profileData = await fetchProfile(currentSession.user.id);
            setProfile(profileData);
          }, 0);
          
          return true;
        }
      }
      
      // If validation fails, try force refresh
      const refreshedSession = await forceAuthRefresh();
      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        
        setTimeout(async () => {
          const profileData = await fetchProfile(refreshedSession.user.id);
          setProfile(profileData);
        }, 0);
        
        queryClient.clear();
        return true;
      }
      
      // Complete cleanup
      setSession(null);
      setUser(null);
      setProfile(null);
      queryClient.clear();
      
      return false;
    } catch (error) {
      console.error('Session recovery failed:', error);
      setSession(null);
      setUser(null);
      setProfile(null);
      return false;
    }
  }, [fetchProfile, queryClient]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state changed:', event, newSession?.user?.id);
            
            if (!mounted) return;
            
            // Update state synchronously
            setSession(newSession);
            setUser(newSession?.user || null);
            
            // Handle different auth events
            if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
              setProfile(null);
              queryClient.clear();
            }
            
            // Defer profile fetching to prevent deadlocks
            if (newSession?.user) {
              setTimeout(async () => {
                if (mounted) {
                  const profileData = await fetchProfile(newSession.user.id);
                  setProfile(profileData);
                }
              }, 0);
            } else {
              setProfile(null);
            }
          }
        );
        
        // Then get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          await recoverSession();
        } else if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Defer profile fetching
          setTimeout(async () => {
            if (mounted) {
              const profileData = await fetchProfile(currentSession.user.id);
              setProfile(profileData);
            }
          }, 0);
        }
        
        setIsLoading(false);
        
        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
          await recoverSession();
        }
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      mounted = false;
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [fetchProfile, recoverSession, queryClient]);

  const signIn = async (provider: 'google' | 'apple' | 'twitter' | 'linkedin_oidc') => {
    try {
      // Clean up before signing in
      cleanupAuthState();
      
      const returnTo = localStorage.getItem('authReturnPath') || `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error('Authentication Error: ' + (error.message || 'Failed to sign in'));
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      // Clean up before signing in
      cleanupAuthState();
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success('Sign in successful');
    } catch (error: any) {
      toast.error('Authentication Error: ' + (error.message || 'Failed to sign in'));
      throw error;
    }
  };

  const signUp = async (options: SignUpOptions) => {
    try {
      // Clean up before signing up
      cleanupAuthState();
      
      const returnTo = localStorage.getItem('authReturnPath') || `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        email: options.email,
        password: options.password,
        options: {
          data: options.options?.data,
          emailRedirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
        },
      });
      
      if (error) throw error;
      
      toast.success('Registration successful! Please check your email for verification');
    } catch (error: any) {
      toast.error('Registration Error: ' + (error.message || 'Failed to create account'));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clean up first
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Supabase sign out error:', error);
      }
      
      // Force state cleanup
      setSession(null);
      setUser(null);
      setProfile(null);
      queryClient.clear();
      
      toast.success('Sign out successful');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Sign out Error: ' + (error.message || 'Failed to sign out'));
      throw error;
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signInWithEmail,
    signUp,
    signOut,
    recoverSession,
  };

  return (
    <AuthContext.Provider value={value}>
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
