
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Edit, Target } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

interface OnboardingData {
  age?: number;
  sex?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  fitnessGoals?: string;
  bmi?: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('onboardingData');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        const { weight, height } = parsedData;
        const bmi =
            weight && height ? Number((weight / ((height / 100) * (height / 100))).toFixed(2)) : 0;
        setOnboardingData({ ...parsedData, bmi });
      } catch (e) {
        console.error("Failed to parse onboarding data", e);
      }
    }
  }, []);

  if (!user) {
    return null; // Or a loading spinner
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'G';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };
  
  const handleSignUp = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Profile</h1>
      
      {user.isAnonymous && (
        <Card className="bg-primary/10 border-primary">
            <CardHeader className="flex-row items-center gap-4">
                <UserPlus className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle>You are using a Guest Account</CardTitle>
                    <CardDescription className="text-foreground/80">Sign up to save your progress and unlock all features.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Button onClick={handleSignUp}>
                    Sign Up Now
                </Button>
            </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">
                    {user.isAnonymous ? 'Guest User' : user.displayName || 'User'}
                  </h2>
                  <p className="text-muted-foreground break-all">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" defaultValue={user.displayName || ''} disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={user.email || ''} disabled />
                </div>
              </div>
                
              {!user.isAnonymous && (
                <Button disabled>Update Profile</Button>
              )}

            </CardContent>
          </Card>
        </div>

        {onboardingData && (
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle>Health & Fitness Data</CardTitle>
                        <CardDescription>This information is used to personalize your plan.</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => router.push('/onboarding')}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Age</Label>
                            <Input value={onboardingData.age || 'N/A'} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label>Sex</Label>
                            <Input value={onboardingData.sex || 'N/A'} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Height</Label>
                            <Input value={onboardingData.height ? `${onboardingData.height} cm` : 'N/A'} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Weight</Label>
                            <Input value={onboardingData.weight ? `${onboardingData.weight} kg` : 'N/A'} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>BMI</Label>
                            <Input value={onboardingData.bmi || 'N/A'} disabled />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Fitness Goals</Label>
                        <Textarea value={onboardingData.fitnessGoals || 'No goals set.'} disabled rows={4} />
                    </div>
                </CardContent>
            </Card>
        </div>
        )}
      </div>
    </div>
  );
}
