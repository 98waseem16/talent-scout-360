
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaApple, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { Loader2, LogIn, Mail, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Auth: React.FC = () => {
  const { signIn, signInWithEmail, signUp, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showManualAuth, setShowManualAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
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
        {showManualAuth ? (
          <>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleManualSignIn} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-6"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-6"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Create Account</span>
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full mt-6"
              onClick={() => {
                setShowManualAuth(false);
                setEmail('');
                setPassword('');
              }}
            >
              Back to options
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-medium mb-6 text-center">Sign In or Create Account</h1>
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

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-6"
                onClick={() => setShowManualAuth(true)}
              >
                <Mail className="h-5 w-5" />
                <span>Email & Password</span>
              </Button>
            </div>
            
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
