
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Mail, Calendar, Briefcase } from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-32 w-32 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-primary" />
                Your Profile
              </CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  {user.email}
                </p>
              </div>
              
              {user.created_at && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Account Created</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {format(new Date(user.created_at), "MMMM dd, yyyy")}
                  </p>
                </div>
              )}
              
              {profile && (
                <>
                  {profile.full_name && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                      <p>{profile.full_name}</p>
                    </div>
                  )}
                  
                  {profile.company && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Company</p>
                      <p>{profile.company}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
            
            <CardFooter>
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-primary" />
                Job Activity
              </CardTitle>
              <CardDescription>Track your job postings and applications</CardDescription>
            </CardHeader>
            
            <CardContent className="h-48 flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                No job activity yet. Start by posting a job or browsing available positions.
              </p>
            </CardContent>
            
            <CardFooter className="flex gap-3">
              <Button className="w-full" onClick={() => navigate("/post-job")}>
                Post a Job
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/jobs")}>
                Browse Jobs
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
