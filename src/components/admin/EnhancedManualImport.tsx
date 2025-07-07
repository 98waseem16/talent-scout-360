
import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createJob } from '@/lib/jobs/operations/manageJobs';
import { Progress } from '@/components/ui/progress';
import EnhancedImportUI from './manual-import/EnhancedImportUI';
import ImportPreview from './manual-import/ImportPreview';

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  url?: string;
  type?: string;
  department?: string;
  salary?: string;
  seniority_level?: string;
  remote_onsite?: string;
  equity?: string;
  visa_sponsorship?: boolean;
  selected: boolean;
  valid: boolean;
  errors: string[];
}

const EnhancedManualImport: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processedJobs, setProcessedJobs] = useState<Job[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const validateJob = useCallback((job: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!job.title || job.title.trim() === '') {
      errors.push('Title is required');
    }
    if (!job.company || job.company.trim() === '') {
      errors.push('Company is required');
    }
    if (!job.description || job.description.trim() === '') {
      errors.push('Description is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }, []);

  const handleJobsParsed = useCallback((jobs: any[]) => {
    console.log('Processing parsed jobs:', jobs.length);
    
    const processed: Job[] = jobs.map((job, index) => {
      const validation = validateJob(job);
      return {
        id: `job-${index}-${Date.now()}`,
        title: job.title || '',
        company: job.company || '',
        location: job.location,
        description: job.description,
        responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        benefits: Array.isArray(job.benefits) ? job.benefits : [],
        url: job.url,
        type: job.type,
        department: job.department,
        salary: job.salary,
        seniority_level: job.seniority_level,
        remote_onsite: job.remote_onsite,
        equity: job.equity,
        visa_sponsorship: job.visa_sponsorship,
        selected: validation.valid, // Auto-select valid jobs
        ...validation
      };
    });

    setProcessedJobs(processed);
    
    toast({
      title: "Parse Complete",
      description: `Found ${processed.length} jobs (${processed.filter(j => j.valid).length} valid)`,
    });
  }, [validateJob, toast]);

  const handleError = useCallback((error: string) => {
    toast({
      title: "Parse Error",
      description: error,
      variant: "destructive"
    });
  }, [toast]);

  const toggleJobSelection = useCallback((jobId: string) => {
    setProcessedJobs(prev => 
      prev.map(job => 
        job.id === jobId ? { ...job, selected: !job.selected } : job
      )
    );
  }, []);

  const selectAllValid = useCallback(() => {
    setProcessedJobs(prev => 
      prev.map(job => ({ ...job, selected: job.valid }))
    );
  }, []);

  const deselectAll = useCallback(() => {
    setProcessedJobs(prev => 
      prev.map(job => ({ ...job, selected: false }))
    );
  }, []);

  const removeJob = useCallback((jobId: string) => {
    setProcessedJobs(prev => prev.filter(job => job.id !== jobId));
  }, []);

  const transformJobForCreation = useCallback((job: Job) => {
    return {
      title: job.title,
      company: job.company,
      location: job.location || 'Remote',
      type: job.type || 'Full-time',
      salary: job.salary || 'Competitive',
      description: job.description || '',
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      logo: '',
      featured: false,
      application_url: job.url || '',
      user_id: user?.id,
      department: job.department,
      seniority_level: job.seniority_level,
      remote_onsite: job.remote_onsite,
      equity: job.equity,
      visa_sponsorship: job.visa_sponsorship,
      is_draft: true,
      source_url: job.url
    };
  }, [user?.id]);

  const handleImport = useCallback(async () => {
    const selectedJobs = processedJobs.filter(job => job.selected && job.valid);
    
    if (selectedJobs.length === 0) {
      toast({
        title: "No Jobs Selected",
        description: "Please select at least one valid job to import.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedJobs.length; i++) {
      const job = selectedJobs[i];
      try {
        const jobData = transformJobForCreation(job);
        const result = await createJob(jobData);
        
        if (result.success) {
          successCount++;
          console.log(`✅ Successfully created job: ${job.title} at ${job.company}`);
        } else {
          errorCount++;
          errors.push(`${job.title} at ${job.company}: ${result.error}`);
          console.error(`❌ Failed to create job: ${job.title}`, result.error);
        }
      } catch (error) {
        errorCount++;
        errors.push(`${job.title} at ${job.company}: ${(error as Error).message}`);
        console.error(`❌ Exception creating job: ${job.title}`, error);
      }
      
      setImportProgress(((i + 1) / selectedJobs.length) * 100);
    }

    setIsImporting(false);

    // Show results
    if (successCount > 0) {
      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} job(s) as drafts. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
      });
    }

    if (errorCount > 0) {
      console.error('Import errors:', errors);
      toast({
        title: "Some Imports Failed",
        description: `${errorCount} job(s) failed to import. Check console for details.`,
        variant: "destructive"
      });
    }

    // Reset form after successful import
    if (successCount > 0) {
      setProcessedJobs([]);
    }
  }, [processedJobs, transformJobForCreation, toast]);

  return (
    <div className="space-y-6">
      <EnhancedImportUI 
        onJobsParsed={handleJobsParsed}
        onError={handleError}
      />
      
      {processedJobs.length > 0 && (
        <ImportPreview
          jobs={processedJobs}
          onToggleSelection={toggleJobSelection}
          onSelectAll={selectAllValid}
          onDeselectAll={deselectAll}
          onRemoveJob={removeJob}
          onImport={handleImport}
          isImporting={isImporting}
        />
      )}

      {/* Import Progress */}
      {isImporting && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Importing jobs...</span>
            <span>{Math.round(importProgress)}%</span>
          </div>
          <Progress value={importProgress} className="w-full" />
        </div>
      )}
    </div>
  );
};

export default EnhancedManualImport;
