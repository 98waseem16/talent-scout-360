
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaApple, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { Loader2, LogIn, Mail, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Auth: React.FC = () => {
  const { signIn, signInWithEmail, signUp, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sign In states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up states
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [showManualAuth, setShowManualAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');
  
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

    if (!signUpEmail || !signUpPassword || !signUpConfirmPassword || !fullName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (signUpPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    try {
      await signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account",
      });
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
      <div className="max-w-md mx-auto">
        {showManualAuth ? (
          <Card>
            <CardHeader>
              <Tabs defaultValue={authMode} onValueChange={(v) => setAuthMode(v as 'signIn' | 'signUp')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signIn">Sign In</TabsTrigger>
                  <TabsTrigger value="signUp">Create Account</TabsTrigger>
                </TabsList>
              
                <TabsContent value="signIn" className="mt-4">
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </TabsContent>
                
                <TabsContent value="signUp" className="mt-4">
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Enter your details to create a new account</CardDescription>
                </TabsContent>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              {authMode === 'signIn' ? (
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
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
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
              )}
            </CardContent>
            
            <CardFooter>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowManualAuth(false)}
              >
                Back to options
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-medium text-center">Welcome to Launchly</CardTitle>
              <CardDescription className="text-center">
                Sign in or create an account to start your journey
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
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
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground text-center">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
};

export default Auth;
