import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import { placeholderImages } from "@/lib/placeholder-images";

export default function DashboardPage() {
  const welcomeImage = placeholderImages.find(img => img.id === 'dashboard-welcome');

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      <Card className="relative overflow-hidden">
        {welcomeImage && (
          <Image
            src={welcomeImage.imageUrl}
            alt="Welcome"
            width={800}
            height={400}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            data-ai-hint={welcomeImage.imageHint}
          />
        )}
        <div className="relative bg-gradient-to-r from-background via-background/80 to-transparent">
          <CardHeader>
            <CardTitle className="text-4xl font-headline">Welcome to ActiveLife!</CardTitle>
            <CardDescription className="text-lg">
              Your journey to a healthier you starts now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-lg">
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 text-primary p-2 rounded-full">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Create Your Personalized Plan</h3>
                  <p className="text-muted-foreground">
                    Answer a few simple questions to let our AI generate a unique fitness plan tailored to your body and goals.
                  </p>
                </div>
              </div>
              <Button asChild size="lg">
                <Link href="/onboarding">
                  Start Onboarding <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
