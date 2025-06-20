
-- Remove the scraping_jobs table completely
DROP TABLE IF EXISTS public.scraping_jobs;

-- Remove the source_url column from job_postings table
ALTER TABLE public.job_postings DROP COLUMN IF EXISTS source_url;
