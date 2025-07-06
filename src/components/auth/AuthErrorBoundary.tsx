
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cleanupAuthState } from '@/lib/auth-utils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    // Clean up auth state and reload
    cleanupAuthState();
    window.location.reload();
  };

  handleGoToAuth = () => {
    cleanupAuthState();
    window.location.href = '/auth';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <CardTitle>Authentication Error</CardTitle>
              <CardDescription>
                Something went wrong with your session. This usually happens after app updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={this.handleReset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh App
              </Button>
              <Button variant="outline" onClick={this.handleGoToAuth} className="w-full">
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
