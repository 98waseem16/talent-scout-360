import { useEffect } from 'react';
import { generateSitemap } from '@/lib/sitemap';

const Sitemap = () => {
  useEffect(() => {
    const generateAndServeSitemap = async () => {
      try {
        const sitemapXml = await generateSitemap();
        
        // Set the response content type to XML
        const response = new Response(sitemapXml, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
          }
        });
        
        // Create a blob and download it
        const blob = new Blob([sitemapXml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        // Replace the current page content with the XML
        document.documentElement.innerHTML = `<pre>${sitemapXml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
        document.title = 'Sitemap';
        
        // Set the correct content type
        if (document.querySelector('meta[http-equiv="Content-Type"]')) {
          document.querySelector('meta[http-equiv="Content-Type"]')?.setAttribute('content', 'application/xml');
        } else {
          const meta = document.createElement('meta');
          meta.setAttribute('http-equiv', 'Content-Type');
          meta.setAttribute('content', 'application/xml');
          document.head.appendChild(meta);
        }
      } catch (error) {
        console.error('Error generating sitemap:', error);
        document.documentElement.innerHTML = '<h1>Error generating sitemap</h1>';
      }
    };

    generateAndServeSitemap();
  }, []);

  return null; // Component doesn't render anything as we replace the DOM
};

export default Sitemap;