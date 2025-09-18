
export interface OnboardingData {
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
  safetyAdvice: string;
}
