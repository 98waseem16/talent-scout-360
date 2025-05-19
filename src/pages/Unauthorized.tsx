
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Unauthorized: React.FC = () => {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-destructive/10 rounded-full">
              <ShieldAlert className="w-12 h-12 text-destructive" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          
          <p className="text-muted-foreground mb-8">
            You don't have permission to access this page. This area is restricted to authorized administrators only.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default">
              <Link to="/">Return to Homepage</Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Unauthorized;
