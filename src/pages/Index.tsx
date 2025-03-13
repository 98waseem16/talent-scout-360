
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
      </main>
      <Footer />
    </>
  );
};

export default Index;
