
-- Update the existing cron job to poll every 2 minutes instead of 5 for better responsiveness
SELECT cron.unschedule('poll-gobi-tasks-every-5-minutes');

SELECT cron.schedule(
  'poll-gobi-tasks-every-2-minutes',
  '*/2 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://onrobtdyzakhnquevfvd.supabase.co/functions/v1/poll-gobi-tasks',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucm9idGR5emFraG5xdWV2ZnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTA4Nzc1NywiZXhwIjoyMDU2NjYzNzU3fQ.LUBLykdTH5LOWnkEWX6J4L5Hxm9TazHoYsxqMZUYxO8"}'::jsonb,
      body := '{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);
