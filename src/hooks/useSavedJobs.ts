
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SavedJob {
  id: string;
  savedAt: string;
}

export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const { toast } = useToast();

  // Load saved jobs from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      try {
        setSavedJobs(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing saved jobs:', error);
        localStorage.removeItem('savedJobs');
      }
    }
  }, []);

  // Save to localStorage whenever savedJobs changes
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  const saveJob = (jobId: string, jobTitle?: string) => {
    if (isSaved(jobId)) return;
    
    const newSavedJob: SavedJob = {
      id: jobId,
      savedAt: new Date().toISOString()
    };
    
    setSavedJobs(prev => [...prev, newSavedJob]);
    
    toast({
      title: "Job Saved!",
      description: jobTitle ? `${jobTitle} has been saved to your list` : "Job has been saved to your list",
      duration: 2000,
    });
  };

  const unsaveJob = (jobId: string, jobTitle?: string) => {
    setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    
    toast({
      title: "Job Removed",
      description: jobTitle ? `${jobTitle} has been removed from your saved jobs` : "Job has been removed from your saved jobs",
      duration: 2000,
    });
  };

  const isSaved = (jobId: string) => {
    return savedJobs.some(job => job.id === jobId);
  };

  const getSavedJobs = () => {
    return savedJobs;
  };

  const toggleSave = (jobId: string, jobTitle?: string) => {
    if (isSaved(jobId)) {
      unsaveJob(jobId, jobTitle);
    } else {
      saveJob(jobId, jobTitle);
    }
  };

  return {
    savedJobs,
    saveJob,
    unsaveJob,
    isSaved,
    getSavedJobs,
    toggleSave
  };
};
