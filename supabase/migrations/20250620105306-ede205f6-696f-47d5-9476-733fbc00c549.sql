
-- Create table to track career page sources
CREATE TABLE public.career_page_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  company_name TEXT,
  added_by UUID REFERENCES auth.users(id) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_scraped_at TIMESTAMP WITH TIME ZONE
);

-- Create table to track individual scraping jobs
CREATE TABLE public.scraping_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.career_page_sources(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  jobs_found INTEGER DEFAULT 0,
  jobs_created INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Add source tracking fields to job_postings table
ALTER TABLE public.job_postings 
ADD COLUMN source_url TEXT,
ADD COLUMN scraped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN scraping_job_id UUID REFERENCES public.scraping_jobs(id);

-- Enable RLS on new tables
ALTER TABLE public.career_page_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for career_page_sources
CREATE POLICY "Admins can view all career page sources" 
  ON public.career_page_sources 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can insert career page sources" 
  ON public.career_page_sources 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can update career page sources" 
  ON public.career_page_sources 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- RLS policies for scraping_jobs
CREATE POLICY "Admins can view all scraping jobs" 
  ON public.scraping_jobs 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can insert scraping jobs" 
  ON public.scraping_jobs 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can update scraping jobs" 
  ON public.scraping_jobs 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_career_page_sources_active ON public.career_page_sources(is_active);
CREATE INDEX idx_scraping_jobs_status ON public.scraping_jobs(status);
CREATE INDEX idx_scraping_jobs_source_id ON public.scraping_jobs(source_id);
CREATE INDEX idx_job_postings_source_url ON public.job_postings(source_url);
