// Career Map Types for Mentor-Mentee App
export interface GapAnalysis {
  strong: string[];
  medium: string[];
  missing: string[];
}

export interface WeeklyItem {
  week: number;
  goals: string[];
  resources: string[];
  deliverable: string;
}

export interface RoleSnapshot {
  title: string;
  level: string;
  keySkills: string[];
  averageSalary: string;
  description: string;
}

export interface CapstoneProject {
  title: string;
  steps: string[];
  expectedOutcome: string;
}

export interface CareerMap {
  roleSnapshot: RoleSnapshot;
  gapAnalysis: GapAnalysis;
  weeklyPlan: WeeklyItem[];
  capstone: CapstoneProject;
}

export interface CareerIntakeData {
  currentRole: string;
  currentSkills: string[];
  targetRole: string;
  hoursPerWeek: number;
  budget: number;
}

export interface ProgressItem {
  week: number;
  goalIndex: number;
  completed: boolean;
  completedDate?: string;
}

export interface MentorReviewData {
  weekNumber: number;
  feedback: string;
  approved: boolean;
  recommendations: string[];
  reviewDate: string;
}
