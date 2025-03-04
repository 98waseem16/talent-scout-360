
import { supabase } from '@/integrations/supabase/client';
import { ToastAction } from '@/components/ui/toast';

interface ToastOptions {
  title?: string;
  description?: string;
  action?: ToastAction;
  variant?: 'default' | 'destructive';
}

interface AuthServiceProps {
  toast: (options: ToastOptions) => void;
}

export const createAuthService = ({ toast }: AuthServiceProps) => {
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
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Store the user data in localStorage
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
      }
      
      toast({
        title: 'Sign in successful',
        description: 'Welcome back!',
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Authentication Error',
        description: error.message || 'Failed to sign in',
        variant: 'destructive',
      });
      return false;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      // Store the user data in localStorage if auto sign-in happens
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
      }
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Registration Error',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
      return false;
    }
  };

  const signOut = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Remove user data from localStorage
      localStorage.removeItem('userData');
      
      toast({
        title: 'Sign out successful',
        description: 'You have been signed out',
      });
      
      return true;
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign out Error',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    signIn,
    signInWithEmail,
    signUp,
    signOut
  };
};

export type AuthService = ReturnType<typeof createAuthService>;
