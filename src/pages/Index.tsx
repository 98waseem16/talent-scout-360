import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import TrendingJobs from '@/components/TrendingJobs';
import { CheckCircle, Download, BarChart4 } from 'lucide-react';
import { AnimatedTooltipPreview } from '@/components/ui/code-demo';

const Index: React.FC = () => {
  const features = [{
    icon: <BarChart4 className="h-6 w-6 text-primary" />,
    title: 'AI-Powered Startup Matching',
    description: 'Our intelligent algorithms match your skills with the perfect startup opportunities based on growth stage and culture fit.'
  }, {
    icon: <Download className="h-6 w-6 text-primary" />,
    title: 'One-Click Applications',
    description: 'Apply to startup jobs with a single click using your saved profile and resume, skipping tedious application forms.'
  }, {
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    title: 'Verified Startups',
    description: 'All startups on our platform are verified to ensure legitimate opportunities with funding information and growth metrics.'
  }];
  
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <Hero />
        <TrendingJobs />
        
        {/* How It Works Section */}
        <section className="py-16 md:py-24 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-medium mb-6">Trusted by some of the best talent out there</h2>
          </div>
          <AnimatedTooltipPreview />
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="max-w-7xl mx-auto relative">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-medium mb-4">Ready to join a high-growth startup?</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join thousands of job seekers who have found roles at innovative startups through Launchly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/jobs" className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-lg transition-colors smooth-transition">
                  Browse Startup Jobs
                </a>
                <a href="/post-job" className="bg-white border border-primary text-primary hover:bg-primary/5 font-medium py-3 px-8 rounded-lg transition-colors smooth-transition">
                  Post a Startup Job
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Index;
