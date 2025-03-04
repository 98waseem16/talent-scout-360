
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OAuthProviders from '@/components/auth/OAuthProviders';
import EmailAuthForm from '@/components/auth/EmailAuthForm';
import AuthLoader from '@/components/auth/AuthLoader';

const Auth: React.FC = () => {
  const { signIn, signInWithEmail, signUp, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showManualAuth, setShowManualAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signup'); // Default to signup for new users
  
  useEffect(() => {
    // Redirect to home if user is already logged in
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleSignIn = async (provider: 'google' | 'apple' | 'twitter' | 'linkedin_oidc') => {
    await signIn(provider);
  };

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to sign in",
        variant: "destructive"
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await signUp(email, password);
      toast({
        title: "Account Created",
        description: "Your account has been created successfully. You can now sign in.",
      });
      setActiveTab('signin');
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    }
  };

  const handleShowEmailAuth = (tab: 'signin' | 'signup') => {
    setShowManualAuth(true);
    setActiveTab(tab);
  };

  const handleBackToOptions = () => {
    setShowManualAuth(false);
    setEmail('');
    setPassword('');
  };

  if (isLoading) {
    return <AuthLoader />;
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-md mx-auto bg-white rounded-xl border border-border shadow-sm p-8">
        {showManualAuth ? (
          <EmailAuthForm 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSignIn={handleManualSignIn}
            onSignUp={handleSignUp}
            onBack={handleBackToOptions}
          />
        ) : (
          <>
            <h1 className="text-2xl font-medium mb-6 text-center">Sign In or Create Account</h1>
            
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 rounded-lg p-2 inline-block">
                <Button 
                  onClick={() => handleShowEmailAuth('signup')}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 animate-pulse hover:animate-none"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Create New Account</span>
                </Button>
              </div>
            </div>
            
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">or continue with</span>
              </div>
            </div>
            
            <OAuthProviders 
              onSignIn={handleSignIn}
              onShowEmailAuth={handleShowEmailAuth}
            />
            
            <p className="text-sm text-muted-foreground mt-6 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </>
        )}
      </div>
    </main>
  );
};

export default Auth;
