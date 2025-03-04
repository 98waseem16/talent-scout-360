
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import PostJob from "./pages/PostJob";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import ProfileType from "./pages/ProfileType";
import JobSeekerProfile from "./pages/JobSeekerProfile";
import JobPosterProfile from "./pages/JobPosterProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile-type" element={<ProfileType />} />
            <Route path="/profile/job-seeker" element={<JobSeekerProfile />} />
            <Route path="/profile/job-poster" element={<JobPosterProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
