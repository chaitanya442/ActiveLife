
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
            <FileText className="h-12 w-12" />
          </div>
          <CardTitle className="font-headline text-4xl">
            Create Your Personalized Fitness Plan
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Let's get started by gathering some information about you. Our AI will use this to create a safe and effective workout plan tailored to your needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link href="/onboarding/start">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            The process takes about 2 minutes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
