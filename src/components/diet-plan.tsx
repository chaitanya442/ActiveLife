
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
import { DetailedDietPlan, MealNutrition } from "@/lib/types";
import { Apple, Salad, Flame, Beef, Wheat, Droplet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Separator } from "./ui/separator";

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
             <Alert className="mt-4" variant="destructive">
                <AlertTitle>Outdated Plan Format</AlertTitle>
                <AlertDescription>
                    This diet plan is in an old format. Create a new plan to get detailed meal suggestions and nutritional info.
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
      <CardContent className="pt-0">
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
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline">Healthy Recipes &amp; Nutrition</DialogTitle>
              <DialogDescription>
                Here are some meal ideas and nutritional targets to help you stick to your plan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
                <MealSection title="Breakfast" suggestions={dietPlan?.breakfast.suggestions} nutrition={dietPlan?.breakfast.nutrition} />
                <MealSection title="Lunch" suggestions={dietPlan?.lunch.suggestions} nutrition={dietPlan?.lunch.nutrition} />
                <MealSection title="Dinner" suggestions={dietPlan?.dinner.suggestions} nutrition={dietPlan?.dinner.nutrition} />
                 {dietPlan?.snacks && dietPlan.snacks.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-primary">Snacks</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {dietPlan.snacks.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                 )}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}


function MealSection({ title, suggestions, nutrition }: { title: string; suggestions?: string[]; nutrition?: MealNutrition }) {
    if (!suggestions || suggestions.length === 0) return null;
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary font-headline">{title}</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-semibold mb-2">Suggestions</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {suggestions.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
                {nutrition && (
                    <div className="p-4 rounded-lg bg-secondary/70">
                        <h4 className="font-semibold mb-3">Nutritional Targets</h4>
                        <div className="space-y-2 text-sm">
                           <NutritionRow icon={<Flame className="h-4 w-4 text-accent" />} label="Calories" value={nutrition.calories} />
                           <NutritionRow icon={<Beef className="h-4 w-4 text-accent" />} label="Protein" value={nutrition.protein} />
                           <NutritionRow icon={<Wheat className="h-4 w-4 text-accent" />} label="Carbs" value={nutrition.carbs} />
                           <NutritionRow icon={<Droplet className="h-4 w-4 text-accent" />} label="Fat" value={nutrition.fat} />
                        </div>
                    </div>
                )}
            </div>
            <Separator className="mt-4" />
        </div>
    )
}

function NutritionRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-muted-foreground">{label}</span>
            </div>
            <span className="font-semibold">{value}</span>
        </div>
    )
}
