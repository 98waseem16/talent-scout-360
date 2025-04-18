
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJobById } from '@/lib/jobs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from "@/hooks/use-mobile";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Import components
import JobHeader from '@/components/job-details/JobHeader';
import JobDescription from '@/components/job-details/JobDescription';
import QuickApplyForm from '@/components/job-details/QuickApplyForm';
import CompanyInfo from '@/components/job-details/CompanyInfo';
import JobInsights from '@/components/job-details/JobInsights';
import LoadingState from '@/components/job-details/LoadingState';
import ErrorState from '@/components/job-details/ErrorState';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id || ''),
    enabled: !!id
  });

  const handleApply = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply for this job",
        variant: "destructive"
      });
    } else if (job && job.application_url) {
      // If user is logged in, redirect to the application URL
      window.open(job.application_url, '_blank');
      toast({
        title: "Redirecting to application",
        description: "You are being redirected to the job application page"
      });
    } else {
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully!"
      });
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 sm:pt-32 pb-16 px-4 sm:px-6 flex justify-center">
          <div className="w-full max-w-4xl">
            <LoadingState />
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  // Error state - improved error handling
  if (error || !job) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 sm:pt-32 pb-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <ErrorState />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Ensure application_url and expires_at are defined
  const jobWithUrl = {
    ...job,
    application_url: job.application_url || '',
    expires_at: job.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Job Header with title, company, location, etc. */}
          <JobHeader job={jobWithUrl} handleApply={handleApply} />
          
          {/* Main Content Area - Stacked on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Job description takes full width on mobile, 2/3 on desktop */}
            <div className="md:col-span-2 space-y-6">
              {/* Job Description with responsibilities, requirements, and benefits */}
              <JobDescription job={jobWithUrl} />
              
              {/* Application Form */}
              <section className="bg-white rounded-xl border border-border shadow-sm p-5 sm:p-6 md:p-8">
                <h2 className="text-xl font-medium mb-4">Quick Apply</h2>
                <QuickApplyForm user={user} handleApply={handleApply} job={jobWithUrl} />
              </section>
            </div>
            
            {/* Sidebar - Layout adjustments for mobile */}
            <div className="space-y-6 order-first md:order-last">
              {/* On mobile, display as horizontal cards initially */}
              {isMobile && (
                <div className="flex flex-col sm:flex-row gap-6 mb-6 sm:mb-0">
                  <div className="w-full sm:w-1/2">
                    <CompanyInfo job={jobWithUrl} />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <JobInsights job={jobWithUrl} />
                  </div>
                </div>
              )}
              
              {/* On desktop, display vertically */}
              {!isMobile && (
                <>
                  <CompanyInfo job={jobWithUrl} />
                  <JobInsights job={jobWithUrl} />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default JobDetails;
