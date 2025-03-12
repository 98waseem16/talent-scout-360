
import React from 'react';
import { Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <Mail className="h-5 w-5" />
            <a href="mailto:hi@notcorporate.com">hi@notcorporate.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
