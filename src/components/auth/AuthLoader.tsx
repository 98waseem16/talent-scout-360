
import React from 'react';
import { Loader2 } from 'lucide-react';

const AuthLoader: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default AuthLoader;
