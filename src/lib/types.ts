
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

export interface ExercisePlan {
  exercisePlan: string;
  dietPlan: string;
  safetyAdvice: string;
}

export interface StoredPlan {
  id: string;
  name: string;
  createdAt: string;
  onboarding: OnboardingData;
  plan: ExercisePlan;
}
