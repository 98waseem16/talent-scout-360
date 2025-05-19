
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, LineChart, Settings, User, Box } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const adminTools = [
    {
      title: 'Scraping Tool',
      description: 'Configure and run web scraping jobs',
      icon: <Database className="w-5 h-5" />,
      link: '/admin/scraping',
      color: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      title: 'Analytics',
      description: 'View site statistics and metrics',
      icon: <LineChart className="w-5 h-5" />,
      link: '/admin/analytics',
      color: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: <User className="w-5 h-5" />,
      link: '/admin/users',
      color: 'bg-orange-500/10',
      iconColor: 'text-orange-500'
    },
    {
      title: 'Site Settings',
      description: 'Configure global application settings',
      icon: <Settings className="w-5 h-5" />,
      link: '/admin/settings',
      color: 'bg-green-500/10',
      iconColor: 'text-green-500'
    }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email?.split('@')[0] || 'Admin'}. Manage your application settings and tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminTools.map((tool, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className={`p-2 rounded-lg w-fit ${tool.color}`}>
                    <div className={tool.iconColor}>{tool.icon}</div>
                  </div>
                  <CardTitle className="mt-4">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild variant={index === 0 ? "default" : "secondary"} className="w-full">
                    <Link to={tool.link}>
                      {index === 0 ? 'Access Tool' : 'Coming Soon'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Box className="w-6 h-6 text-yellow-500" />
              </div>
              <h2 className="text-xl font-medium">Quick Tip</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Currently, only the Scraping Tool is fully implemented. Other admin tools will be added in future updates.
            </p>
            <Button asChild variant="outline">
              <Link to="/admin/scraping">Go to Scraping Tool</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminDashboard;
