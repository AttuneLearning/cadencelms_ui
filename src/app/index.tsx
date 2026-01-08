import React from 'react';
import { AppLayout } from '@/widgets/layout/AppLayout';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Separator } from '@/shared/ui/separator';
import { useToast } from '@/shared/ui/use-toast';
import { BookOpen, Users, Award, Clock } from 'lucide-react';

export const App: React.FC = () => {
  const { toast } = useToast();

  const handleShowToast = () => {
    toast({
      title: 'Design System Ready',
      description: 'All components are working correctly!',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">LMS UI V2</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            A modern Learning Management System built with React, Tailwind CSS,
            and shadcn/ui components. Design system ready for development.
          </p>
          <div className="flex gap-4">
            <Button onClick={handleShowToast}>Get Started</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </section>

        <Separator />

        {/* Stats Cards */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +180 from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Certificates
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">
                +45 this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Hours Learned
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">
                +320 from last month
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Component Showcase */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Component Showcase
          </h2>
          <p className="text-muted-foreground">
            Explore the design system components available in this application.
          </p>

          <Tabs defaultValue="buttons" className="w-full">
            <TabsList>
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
            </TabsList>
            <TabsContent value="buttons" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Button Variants</CardTitle>
                  <CardDescription>
                    Different button styles for various use cases.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Buttons support multiple sizes: sm, default, lg, and icon.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="badges" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Badge Variants</CardTitle>
                  <CardDescription>
                    Badges for status indicators and labels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="forms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Form Elements</CardTitle>
                  <CardDescription>
                    Input components for building forms.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      type="password"
                      id="password"
                      placeholder="Enter your password"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full max-w-sm">Submit</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </AppLayout>
  );
};
