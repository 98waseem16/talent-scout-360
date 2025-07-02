
-- Phase 1: Add cron job to run poll-gobi-tasks every 5 minutes
SELECT cron.schedule(
  'poll-gobi-tasks-every-5-minutes',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://onrobtdyzakhnquevfvd.supabase.co/functions/v1/poll-gobi-tasks',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucm9idGR5emFraG5xdWV2ZnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTA4Nzc1NywiZXhwIjoyMDU2NjYzNzU3fQ.LUBLykdTH5LOWnkEWX6J4L5Hxm9TazHoYsxqMZUYxO8"}'::jsonb,
      body := '{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);

-- Phase 2: Add webhook health monitoring table
CREATE TABLE IF NOT EXISTS public.webhook_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_type TEXT NOT NULL,
  last_received_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for webhook_health
ALTER TABLE public.webhook_health ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage webhook health
CREATE POLICY "Admins can manage webhook health"
  ON public.webhook_health
  FOR ALL
  USING (is_admin());

-- Insert initial webhook health record
INSERT INTO public.webhook_health (webhook_type, last_received_at, is_active)
VALUES ('gobi-webhook', NULL, true)
ON CONFLICT DO NOTHING;

-- Phase 3: Add job recovery tracking table
CREATE TABLE IF NOT EXISTS public.job_recovery_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scraping_job_id UUID REFERENCES public.scraping_jobs(id),
  recovery_action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  recovery_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for job_recovery_log
ALTER TABLE public.job_recovery_log ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view recovery logs
CREATE POLICY "Admins can view recovery logs"
  ON public.job_recovery_log
  FOR SELECT
  USING (is_admin());

-- Policy for system to insert recovery logs
CREATE POLICY "System can insert recovery logs"
  ON public.job_recovery_log
  FOR INSERT
  WITH CHECK (true);
