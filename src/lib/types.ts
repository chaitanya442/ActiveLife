

export interface OnboardingData {
  planName?: string;
  age: number;
  sex: "male" | "female" | "other";
  height: number;
  weight: number;
  medicalHistory?: string;
  medicalPdf?: string;
  fitnessGoals?: string;
}

export interface UserData extends OnboardingData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface DailyExercise {
  day: string;
  focus: string;
  exercises: {
    name: string;
    sets: string;
    reps: string;
  }[];
}

export interface DetailedDietPlan {
    summary: string;
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
}

export interface ExercisePlan {
  exercisePlan: DailyExercise[] | string; // Allow for old string format
  dietPlan: DetailedDietPlan | string; // Allow for old string format
  macros?: { // Make macros optional
    carbs: number;
    protein: number;
    fat: number;
  };
  safetyAdvice: string;
}

export interface StoredPlan {
  id: string;
  name: string;
  createdAt: string;
  onboarding: OnboardingData;
  plan: ExercisePlan;
}

export interface ExtractHighlightsOutput {
  highlights: string;
  age?: number;
  sex?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
}
