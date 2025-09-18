
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPlus, Edit, Target, Heart, PersonStanding, Weight, Calendar, Venus, Mars, WholeWord } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { placeholderImages } from '@/lib/placeholder-images';

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
  const profileHeaderImage = placeholderImages.find((img) => img.id === 'profile-header');

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
  
  const getSexIcon = (sex: 'male' | 'female' | 'other' | undefined) => {
    switch (sex) {
        case 'male': return <Mars className="h-6 w-6 text-primary" />;
        case 'female': return <Venus className="h-6 w-6 text-primary" />;
        default: return <WholeWord className="h-6 w-6 text-primary" />;
    }
  }


  return (
    <div className="space-y-6">
      
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

      <Card className="overflow-hidden">
        <div className="relative h-48 w-full">
            {profileHeaderImage && (
                <Image
                    src={profileHeaderImage.imageUrl}
                    alt="Profile header"
                    fill
                    className="object-cover"
                    data-ai-hint={profileHeaderImage.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end gap-4">
                    <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                        <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="mb-2">
                        <h1 className="text-3xl font-bold font-headline">
                            {user.isAnonymous ? 'Guest User' : user.displayName || 'User'}
                        </h1>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    {onboardingData?.age && (
                        <StatCard icon={<Calendar className="h-6 w-6 text-primary"/>} label="Age" value={onboardingData.age} />
                    )}
                     {onboardingData?.sex && (
                        <StatCard icon={getSexIcon(onboardingData.sex)} label="Sex" value={onboardingData.sex} />
                    )}
                    {onboardingData?.height && (
                        <StatCard icon={<PersonStanding className="h-6 w-6 text-primary"/>} label="Height" value={`${onboardingData.height} cm`} />
                    )}
                    {onboardingData?.weight && (
                        <StatCard icon={<Weight className="h-6 w-6 text-primary"/>} label="Weight" value={`${onboardingData.weight} kg`} />
                    )}
                     {onboardingData?.bmi && (
                        <StatCard icon={<Heart className="h-6 w-6 text-primary"/>} label="BMI" value={onboardingData.bmi} />
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="text-primary" />
                        Fitness Goals
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-muted-foreground italic">
                        {onboardingData?.fitnessGoals || "No goals have been set yet. Create a new plan to set your goals."}
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
        {icon}
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
)
