import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import type { Job } from '@/lib/types/job.types';

interface QuickApplyFormProps {
  user: User | null;
  handleApply: () => void;
  job: Job;
}

const QuickApplyForm: React.FC<QuickApplyFormProps> = ({ user, handleApply, job }) => {
  const navigate = useNavigate();

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user && job.application_url) {
      window.open(job.application_url, '_blank');
      handleApply();
      return;
    }
    
    handleApply();
  };

  if (!user) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-4">Please sign in to apply for this job</p>
        <Link 
          to="/auth" 
          className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2.5 rounded-lg transition-colors inline-block"
        >
          Sign In to Apply
        </Link>
      </div>
    );
  }
  
  return (
    <form className="space-y-4" onSubmit={handleSubmitApplication}>
      {job.application_url ? (
        <div className="bg-secondary/30 p-4 rounded-lg mb-4">
          <p className="text-sm text-muted-foreground">
            When you submit this application, you will be redirected to the company's job application page.
          </p>
        </div>
      ) : null}
      
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
        {job.application_url ? "Continue to Application" : "Submit Application"}
      </button>
    </form>
  );
};

export default QuickApplyForm;
