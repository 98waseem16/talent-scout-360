
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';

// Pages
import Index from '@/pages/Index';
import Jobs from '@/pages/Jobs';
import JobDetails from '@/pages/JobDetails';
import PostJob from '@/pages/PostJob';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/AuthCallback';
import Unauthorized from '@/pages/Unauthorized';

// Admin Pages
import RequireAdmin from '@/components/admin/RequireAdmin';
import AdminDashboard from '@/pages/admin/AdminDashboard';

// Create a client
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/edit-job/:id" element={<PostJob />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Admin Routes */}
              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
