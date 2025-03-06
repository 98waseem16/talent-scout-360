
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobForm from '@/components/job-posting/JobForm';

const PostJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
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
  }, [user, navigate]);

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
