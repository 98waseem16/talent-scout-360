
-- Delete all job posts except the one from Sorcerer
DELETE FROM public.job_postings 
WHERE company != 'Sorcerer';
