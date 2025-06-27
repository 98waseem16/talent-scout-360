
-- Phase A: Database Schema Updates (Fixed - avoiding duplicate indexes)

-- 1. Add bulk submission support to scraping_jobs table
ALTER TABLE public.scraping_jobs 
ADD COLUMN IF NOT EXISTS batch_id uuid,
ADD COLUMN IF NOT EXISTS webhook_url text,
ADD COLUMN IF NOT EXISTS gobi_task_id text,
ADD COLUMN IF NOT EXISTS task_data jsonb,
ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_retries integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0;

-- 2. Create scraping_batches table for bulk operations
CREATE TABLE IF NOT EXISTS public.scraping_batches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by uuid REFERENCES auth.users NOT NULL,
  total_urls integer NOT NULL DEFAULT 0,
  completed_urls integer NOT NULL DEFAULT 0,
  failed_urls integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- 3. Add indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_batch_id ON public.scraping_jobs(batch_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_gobi_task_id ON public.scraping_jobs(gobi_task_id);
CREATE INDEX IF NOT EXISTS idx_scraping_batches_created_by ON public.scraping_batches(created_by);
CREATE INDEX IF NOT EXISTS idx_scraping_batches_status ON public.scraping_batches(status);

-- 4. Enable RLS for new table
ALTER TABLE public.scraping_batches ENABLE ROW LEVEL SECURITY;

-- Create policies for scraping_batches (with IF NOT EXISTS equivalent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scraping_batches' AND policyname = 'Users can view their own batches') THEN
        CREATE POLICY "Users can view their own batches" 
          ON public.scraping_batches 
          FOR SELECT 
          USING (auth.uid() = created_by);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scraping_batches' AND policyname = 'Users can create their own batches') THEN
        CREATE POLICY "Users can create their own batches" 
          ON public.scraping_batches 
          FOR INSERT 
          WITH CHECK (auth.uid() = created_by);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scraping_batches' AND policyname = 'Users can update their own batches') THEN
        CREATE POLICY "Users can update their own batches" 
          ON public.scraping_batches 
          FOR UPDATE 
          USING (auth.uid() = created_by);
    END IF;
END
$$;

-- 5. Add function to update batch progress
CREATE OR REPLACE FUNCTION public.update_batch_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update batch statistics when scraping job status changes
  IF NEW.batch_id IS NOT NULL THEN
    UPDATE public.scraping_batches 
    SET 
      completed_urls = (
        SELECT COUNT(*) 
        FROM public.scraping_jobs 
        WHERE batch_id = NEW.batch_id AND status = 'completed'
      ),
      failed_urls = (
        SELECT COUNT(*) 
        FROM public.scraping_jobs 
        WHERE batch_id = NEW.batch_id AND status = 'failed'
      ),
      updated_at = now()
    WHERE id = NEW.batch_id;
    
    -- Mark batch as completed if all jobs are done
    UPDATE public.scraping_batches 
    SET 
      status = 'completed',
      completed_at = now()
    WHERE id = NEW.batch_id 
      AND (completed_urls + failed_urls) >= total_urls
      AND status != 'completed';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Create trigger for batch progress updates (drop and recreate to ensure it's correct)
DROP TRIGGER IF EXISTS trigger_update_batch_progress ON public.scraping_jobs;
CREATE TRIGGER trigger_update_batch_progress
  AFTER UPDATE OF status ON public.scraping_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_batch_progress();

-- 7. Enable realtime for new table
ALTER TABLE public.scraping_batches REPLICA IDENTITY FULL;
