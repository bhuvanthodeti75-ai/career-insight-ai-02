import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type CareerApplication = {
  id: string;
  user_id: string;
  status: "draft" | "submitted" | "analyzed";
  full_name: string;
  email: string;
  age: number;
  current_city: string;
  highest_qualification: string;
  field_of_study: string;
  current_status: string;
  graduation_year: string;
  technical_skills: string[];
  soft_skills: string[];
  tools_technologies: string[];
  certifications: string[];
  subjects_enjoyed: string[];
  areas_of_interest: string[];
  work_preference: "technical" | "analytical" | "creative" | "people_oriented" | null;
  work_style: "individual" | "team_based" | null;
  strengths: string[];
  weaknesses: string[];
  work_environment: "startup" | "corporate" | "flexible_hybrid" | null;
  problem_solving_preference: string | null;
  long_term_goal: string | null;
  industries_of_interest: string[];
  willing_to_learn: boolean;
  salary_expectation: number;
  plan_duration_days: number;
  career_mirror_summary: string | null;
  career_recommendations: CareerRecommendation[] | null;
  daily_plan: DailyPlanItem[] | null;
  created_at: string;
  updated_at: string;
};

export type CareerRecommendation = {
  rank: number;
  title: string;
  whyItFits: string;
  skillsToImprove: string[];
  industryRelevance: string;
  score: number;
  scoreBreakdown: {
    marketDemand: number;
    salaryGrowth: number;
    stability: number;
    personalAlignment: number;
  };
};

export type DailyPlanItem = {
  day: number;
  focus: string;
  task: string;
  timeRequired: number;
  reflection: string;
};

export type DailyProgress = {
  id: string;
  user_id: string;
  application_id: string;
  day_number: number;
  completed: boolean;
  reflection_answer: string | null;
  completed_at: string | null;
  created_at: string;
};