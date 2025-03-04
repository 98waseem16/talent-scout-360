
import React from 'react';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaApple, FaTwitter, FaLinkedin } from 'react-icons/fa';

interface OAuthProvidersProps {
  onSignIn: (provider: 'google' | 'apple' | 'twitter' | 'linkedin_oidc') => Promise<void>;
  onShowEmailAuth: (tab: 'signin' | 'signup') => void;
}

const OAuthProviders: React.FC<OAuthProvidersProps> = ({ onSignIn, onShowEmailAuth }) => {
  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 py-6"
        onClick={() => onSignIn('google')}
      >
        <FaGoogle className="h-5 w-5" />
        <span>Continue with Google</span>
      </Button>
      
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 py-6"
        onClick={() => onSignIn('apple')}
      >
        <FaApple className="h-5 w-5" />
        <span>Continue with Apple</span>
      </Button>
      
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 py-6"
        onClick={() => onSignIn('linkedin_oidc')}
      >
        <FaLinkedin className="h-5 w-5" />
        <span>Continue with LinkedIn</span>
      </Button>
      
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 py-6"
        onClick={() => onSignIn('twitter')}
      >
        <FaTwitter className="h-5 w-5" />
        <span>Continue with Twitter</span>
      </Button>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 py-6"
        onClick={() => onShowEmailAuth('signin')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
        <span>Email & Password Sign In</span>
      </Button>
    </div>
  );
};

export default OAuthProviders;
