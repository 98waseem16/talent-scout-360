
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Upload, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createJob } from '@/lib/jobs/operations/manageJobs';
import { useAuth } from '@/contexts/AuthContext';

interface GobiJob {
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
}

interface GobiOutput {
  jobs: GobiJob[];
}

interface ProcessedJob extends GobiJob {
  id: string;
  selected: boolean;
  valid: boolean;
  errors: string[];
}

const ManualGobiProcessor: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState('');
  const [processedJobs, setProcessedJobs] = useState<ProcessedJob[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateAndParseJson = (input: string): GobiOutput | null => {
    try {
      const parsed = JSON.parse(input);
      
      if (!parsed || typeof parsed !== 'object') {
        setValidationError('Invalid JSON format');
        return null;
      }

      if (!Array.isArray(parsed.jobs)) {
        setValidationError('JSON must contain a "jobs" array');
        return null;
      }

      if (parsed.jobs.length === 0) {
        setValidationError('No jobs found in the JSON');
        return null;
      }

      setValidationError(null);
      return parsed as GobiOutput;
    } catch (error) {
      setValidationError('Invalid JSON syntax: ' + (error as Error).message);
      return null;
    }
  };

  const validateJob = (job: GobiJob): { valid: boolean; errors: string[] } => {
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
  };

  const transformGobiJobToJobData = (gobiJob: GobiJob) => {
    return {
      title: gobiJob.title || '',
      company: gobiJob.company || '',
      location: gobiJob.location || 'Remote',
      type: gobiJob.type || 'Full-time',
      salary: gobiJob.salary || 'Competitive',
      description: gobiJob.description || '',
      responsibilities: Array.isArray(gobiJob.responsibilities) ? gobiJob.responsibilities : [],
      requirements: Array.isArray(gobiJob.requirements) ? gobiJob.requirements : [],
      benefits: Array.isArray(gobiJob.benefits) ? gobiJob.benefits : [],
      logo: '', // Will be empty for manual imports
      featured: false,
      application_url: gobiJob.url || '',
      user_id: user?.id,
      department: gobiJob.department,
      seniority_level: gobiJob.seniority_level,
      remote_onsite: gobiJob.remote_onsite,
      equity: gobiJob.equity,
      visa_sponsorship: gobiJob.visa_sponsorship,
      is_draft: true, // Always create as draft for manual review
      source_url: gobiJob.url
    };
  };

  const handleParseJson = () => {
    const parsed = validateAndParseJson(jsonInput);
    if (!parsed) return;

    const processed: ProcessedJob[] = parsed.jobs.map((job, index) => {
      const validation = validateJob(job);
      return {
        ...job,
        id: `job-${index}`,
        selected: validation.valid, // Auto-select valid jobs
        ...validation
      };
    });

    setProcessedJobs(processed);
    setShowPreview(true);
  };

  const toggleJobSelection = (jobId: string) => {
    setProcessedJobs(prev => 
      prev.map(job => 
        job.id === jobId ? { ...job, selected: !job.selected } : job
      )
    );
  };

  const selectAllValid = () => {
    setProcessedJobs(prev => 
      prev.map(job => ({ ...job, selected: job.valid }))
    );
  };

  const deselectAll = () => {
    setProcessedJobs(prev => 
      prev.map(job => ({ ...job, selected: false }))
    );
  };

  const handleImportJobs = async () => {
    const selectedJobs = processedJobs.filter(job => job.selected && job.valid);
    
    if (selectedJobs.length === 0) {
      toast({
        title: "No Jobs Selected",
        description: "Please select at least one valid job to import.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedJobs.length; i++) {
      const job = selectedJobs[i];
      try {
        const jobData = transformGobiJobToJobData(job);
        const result = await createJob(jobData);
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          errors.push(`${job.title} at ${job.company}: ${result.error}`);
        }
      } catch (error) {
        errorCount++;
        errors.push(`${job.title} at ${job.company}: ${(error as Error).message}`);
      }
      
      setProcessingProgress(((i + 1) / selectedJobs.length) * 100);
    }

    setIsProcessing(false);

    // Show results
    if (successCount > 0) {
      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} job(s) as drafts. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
      });
    }

    if (errorCount > 0 && errors.length > 0) {
      console.error('Import errors:', errors);
      toast({
        title: "Some Imports Failed",
        description: `${errorCount} job(s) failed to import. Check console for details.`,
        variant: "destructive"
      });
    }

    // Reset form after successful import
    if (successCount > 0) {
      setJsonInput('');
      setProcessedJobs([]);
      setShowPreview(false);
    }
  };

  const selectedValidJobs = processedJobs.filter(job => job.selected && job.valid);
  const selectedInvalidJobs = processedJobs.filter(job => job.selected && !job.valid);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Upload className="w-5 h-5 text-green-500" />
          </div>
          Manual Gobi Output Import
        </CardTitle>
        <CardDescription>
          Paste Gobi's JSON output to manually create draft jobs when automated processing fails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* JSON Input Section */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Paste Gobi JSON Output
            </label>
            <Textarea
              placeholder='Paste JSON here, e.g. {"jobs": [{"title": "Software Engineer", "company": "Example Corp", ...}]}'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleParseJson}
              disabled={!jsonInput.trim() || isProcessing}
            >
              {showPreview ? <Eye className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              Parse & Preview Jobs
            </Button>
            
            {showPreview && (
              <Button 
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setProcessedJobs([]);
                  setValidationError(null);
                }}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Preview
              </Button>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && processedJobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Job Preview ({processedJobs.length} found)</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllValid}>
                  Select All Valid ({processedJobs.filter(j => j.valid).length})
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">
                  {processedJobs.filter(j => j.valid).length}
                </div>
                <div className="text-sm text-green-600">Valid Jobs</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-600">
                  {processedJobs.filter(j => !j.valid).length}
                </div>
                <div className="text-sm text-red-600">Invalid Jobs</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedValidJobs.length}
                </div>
                <div className="text-sm text-blue-600">Selected to Import</div>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Checkbox
                          checked={job.selected}
                          onCheckedChange={() => toggleJobSelection(job.id)}
                          disabled={!job.valid}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{job.location || 'Remote'}</TableCell>
                      <TableCell>
                        {job.valid ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Invalid
                          </Badge>
                        )}
                        {!job.valid && job.errors.length > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {job.errors.join(', ')}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Warnings */}
            {selectedInvalidJobs.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {selectedInvalidJobs.length} selected job(s) have validation errors and won't be imported.
                </AlertDescription>
              </Alert>
            )}

            {/* Import Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedValidJobs.length} valid job(s) ready to import as drafts
              </div>
              
              <Button 
                onClick={handleImportJobs}
                disabled={selectedValidJobs.length === 0 || isProcessing}
                className="min-w-32"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {selectedValidJobs.length} Job(s)
                  </>
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing jobs...</span>
                  <span>{Math.round(processingProgress)}%</span>
                </div>
                <Progress value={processingProgress} className="w-full" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManualGobiProcessor;
