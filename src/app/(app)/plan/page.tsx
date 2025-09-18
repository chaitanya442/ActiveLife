
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExercisePlan as ExercisePlanComponent } from "@/components/exercise-plan";
import { ExercisePlan } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface OnboardingData {
    fitnessGoals: string;
}

export default function PlanPage() {
  const [planData, setPlanData] = useState<ExercisePlan | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedPlan = sessionStorage.getItem("generatedPlan");
      const storedOnboardingData = sessionStorage.getItem("onboardingData");

      if (storedPlan && storedOnboardingData) {
        const parsedPlan = JSON.parse(storedPlan);
        const parsedOnboarding = JSON.parse(storedOnboardingData);

        if (parsedPlan.exercisePlan && parsedOnboarding.fitnessGoals) {
          setPlanData(parsedPlan);
          setOnboardingData(parsedOnboarding);
        }
      }
    } catch (error) {
      console.error("Failed to parse plan data from session storage", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!planData || !onboardingData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="text-center max-w-lg">
            <CardHeader>
                <CardTitle>No Plan Found</CardTitle>
                <CardDescription>
                    We couldn't find a generated plan in your session. Please note that the "New Plan" feature has been temporarily removed.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    If you have generated a plan previously in this session, it will be displayed here.
                </p>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ExercisePlanComponent 
        initialPlan={planData} 
        fitnessGoals={onboardingData.fitnessGoals}
      />
    </div>
  );
}
