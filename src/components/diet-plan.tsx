
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { DietPieChart } from "./diet-pie-chart";
import { DetailedDietPlan } from "@/lib/types";
import { Apple, Salad } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface DietPlanProps {
  dietPlan?: DetailedDietPlan | string;
  macros?: {
    carbs: number;
    protein: number;
    fat: number;
  };
}

export function DietPlan({ dietPlan, macros }: DietPlanProps) {
  if (typeof dietPlan === "string") {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Diet Plan</CardTitle>
        </CardHeader>
        <CardContent>
            <p>{dietPlan}</p>
             <Alert className="mt-4">
                <AlertTitle>Outdated Plan Format</AlertTitle>
                <AlertDescription>
                    This diet plan is in an old format. Create a new plan to get detailed meal suggestions.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Apple className="text-primary" />
            Your Diet Plan
        </CardTitle>
        <CardDescription>
            {dietPlan?.summary || "A balanced diet to support your fitness goals."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DietPieChart macros={macros} />
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
                <Salad className="mr-2 h-4 w-4" />
                View Healthy Recipes
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline">Healthy Recipes</DialogTitle>
              <DialogDescription>
                Here are some meal ideas to help you stick to your plan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
                <MealSection title="Breakfast" items={dietPlan?.breakfast} />
                <MealSection title="Lunch" items={dietPlan?.lunch} />
                <MealSection title="Dinner" items={dietPlan?.dinner} />
                <MealSection title="Snacks" items={dietPlan?.snacks} />
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}


function MealSection({ title, items }: { title: string; items?: string[] }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    )
}
