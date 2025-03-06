
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobForm from '@/components/job-posting/JobForm';
import { Loader2 } from 'lucide-react';

const PostJob: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);
      if (!user) {
        // Store the current path for redirection after login
        navigate('/auth', { 
          state: { returnTo: window.location.pathname } 
        });
        
        // Show error toast
        toast.error("Authentication Required", {
          description: "You need to sign in to post a job"
        });
      }
    }
  }, [user, navigate, isLoading]);

  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If auth check is complete and user is still null, don't render the form
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <JobForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PostJob;
