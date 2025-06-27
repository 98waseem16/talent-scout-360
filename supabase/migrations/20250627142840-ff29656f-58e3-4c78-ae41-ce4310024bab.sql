
-- Phase 1: Enable cron extensions and create scheduled job
-- First, enable the required extensions for cron functionality
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to process the scraping queue every 2 minutes
SELECT
  cron.schedule(
    'process-scraping-queue',
    '*/2 * * * *', -- Every 2 minutes
    $$
    SELECT
      net.http_post(
        url:='https://onrobtdyzakhnquevfvd.supabase.co/functions/v1/process-scraping-queue',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucm9idGR5emFraG5xdWV2ZnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwODc3NTcsImV4cCI6MjA1NjY2Mzc1N30.7tQ9HXG0xbD2UClCjrKuZZ5gbBYt5jSJrKLphu4IhF0"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
      ) as request_id;
    $$
  );

-- Add queue monitoring table for tracking queue health
CREATE TABLE IF NOT EXISTS public.queue_monitoring (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processed_jobs integer NOT NULL DEFAULT 0,
  failed_jobs integer NOT NULL DEFAULT 0,
  queue_size integer NOT NULL DEFAULT 0,
  processing_time_ms integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  trigger_source text NOT NULL DEFAULT 'unknown'
);

-- Enable RLS on queue_monitoring
ALTER TABLE public.queue_monitoring ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view queue monitoring
CREATE POLICY "Admins can view queue monitoring" 
  ON public.queue_monitoring 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
