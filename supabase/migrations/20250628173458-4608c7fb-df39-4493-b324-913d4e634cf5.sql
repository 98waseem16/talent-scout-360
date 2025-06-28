
-- Phase 1: Database Schema Enhancements

-- Add task timeout tracking fields to scraping_jobs table
ALTER TABLE public.scraping_jobs 
ADD COLUMN timeout_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN last_polled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN gobi_status_checked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN task_timeout_minutes INTEGER DEFAULT 30;

-- Create task status history table for tracking status changes
CREATE TABLE public.task_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scraping_job_id UUID REFERENCES public.scraping_jobs(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    gobi_response JSONB,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER
);

-- Create scraping configuration table for dynamic settings
CREATE TABLE public.scraping_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration values
INSERT INTO public.scraping_config (key, value, description) VALUES
('task_timeout_minutes', '30', 'Default task timeout in minutes'),
('poll_interval_seconds', '120', 'How often to poll running tasks in seconds'),
('max_retries', '3', 'Maximum retry attempts for failed tasks'),
('circuit_breaker_threshold', '5', 'Number of consecutive failures before circuit breaker trips'),
('gobi_api_timeout_seconds', '60', 'Timeout for Gobi API calls in seconds');

-- Enable RLS on new tables
ALTER TABLE public.task_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_config ENABLE ROW LEVEL SECURITY;

-- Create policies for task_status_history (admin only)
CREATE POLICY "Admins can view task status history" 
ON public.task_status_history FOR SELECT 
USING (public.is_admin());

CREATE POLICY "System can insert task status history" 
ON public.task_status_history FOR INSERT 
WITH CHECK (true);

-- Create policies for scraping_config (admin read, system write)
CREATE POLICY "Admins can view scraping config" 
ON public.scraping_config FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can update scraping config" 
ON public.scraping_config FOR ALL 
USING (public.is_admin());
