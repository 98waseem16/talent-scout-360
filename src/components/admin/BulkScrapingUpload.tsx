
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useScrapingBatches } from '@/hooks/useScrapingBatches';
import { toast } from 'sonner';

const BulkScrapingUpload: React.FC = () => {
  const [urlsText, setUrlsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { batches, loading, createBatch } = useScrapingBatches();

  const parseUrls = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => {
        try {
          new URL(line);
          return true;
        } catch {
          return false;
        }
      });
  };

  const handleBulkSubmit = async () => {
    const urls = parseUrls(urlsText);
    
    if (urls.length === 0) {
      toast.error('Please enter at least one valid URL');
      return;
    }

    if (urls.length > 50) {
      toast.error('Maximum 50 URLs allowed per batch');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createBatch(urls);
      
      if (result.success) {
        toast.success(`Batch created successfully! ${result.jobsCreated} scraping jobs queued.`);
        setUrlsText('');
      } else {
        toast.error(`Failed to create batch: ${result.error}`);
      }
    } catch (error) {
      console.error('Bulk submission error:', error);
      toast.error('Failed to submit bulk scraping request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary',
      pending: 'outline',
      cancelled: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const validUrls = parseUrls(urlsText);
  const totalLines = urlsText.split('\n').filter(line => line.trim()).length;
  const invalidUrls = totalLines - validUrls.length;

  return (
    <div className="space-y-6">
      {/* Bulk Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Career Page Upload
          </CardTitle>
          <CardDescription>
            Submit multiple career page URLs at once. Jobs will be processed in the background queue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-urls">Career Page URLs (one per line, max 50)</Label>
            <Textarea
              id="bulk-urls"
              placeholder={`https://jobs.lever.co/company1
https://company2.com/careers
https://apply.workable.com/company3
...`}
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              disabled={isSubmitting}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {urlsText.trim() && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center gap-4">
                  <span className="text-green-600 font-medium">
                    {validUrls.length} valid URLs
                  </span>
                  {invalidUrls > 0 && (
                    <span className="text-red-600 font-medium">
                      {invalidUrls} invalid URLs (will be skipped)
                    </span>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleBulkSubmit} 
            disabled={isSubmitting || validUrls.length === 0 || validUrls.length > 50}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Batch...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit {validUrls.length} URLs for Scraping
              </>
            )}
          </Button>

          {validUrls.length > 50 && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Maximum 50 URLs allowed per batch. Please split your URLs into smaller batches.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Batch History */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Scraping Batches</CardTitle>
          <CardDescription>
            Track your bulk scraping operations and their progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading batches...</span>
            </div>
          ) : batches.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No bulk scraping batches yet. Create your first batch above.
            </p>
          ) : (
            <div className="space-y-3">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(batch.status)}
                    <div>
                      <p className="font-medium">
                        Batch of {batch.total_urls} URLs
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(batch.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="font-medium">
                        {batch.completed_urls + batch.failed_urls} / {batch.total_urls}
                      </p>
                      {batch.status === 'processing' && (
                        <p className="text-muted-foreground">
                          {Math.round(((batch.completed_urls + batch.failed_urls) / batch.total_urls) * 100)}% complete
                        </p>
                      )}
                      {batch.failed_urls > 0 && (
                        <p className="text-red-500">
                          {batch.failed_urls} failed
                        </p>
                      )}
                    </div>
                    {getStatusBadge(batch.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkScrapingUpload;
