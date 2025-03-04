
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus } from 'lucide-react';

interface EmailAuthFormProps {
  activeTab: 'signin' | 'signup';
  setActiveTab: (tab: 'signin' | 'signup') => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  onSignIn: (e: React.FormEvent) => Promise<void>;
  onSignUp: (e: React.FormEvent) => Promise<void>;
  onBack: () => void;
}

const EmailAuthForm: React.FC<EmailAuthFormProps> = ({
  activeTab,
  setActiveTab,
  email,
  setEmail,
  password,
  setPassword,
  onSignIn,
  onSignUp,
  onBack,
}) => {
  return (
    <>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup" className="bg-primary/10 text-primary font-semibold">Create Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <form onSubmit={onSignIn} className="space-y-4">
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
          <p className="text-sm text-center mt-4 text-muted-foreground">
            Don't have an account?{" "}
            <button 
              type="button" 
              onClick={() => setActiveTab('signup')} 
              className="text-primary font-medium hover:underline"
            >
              Create one now
            </button>
          </p>
        </TabsContent>
        
        <TabsContent value="signup">
          <form onSubmit={onSignUp} className="space-y-4">
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
              className="w-full flex items-center justify-center gap-2 py-6 bg-primary hover:bg-primary/90"
            >
              <UserPlus className="h-5 w-5" />
              <span>Create Account</span>
            </Button>
          </form>
          <p className="text-sm text-center mt-4 text-muted-foreground">
            Already have an account?{" "}
            <button 
              type="button" 
              onClick={() => setActiveTab('signin')} 
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </TabsContent>
      </Tabs>
      
      <Button
        type="button"
        variant="ghost"
        className="w-full mt-6"
        onClick={onBack}
      >
        Back to options
      </Button>
    </>
  );
};

export default EmailAuthForm;
