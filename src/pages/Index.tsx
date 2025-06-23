import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import TrendingJobs from '@/components/TrendingJobs';
import { Briefcase, Building } from 'lucide-react';
import { AnimatedTooltipPreview } from '@/components/ui/code-demo';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
const Index: React.FC = () => {
  const categories = [{
    name: 'Software Engineering',
    icon: <Briefcase />,
    count: 230
  }, {
    name: 'Design',
    icon: <Briefcase />,
    count: 158
  }, {
    name: 'Marketing',
    icon: <Briefcase />,
    count: 145
  }, {
    name: 'Product Management',
    icon: <Briefcase />,
    count: 112
  }, {
    name: 'Sales',
    icon: <Briefcase />,
    count: 95
  }, {
    name: 'Operations',
    icon: <Briefcase />,
    count: 87
  }];
  return <>
      <Header />
      <main className="min-h-screen w-full">
        {/* Hero section */}
        <Hero />
        
        {/* Trending Jobs */}
        <TrendingJobs />
        
        {/* New Browse by Category Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-4">
                Browse by Category
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore startup opportunities across different fields
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, idx) => <a key={idx} href={`/jobs?category=${encodeURIComponent(category.name)}`} className="bg-slate-50 hover:bg-slate-100 border border-border rounded-xl p-4 text-center transition-all group">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:shadow group-hover:bg-primary/5 transition-all">
                    {category.icon}
                  </div>
                  <h3 className="font-medium mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} jobs</p>
                </a>)}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-4">
                Trusted by some of the best talent out there
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
            </p>
            </div>
            
            <AnimatedTooltipPreview />
            
            {/* Carousel of company logos */}
            <div className="mt-16">
              <Carousel opts={{
              align: "start",
              loop: true
            }} className="w-full">
                <CarouselContent>
                  {Array.from({
                  length: 10
                }).map((_, index) => <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/5">
                      <div className="h-24 flex items-center justify-center p-6 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Building className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Startup {index + 1}</span>
                        </div>
                      </div>
                    </CarouselItem>)}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>;
};
export default Index;