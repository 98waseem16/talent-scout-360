
-- Phase 1: Emergency Database Fixes

-- 1. Reset stuck jobs (running for more than 30 minutes) back to pending
UPDATE public.scraping_jobs 
SET 
  status = 'pending',
  gobi_task_id = NULL,
  task_data = NULL,
  error_message = 'Reset from stuck state - will retry',
  retry_count = COALESCE(retry_count, 0)
WHERE 
  status = 'running' 
  AND started_at < NOW() - INTERVAL '30 minutes';

-- 2. Clear clearly failed jobs (running for more than 2 hours)
UPDATE public.scraping_jobs 
SET 
  status = 'failed',
  completed_at = NOW(),
  error_message = 'Job timeout - exceeded 2 hour limit'
WHERE 
  status = 'running' 
  AND started_at < NOW() - INTERVAL '2 hours';

-- 3. Reset jobs with broken gobi_task_id references (empty strings)
UPDATE public.scraping_jobs 
SET 
  status = 'pending',
  gobi_task_id = NULL,
  task_data = NULL,
  error_message = 'Reset broken task reference',
  retry_count = COALESCE(retry_count, 0)
WHERE 
  gobi_task_id = '' 
  OR (gobi_task_id IS NOT NULL AND LENGTH(TRIM(gobi_task_id)) = 0);

-- 4. Log recovery actions
INSERT INTO public.job_recovery_log (scraping_job_id, recovery_action, old_status, new_status, recovery_reason)
SELECT 
  id,
  'emergency_reset',
  'running',
  'pending',
  'Emergency reset of stuck jobs during system recovery'
FROM public.scraping_jobs 
WHERE status = 'pending' AND error_message = 'Reset from stuck state - will retry';
