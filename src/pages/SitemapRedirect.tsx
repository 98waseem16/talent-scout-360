import { useEffect } from 'react';

export default function SitemapRedirect() {
  useEffect(() => {
    // Redirect to the sitemap edge function
    window.location.href = 'https://onrobtdyzakhnquevfvd.supabase.co/functions/v1/sitemap';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to sitemap...</p>
    </div>
  );
}