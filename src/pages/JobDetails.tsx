
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, MapPin, DollarSign, Clock, ArrowLeft, Share2, Bookmark, Loader2 } from 'lucide-react';
import { getJobById } from '@/lib/jobs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
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
    } else {
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully!"
      });
    }
  };
  
  if (isLoading) {
    return (
      <main className="min-h-screen pt-32 pb-16 px-6 flex justify-center">
        <div className="max-w-4xl w-full flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading job details...</p>
        </div>
      </main>
    );
  }
  
  if (error || !job) {
    return (
      <main className="min-h-screen pt-32 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-medium mb-4">Job Not Found</h1>
          <p className="text-muted-foreground mb-8">The job listing you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/jobs" 
            className="inline-flex items-center text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all jobs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link 
          to="/jobs" 
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all jobs
        </Link>
        
        {/* Job Header */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="h-16 w-16 flex-shrink-0 rounded-md bg-secondary/50 flex items-center justify-center overflow-hidden">
              <img src={job.logo} alt={`${job.company} logo`} className="h-10 w-10 object-contain" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-medium mb-1">{job.title}</h1>
                  <p className="text-lg text-muted-foreground mb-4">{job.company}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="mr-1 h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="mr-1 h-4 w-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>Posted {job.posted}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="p-2 rounded-full hover:bg-secondary transition-colors" title="Save Job">
                    <Bookmark className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-secondary transition-colors" title="Share Job">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleApply}
                  className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2.5 rounded-lg transition-colors active:scale-[0.98]"
                >
                  Apply Now
                </button>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(job.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary hover:bg-secondary/80 text-foreground font-medium px-6 py-2.5 rounded-lg transition-colors text-center"
                >
                  View Location
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Job Content */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-medium mb-4">Job Description</h2>
              <p className="text-muted-foreground mb-6">{job.description}</p>
              
              <h3 className="text-lg font-medium mb-3">Responsibilities</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-6">
                {job.responsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-medium mb-3">Requirements</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-6">
                {job.requirements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-medium mb-3">Benefits</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                {job.benefits.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
            
            {/* Application Form */}
            <section className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-medium mb-4">Quick Apply</h2>
              {!user ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Please sign in to apply for this job</p>
                  <Link 
                    to="/auth" 
                    className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2.5 rounded-lg transition-colors inline-block"
                  >
                    Sign In to Apply
                  </Link>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleApply(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Your full name"
                        defaultValue={user.user_metadata?.full_name || ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Your email address"
                        value={user.email || ''}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="resume" className="block text-sm font-medium mb-1">Resume</label>
                    <div className="border border-dashed border-input rounded-lg p-4 text-center">
                      <p className="text-muted-foreground mb-2">Upload your resume (PDF, DOCX)</p>
                      <input
                        type="file"
                        id="resume"
                        className="hidden"
                        accept=".pdf,.docx"
                      />
                      <label
                        htmlFor="resume"
                        className="inline-block bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        Select File
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium mb-1">Cover Letter (Optional)</label>
                    <textarea
                      id="coverLetter"
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Why are you a good fit for this role?"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-6 rounded-lg transition-colors active:scale-[0.98]"
                  >
                    Submit Application
                  </button>
                </form>
              )}
            </section>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-border shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">About the Company</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-md bg-secondary/50 flex items-center justify-center overflow-hidden">
                  <img src={job.logo} alt={`${job.company} logo`} className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h3 className="font-medium">{job.company}</h3>
                  <a href="#" className="text-sm text-primary hover:underline">View Company Profile</a>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {job.company} is a leading company in the technology sector, focusing on innovation and user experience. 
                With a team of talented professionals, we're dedicated to creating solutions that make a difference.
              </p>
            </section>
            
            <section className="bg-white rounded-xl border border-border shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Job Insights</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Experience Level</h3>
                  <p className="text-sm text-muted-foreground">
                    Mid-Senior Level
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Industry</h3>
                  <p className="text-sm text-muted-foreground">
                    Technology, Software Development
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Seniority Level</h3>
                  <p className="text-sm text-muted-foreground">
                    Mid-Senior Level
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Employment Type</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.type}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default JobDetails;
