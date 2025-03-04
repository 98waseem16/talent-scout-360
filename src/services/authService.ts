
import { supabase } from '@/integrations/supabase/client';
import { ToastAction as ToastActionType } from '@/components/ui/toast';

interface ToastOptions {
  title?: string;
  description?: string;
  action?: typeof ToastActionType;
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

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: 'Sign out successful',
        description: 'You have been signed out',
      });
    } catch (error: any) {
      toast({
        title: 'Sign out Error',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
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
