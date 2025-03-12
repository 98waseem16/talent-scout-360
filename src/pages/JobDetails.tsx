
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJobById } from '@/lib/jobs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
  
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id || ''),
    enabled: !!id
  });

  // Enhanced logging to verify job data
  useEffect(() => {
    if (job) {
      console.log('JobDetails page - job data loaded:', job);
    } else {
      console.log('JobDetails page - no job data available yet');
    }
  }, [job]);

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
        <main className="min-h-screen pt-32 pb-16 px-6 flex justify-center">
          <div className="max-w-4xl w-full">
            <LoadingState />
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  // Error state - improved error handling
  if (error || !job) {
    console.error('Error or no job data:', error);
    return (
      <>
        <Header />
        <main className="min-h-screen pt-32 pb-16 px-6">
          <div className="max-w-3xl mx-auto">
            <ErrorState />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Ensure application_url is defined
  const jobWithUrl = {
    ...job,
    application_url: job.application_url || ''
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Job Header with title, company, location, etc. */}
          <JobHeader job={jobWithUrl} handleApply={handleApply} />
          
          {/* Main Content Area */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* Job Description with responsibilities, requirements, and benefits */}
              <JobDescription job={jobWithUrl} />
              
              {/* Application Form */}
              <section className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-medium mb-4">Quick Apply</h2>
                <QuickApplyForm user={user} handleApply={handleApply} job={jobWithUrl} />
              </section>
            </div>
            
            {/* Sidebar with company info and job insights */}
            <div className="space-y-6">
              <CompanyInfo job={jobWithUrl} />
              <JobInsights job={jobWithUrl} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default JobDetails;
