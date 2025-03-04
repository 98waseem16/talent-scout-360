
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProfileType: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      navigate('/auth');
    }

    // Redirect if user already has a type
    if (profile?.user_type === 'job_seeker') {
      navigate('/profile/job-seeker');
    } else if (profile?.user_type === 'job_poster') {
      navigate('/profile/job-poster');
    }
  }, [user, profile, isLoading, navigate]);

  const handleSelectType = async (type: 'job_seeker' | 'job_poster') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: type })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Profile type updated',
        description: `You've been registered as a ${type === 'job_seeker' ? 'job seeker' : 'job poster'}.`,
      });

      // Navigate to the appropriate profile page
      navigate(type === 'job_seeker' ? '/profile/job-seeker' : '/profile/job-poster');
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message || 'Failed to update profile type',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8 text-center">What brings you to JobHunt?</h1>
        <p className="text-lg text-center mb-12 text-muted-foreground">
          Select your profile type to get started
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-primary" />
              <CardTitle>I'm looking for a job</CardTitle>
              <CardDescription>Create a job seeker profile to browse and apply to jobs</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p>As a job seeker, you can:</p>
              <ul className="text-left list-disc list-inside mt-2 space-y-1">
                <li>Create a comprehensive profile</li>
                <li>Browse job listings</li>
                <li>Apply to positions</li>
                <li>Track your applications</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleSelectType('job_seeker')}
              >
                Continue as Job Seeker
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-primary" />
              <CardTitle>I'm hiring</CardTitle>
              <CardDescription>Create a job poster profile to post job listings</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p>As a job poster, you can:</p>
              <ul className="text-left list-disc list-inside mt-2 space-y-1">
                <li>Create a company profile</li>
                <li>Post job openings</li>
                <li>Manage applications</li>
                <li>Connect with candidates</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleSelectType('job_poster')}
              >
                Continue as Job Poster
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default ProfileType;
