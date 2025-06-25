
-- Phase 1: Add expiration fields to job_postings table
ALTER TABLE public.job_postings 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_expired BOOLEAN NOT NULL DEFAULT false;

-- Set expires_at for existing jobs (30 days from posted date)
UPDATE public.job_postings 
SET expires_at = posted + INTERVAL '30 days'
WHERE expires_at IS NULL;

-- Mark jobs older than 30 days as expired
UPDATE public.job_postings 
SET is_expired = true 
WHERE posted < NOW() - INTERVAL '30 days';

-- Make expires_at NOT NULL after setting values
ALTER TABLE public.job_postings 
ALTER COLUMN expires_at SET NOT NULL;

-- Create function to mark expired jobs
CREATE OR REPLACE FUNCTION public.mark_expired_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.job_postings 
  SET is_expired = true 
  WHERE expires_at < NOW() AND is_expired = false;
END;
$$;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run daily at midnight
SELECT cron.schedule(
  'mark-expired-jobs-daily',
  '0 0 * * *', -- Daily at midnight
  'SELECT public.mark_expired_jobs();'
);
