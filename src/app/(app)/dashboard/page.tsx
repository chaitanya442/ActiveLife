
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  ClipboardList,
  Target,
  TrendingUp,
  PersonStanding,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { placeholderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const chartData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 73 },
  { month: 'May', desktop: 209 },
  { month: 'June', desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: 'Weight',
    color: 'hsl(var(--chart-1))',
  },
};

export default function DashboardPage() {
  const welcomeImage = placeholderImages.find(
    (img) => img.id === 'dashboard-welcome'
  );
  const [userData, setUserData] = useState({
    weight: 0,
    height: 0,
    bmi: 0,
    hasPlan: false,
  });

  useEffect(() => {
    const onboardingData = sessionStorage.getItem('onboardingData');
    const planData = sessionStorage.getItem('generatedPlan');
    
    if (onboardingData) {
      try {
        const { weight, height } = JSON.parse(onboardingData);
        const bmi =
          weight && height ? Number((weight / ((height / 100) * (height / 100))).toFixed(2)) : 0;
        setUserData(prev => ({ ...prev, weight, height, bmi }));
      } catch (e) {
        console.error("Could not parse user data from session storage", e);
      }
    }

    if (planData) {
      setUserData(prev => ({...prev, hasPlan: true}));
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      <Card className="relative overflow-hidden">
        {welcomeImage && (
          <Image
            src={welcomeImage.imageUrl}
            alt="Welcome"
            fill
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            data-ai-hint={welcomeImage.imageHint}
          />
        )}
        <div className="relative bg-gradient-to-r from-background via-background/80 to-background">
          <CardHeader className="z-10">
            <CardTitle className="text-4xl font-headline">
              Welcome back!
            </CardTitle>
            <CardDescription className="text-lg">
              Here is a summary of your current progress and health stats.
            </CardDescription>
          </CardHeader>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BMI</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.bmi || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              A measure of body fat
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.weight || 'N/A'} kg</div>
            <p className="text-xs text-muted-foreground">Your current weight</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Height</CardTitle>
            <PersonStanding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.height || 'N/A'} cm</div>
            <p className="text-xs text-muted-foreground">Your current height</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plan</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.hasPlan ? 'Yes' : 'No'}</div>
            <p className="text-xs text-muted-foreground">
              You have a personalized plan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[250px]">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="desktop"
                  type="natural"
                  fill="var(--color-desktop)"
                  fillOpacity={0.4}
                  stroke="var(--color-desktop)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your plan and track your progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <ClipboardList />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">View Plan</p>
                <p className="text-sm text-muted-foreground">
                  Check your current workout schedule and advice.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/plan">
                  View <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <TrendingUp />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Track Progress
                </p>
                <p className="text-sm text-muted-foreground">
                  Log your workouts and see your improvements.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/progress">
                  Track <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <Activity />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  New Onboarding
                </p>
                <p className="text-sm text-muted-foreground">
                  Start over with a new fitness assessment.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/onboarding">
                  Start <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
