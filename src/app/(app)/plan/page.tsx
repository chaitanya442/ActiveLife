
"use client";

import { useEffect, useState } from "react";
import { ExercisePlan as ExercisePlanComponent } from "@/components/exercise-plan";
import { OnboardingFlow } from "@/components/onboarding-flow";
import type { ExercisePlan, OnboardingData } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function PlanPage() {
  const [planData, setPlanData] = useState<ExercisePlan | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedPlan = sessionStorage.getItem("generatedPlan");
      const storedOnboarding = sessionStorage.getItem("onboardingData");

      if (storedPlan) {
        setPlanData(JSON.parse(storedPlan));
      }
      if (storedOnboarding) {
        setOnboardingData(JSON.parse(storedOnboarding));
      }
    } catch (error) {
      console.error("Failed to parse data from session storage", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const handlePlanGenerated = (newPlan: ExercisePlan, newOnboardingData: OnboardingData) => {
    setPlanData(newPlan);
    setOnboardingData(newOnboardingData);
    sessionStorage.setItem("generatedPlan", JSON.stringify(newPlan));
    sessionStorage.setItem("onboardingData", JSON.stringify(newOnboardingData));
  };

  const handlePlanDeleted = () => {
    setPlanData(null);
    setOnboardingData(null);
    sessionStorage.removeItem("generatedPlan");
    sessionStorage.removeItem("onboardingData");
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (planData && onboardingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <ExercisePlanComponent 
          initialPlan={planData} 
          fitnessGoals={onboardingData.fitnessGoals ?? ""}
          onDelete={handlePlanDeleted}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <OnboardingFlow onPlanGenerated={handlePlanGenerated} />
    </div>
  );
}
