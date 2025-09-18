
'use client';

import { useEffect, useState, useTransition } from 'react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


interface OnboardingData {
  age?: number;
  sex?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  fitnessGoals?: string;
  bmi?: number;
}

const updateSchema = z.object({
    value: z.coerce.number().min(1, "Please enter a valid number."),
});


export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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

  const handleDataUpdate = (key: keyof OnboardingData, value: any) => {
    const currentData = JSON.parse(sessionStorage.getItem('onboardingData') || '{}');
    const updatedData = { ...currentData, [key]: value };
    
    sessionStorage.setItem('onboardingData', JSON.stringify(updatedData));
    
    // Recalculate BMI if weight or height changes
    const { weight, height } = updatedData;
    const bmi = weight && height ? Number((weight / ((height / 100) * (height / 100))).toFixed(2)) : 0;
    setOnboardingData({ ...updatedData, bmi });
  }

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
        <div className="relative h-32 md:h-48 w-full">
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
            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-6">
                <div className="flex items-end gap-4">
                    <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-background">
                        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                        <AvatarFallback className="text-2xl md:text-3xl">{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="mb-1 md:mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold font-headline">
                            {user.isAnonymous ? 'Guest User' : user.displayName || 'User'}
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground">{user.email}</p>
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
                        <StatCard icon={<Calendar className="h-6 w-6 text-primary"/>} label="Age" value={onboardingData.age} dataKey="age" onUpdate={handleDataUpdate} />
                    )}
                     {onboardingData?.sex && (
                        <StatDisplayCard icon={getSexIcon(onboardingData.sex)} label="Sex" value={onboardingData.sex} />
                    )}
                    {onboardingData?.height && (
                        <StatCard icon={<PersonStanding className="h-6 w-6 text-primary"/>} label="Height" value={`${onboardingData.height}`} unit="cm" dataKey="height" onUpdate={handleDataUpdate} />
                    )}
                    {onboardingData?.weight && (
                        <StatCard icon={<Weight className="h-6 w-6 text-primary"/>} label="Weight" value={`${onboardingData.weight}`} unit="kg" dataKey="weight" onUpdate={handleDataUpdate} />
                    )}
                     {onboardingData?.bmi && (
                        <StatDisplayCard icon={<Heart className="h-6 w-6 text-primary"/>} label="BMI" value={onboardingData.bmi} />
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

const StatDisplayCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
        {icon}
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
)

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    unit?: string;
    dataKey: keyof OnboardingData;
    onUpdate: (key: keyof OnboardingData, value: any) => void;
}

const StatCard = ({ icon, label, value, unit, dataKey, onUpdate }: StatCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<{ value: number }>({
        resolver: zodResolver(updateSchema),
        defaultValues: { value: Number(value) },
    });

    const onSubmit = (data: { value: number }) => {
        onUpdate(dataKey, data.value);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors">
                    {icon}
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-xl font-bold">{value} {unit}</p>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update {label}</DialogTitle>
                    <DialogDescription>
                        Enter your new {label.toLowerCase()}. This will update your profile and help in adjusting future plans.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">{label}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type="number" {...field} />
                                            {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{unit}</span>}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
