
import { supabase } from '@/integrations/supabase/client';
import { ToastActionElement } from '@/components/ui/toast';

interface ToastOptions {
  title?: string;
  description?: string;
  action?: ToastActionElement;
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

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: 'Registration Error',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async (): Promise<boolean> => {
    try {
      console.log('Signing out from authService...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      console.log('Sign out successful from authService');
      toast({
        title: 'Sign out successful',
        description: 'You have been signed out',
      });
      
      return true;
    } catch (error: any) {
      console.error('Sign out error caught:', error);
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
