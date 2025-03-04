
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { createAuthService, AuthService } from '@/services/authService';
import { useProfileFetch } from '@/hooks/useProfileFetch';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: AuthService['signIn'];
  signInWithEmail: AuthService['signInWithEmail'];
  signUp: AuthService['signUp'];
  signOut: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { fetchProfile } = useProfileFetch();
  const authService = createAuthService({ toast });

  // Check localStorage for cached user data on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('userData'); // Remove invalid data
      }
    }
  }, []);

  useEffect(() => {
    const getCurrentSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Store user data in localStorage
          localStorage.setItem('userData', JSON.stringify(session.user));
          
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id);
        
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          // Update localStorage when auth state changes
          localStorage.setItem('userData', JSON.stringify(newSession.user));
          
          const userProfile = await fetchProfile(newSession.user.id);
          setProfile(userProfile);
        } else {
          // Clear localStorage on sign out
          localStorage.removeItem('userData');
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const handleSignIn = async (provider: 'google' | 'apple' | 'twitter' | 'linkedin_oidc') => {
    setIsLoading(true);
    await authService.signIn(provider);
    setIsLoading(false);
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      return await authService.signInWithEmail(email, password);
    } catch (error) {
      // Error is already handled in the service
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      return await authService.signUp(email, password);
    } catch (error) {
      // Error is already handled in the service
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await authService.signOut();
      if (success) {
        // Forcibly clear state even if there was an error
        setSession(null);
        setUser(null);
        setProfile(null);
        
        // Ensure localStorage is cleared
        localStorage.removeItem('userData');
      }
      return success;
    } catch (error) {
      console.error('Error in handleSignOut:', error);
      return false;
    } finally {
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
        signIn: handleSignIn,
        signInWithEmail: handleSignInWithEmail,
        signUp: handleSignUp,
        signOut: handleSignOut,
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
