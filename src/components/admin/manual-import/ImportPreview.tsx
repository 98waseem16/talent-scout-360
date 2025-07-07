
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Upload, Trash2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  selected: boolean;
  valid: boolean;
  errors: string[];
}

interface ImportPreviewProps {
  jobs: Job[];
  onToggleSelection: (jobId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRemoveJob: (jobId: string) => void;
  onImport: () => void;
  isImporting: boolean;
}

const ImportPreview: React.FC<ImportPreviewProps> = ({
  jobs,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onRemoveJob,
  onImport,
  isImporting
}) => {
  const validJobs = jobs.filter(job => job.valid);
  const invalidJobs = jobs.filter(job => !job.valid);
  const selectedValidJobs = jobs.filter(job => job.selected && job.valid);
  const selectedInvalidJobs = jobs.filter(job => job.selected && !job.valid);

  if (jobs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Import Preview ({jobs.length} jobs found)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              Select All Valid ({validJobs.length})
            </Button>
            <Button variant="outline" size="sm" onClick={onDeselectAll}>
              Deselect All
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Review the parsed jobs before importing them to your database
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{validJobs.length}</div>
            <div className="text-sm text-green-600">Valid Jobs</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">{invalidJobs.length}</div>
            <div className="text-sm text-red-600">Invalid Jobs</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{selectedValidJobs.length}</div>
            <div className="text-sm text-blue-600">Selected Valid</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((validJobs.length / jobs.length) * 100)}%
            </div>
            <div className="text-sm text-purple-600">Success Rate</div>
          </div>
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
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} className={!job.valid ? 'bg-red-50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={job.selected}
                      onCheckedChange={() => onToggleSelection(job.id)}
                      disabled={!job.valid}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">
                    {job.title}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{job.company}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {job.location || 'Remote'}
                  </TableCell>
                  <TableCell>
                    {job.valid ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Valid
                      </Badge>
                    ) : (
                      <div>
                        <Badge variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Invalid
                        </Badge>
                        {job.errors.length > 0 && (
                          <div className="text-xs text-red-600 mt-1 max-w-xs">
                            {job.errors.slice(0, 2).join(', ')}
                            {job.errors.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveJob(job.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Import Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedValidJobs.length} valid job(s) ready to import as drafts
            {selectedInvalidJobs.length > 0 && (
              <span className="text-red-600 ml-2">
                ({selectedInvalidJobs.length} invalid selected will be skipped)
              </span>
            )}
          </div>
          
          <Button 
            onClick={onImport}
            disabled={selectedValidJobs.length === 0 || isImporting}
            className="min-w-32"
          >
            {isImporting ? (
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
      </CardContent>
    </Card>
  );
};

export default ImportPreview;
