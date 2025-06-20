
-- Drop existing RLS policies for job_postings
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.job_postings;
DROP POLICY IF EXISTS "Users can create their own jobs" ON public.job_postings;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.job_postings;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.job_postings;

-- Create new RLS policies that allow public viewing and admin management

-- Allow everyone to view published jobs (not drafts)
CREATE POLICY "Anyone can view published jobs" 
  ON public.job_postings 
  FOR SELECT 
  USING (is_draft = false);

-- Allow authenticated users to view their own jobs (including drafts)
CREATE POLICY "Users can view their own jobs" 
  ON public.job_postings 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow admins to view all jobs (including drafts)
CREATE POLICY "Admins can view all jobs" 
  ON public.job_postings 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Allow authenticated users to create jobs
CREATE POLICY "Users can create jobs" 
  ON public.job_postings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own jobs
CREATE POLICY "Users can update their own jobs" 
  ON public.job_postings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow admins to update any job (including scraped jobs with null user_id)
CREATE POLICY "Admins can update any job" 
  ON public.job_postings 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Allow users to delete their own jobs
CREATE POLICY "Users can delete their own jobs" 
  ON public.job_postings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow admins to delete any job (including scraped jobs with null user_id)
CREATE POLICY "Admins can delete any job" 
  ON public.job_postings 
  FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
