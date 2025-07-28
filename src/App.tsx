
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthErrorBoundary from '@/components/auth/AuthErrorBoundary';
import SessionStatus from '@/components/auth/SessionStatus';
import { Analytics } from '@vercel/analytics/react';

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
import Sitemap from '@/pages/Sitemap';

// Admin Pages
import RequireAdmin from '@/components/admin/RequireAdmin';
import AdminDashboard from '@/pages/admin/AdminDashboard';

// Create a client with enhanced error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthErrorBoundary>
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
                <Route path="/sitemap.xml" element={<Sitemap />} />
                
                {/* Admin Routes */}
                <Route element={<RequireAdmin />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
            <SessionStatus />
            <Analytics />
          </AuthProvider>
        </Router>
      </AuthErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
