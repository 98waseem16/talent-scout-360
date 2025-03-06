
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

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
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        // Ensure loading state is set to false regardless of success or error
        setIsLoading(false);
      }
    };

    getCurrentSession();

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
        
        // Ensure loading state is updated after auth state changes
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (provider: 'google' | 'apple' | 'twitter' | 'linkedin_oidc') => {
    try {
      setIsLoading(true);
      // Get the return URL from localStorage if it exists
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
      setIsLoading(false);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success('Sign in successful');
    } catch (error: any) {
      toast.error('Authentication Error: ' + (error.message || 'Failed to sign in'));
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (options: SignUpOptions) => {
    try {
      setIsLoading(true);
      // Get the return URL from localStorage if it exists
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
      setIsLoading(false);
      throw error;
    } finally {
      // Set loading to false after signup completes or fails
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Supabase sign out error:", error);
        throw error;
      }
      
      // Forcibly clear state
      setSession(null);
      setUser(null);
      setProfile(null);
      
      toast.success('Sign out successful');
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error('Sign out Error: ' + (error.message || 'Failed to sign out'));
      throw error;
    } finally {
      // Ensure loading state is reset after sign out attempt
      setIsLoading(false);
    }
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
