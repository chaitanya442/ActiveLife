
export interface OnboardingData {
  age: number;
  sex: "male" | "female" | "other";
  height: number;
  weight: number;
  medicalHistory?: string;
}

export interface UserData extends OnboardingData {
  fitnessGoals: string;
}

export interface RiskAssessment {
  riskAssessment: string;
  contraindications: string;
}

export interface ExercisePlan {
  exercisePlan: string;
  safetyAdvice: string;
}

export interface FullAppUserData extends UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  riskAssessment?: RiskAssessment;
  exercisePlan?: ExercisePlan;
}
