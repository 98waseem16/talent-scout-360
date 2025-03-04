
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaApple, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

const Auth: React.FC = () => {
  const { signIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to home if user is already logged in
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleSignIn = async (provider: 'google' | 'apple' | 'twitter' | 'linkedin_oidc') => {
    await signIn(provider);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-md mx-auto bg-white rounded-xl border border-border shadow-sm p-8">
        <h1 className="text-2xl font-medium mb-6 text-center">Sign In</h1>
        
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={() => handleSignIn('google')}
          >
            <FaGoogle className="h-5 w-5" />
            <span>Continue with Google</span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={() => handleSignIn('apple')}
          >
            <FaApple className="h-5 w-5" />
            <span>Continue with Apple</span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={() => handleSignIn('linkedin_oidc')}
          >
            <FaLinkedin className="h-5 w-5" />
            <span>Continue with LinkedIn</span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={() => handleSignIn('twitter')}
          >
            <FaTwitter className="h-5 w-5" />
            <span>Continue with Twitter</span>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-6 text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
};

export default Auth;
