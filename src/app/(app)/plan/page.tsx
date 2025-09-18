
"use client";

import { useEffect, useState } from "react";
import { ExercisePlan as ExercisePlanComponent } from "@/components/exercise-plan";
import { OnboardingFlow } from "@/components/onboarding-flow";
import type { StoredPlan } from "@/lib/types";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type View = "LIST" | "CREATE";

export default function PlanPage() {
  const [plans, setPlans] = useState<StoredPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("LIST");
  const [activeTab, setActiveTab] = useState<string | undefined>();

  useEffect(() => {
    try {
      const storedPlans = sessionStorage.getItem("userPlans");
      if (storedPlans) {
        const parsedPlans: StoredPlan[] = JSON.parse(storedPlans);
        const sortedPlans = parsedPlans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPlans(sortedPlans);
        if (sortedPlans.length > 0) {
          setActiveTab(sortedPlans[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to parse data from session storage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePlanGenerated = (newPlan: StoredPlan) => {
    const updatedPlans = [...plans, newPlan].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setPlans(updatedPlans);
    sessionStorage.setItem("userPlans", JSON.stringify(updatedPlans));
    setActiveTab(newPlan.id);
    setView("LIST");
  };

  const handlePlanDeleted = (planId: string) => {
    const updatedPlans = plans.filter((p) => p.id !== planId);
    setPlans(updatedPlans);
    sessionStorage.setItem("userPlans", JSON.stringify(updatedPlans));
    if (updatedPlans.length > 0) {
      setActiveTab(updatedPlans[0].id);
    } else {
      setActiveTab(undefined);
    }
  };
  
  const handleCreateNewClick = () => {
    setView("CREATE");
  };
  
  const handleCancelCreate = () => {
    setView("LIST");
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (view === "CREATE") {
    return (
        <div className="max-w-4xl mx-auto">
            <OnboardingFlow onPlanGenerated={handlePlanGenerated} onCancel={handleCancelCreate} />
        </div>
    );
  }

  if (plans.length > 0 && activeTab) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-headline">My Plans</h1>
            <Button onClick={handleCreateNewClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Plan
            </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            {plans.map((plan) => (
              <TabsTrigger key={plan.id} value={plan.id}>
                {plan.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {plans.map((plan) => (
             <TabsContent key={plan.id} value={plan.id}>
                 <ExercisePlanComponent
                    key={plan.id}
                    storedPlan={plan}
                    onDelete={() => handlePlanDeleted(plan.id)}
                />
             </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <Card className="text-center">
            <CardHeader>
                <CardTitle>No Plans Yet</CardTitle>
                <CardDescription>You haven't created any fitness plans. Get started by creating your first one!</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleCreateNewClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Plan
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
