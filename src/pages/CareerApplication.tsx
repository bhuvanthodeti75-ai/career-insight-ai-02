import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/ui/step-indicator";
import { PersonalInfoStep } from "@/components/career/PersonalInfoStep";
import { EducationStep } from "@/components/career/EducationStep";
import { SkillsStep } from "@/components/career/SkillsStep";
import { InterestsStep } from "@/components/career/InterestsStep";
import { PersonalityStep } from "@/components/career/PersonalityStep";
import { CareerVisionStep } from "@/components/career/CareerVisionStep";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Loader2, Send, Sparkles } from "lucide-react";

const STEPS = ["Personal", "Education", "Skills", "Interests", "Personality", "Vision"];

interface FormData {
  full_name: string;
  email: string;
  age: string;
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
  work_preference: string;
  work_style: string;
  strengths: string[];
  weaknesses: string[];
  work_environment: string;
  problem_solving_preference: string;
  long_term_goal: string;
  industries_of_interest: string[];
  willing_to_learn: boolean;
  salary_expectation: number;
  plan_duration_days: number;
}

export default function CareerApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: user?.email || "",
    age: "",
    current_city: "",
    highest_qualification: "",
    field_of_study: "",
    current_status: "",
    graduation_year: "",
    technical_skills: [],
    soft_skills: [],
    tools_technologies: [],
    certifications: [],
    subjects_enjoyed: [],
    areas_of_interest: [],
    work_preference: "",
    work_style: "",
    strengths: [],
    weaknesses: [],
    work_environment: "",
    problem_solving_preference: "",
    long_term_goal: "",
    industries_of_interest: [],
    willing_to_learn: true,
    salary_expectation: 5,
    plan_duration_days: 30,
  });

  useEffect(() => {
    if (user) {
      checkExistingApplication();
    }
  }, [user]);

  const checkExistingApplication = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from("career_applications")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data && data.status !== "draft") {
      setExistingApplication(true);
      navigate("/dashboard");
    } else if (data) {
      // Load existing draft
      setFormData({
        full_name: data.full_name || "",
        email: data.email || user?.email || "",
        age: String(data.age) || "",
        current_city: data.current_city || "",
        highest_qualification: data.highest_qualification || "",
        field_of_study: data.field_of_study || "",
        current_status: data.current_status || "",
        graduation_year: data.graduation_year || "",
        technical_skills: data.technical_skills || [],
        soft_skills: data.soft_skills || [],
        tools_technologies: data.tools_technologies || [],
        certifications: data.certifications || [],
        subjects_enjoyed: data.subjects_enjoyed || [],
        areas_of_interest: data.areas_of_interest || [],
        work_preference: data.work_preference || "",
        work_style: data.work_style || "",
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        work_environment: data.work_environment || "",
        problem_solving_preference: data.problem_solving_preference || "",
        long_term_goal: data.long_term_goal || "",
        industries_of_interest: data.industries_of_interest || [],
        willing_to_learn: data.willing_to_learn ?? true,
        salary_expectation: data.salary_expectation || 5,
        plan_duration_days: data.plan_duration_days || 30,
      });
    }
    setLoading(false);
  };

  const handleFieldChange = (field: string, value: string | string[] | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        return formData.full_name && formData.email && formData.age && formData.current_city;
      case 1:
        return formData.highest_qualification && formData.field_of_study && 
               formData.current_status && formData.graduation_year;
      case 2:
        return true; // Skills are optional
      case 3:
        return formData.work_preference && formData.work_style;
      case 4:
        return formData.work_environment;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast({
        variant: "destructive",
        title: "Required fields missing",
        description: "Please fill in all required fields before continuing.",
      });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!validateStep()) {
      toast({
        variant: "destructive",
        title: "Required fields missing",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setSubmitting(true);

    try {
      // First, save or update the application
      const applicationData = {
        user_id: user.id,
        status: "submitted" as const,
        full_name: formData.full_name,
        email: formData.email,
        age: parseInt(formData.age),
        current_city: formData.current_city,
        highest_qualification: formData.highest_qualification,
        field_of_study: formData.field_of_study,
        current_status: formData.current_status,
        graduation_year: formData.graduation_year,
        technical_skills: formData.technical_skills,
        soft_skills: formData.soft_skills,
        tools_technologies: formData.tools_technologies,
        certifications: formData.certifications,
        subjects_enjoyed: formData.subjects_enjoyed,
        areas_of_interest: formData.areas_of_interest,
        work_preference: formData.work_preference as "technical" | "analytical" | "creative" | "people_oriented",
        work_style: formData.work_style as "individual" | "team_based",
        strengths: formData.strengths,
        weaknesses: formData.weaknesses,
        work_environment: formData.work_environment as "startup" | "corporate" | "flexible_hybrid",
        problem_solving_preference: formData.problem_solving_preference,
        long_term_goal: formData.long_term_goal,
        industries_of_interest: formData.industries_of_interest,
        willing_to_learn: formData.willing_to_learn,
        salary_expectation: formData.salary_expectation,
        plan_duration_days: formData.plan_duration_days,
      };

      const { data: application, error: appError } = await supabase
        .from("career_applications")
        .upsert(applicationData, { onConflict: "user_id" })
        .select()
        .single();

      if (appError) throw appError;

      // Call OpenAI for career analysis
      toast({
        title: "Analyzing your profile...",
        description: "This may take a minute. Our AI is crafting your personalized career insights.",
      });

      const response = await supabase.functions.invoke("career-analysis", {
        body: { application: applicationData },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const analysis = response.data;

      // Update the application with AI results
      const { error: updateError } = await supabase
        .from("career_applications")
        .update({
          status: "analyzed",
          career_mirror_summary: analysis.careerMirror,
          career_recommendations: analysis.careers,
          daily_plan: analysis.dailyPlan,
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Career Mirror Complete!",
        description: "Your personalized career guidance is ready.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient">
      <div className="container max-w-3xl py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mirror-gradient mb-3">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Career Application
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete your profile for personalized career guidance
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} className="mb-8" />

        {/* Form Steps */}
        <div className="mb-8">
          {currentStep === 0 && (
            <PersonalInfoStep
              data={{
                full_name: formData.full_name,
                email: formData.email,
                age: formData.age,
                current_city: formData.current_city,
              }}
              onChange={handleFieldChange}
            />
          )}
          {currentStep === 1 && (
            <EducationStep
              data={{
                highest_qualification: formData.highest_qualification,
                field_of_study: formData.field_of_study,
                current_status: formData.current_status,
                graduation_year: formData.graduation_year,
              }}
              onChange={handleFieldChange}
            />
          )}
          {currentStep === 2 && (
            <SkillsStep
              data={{
                technical_skills: formData.technical_skills,
                soft_skills: formData.soft_skills,
                tools_technologies: formData.tools_technologies,
                certifications: formData.certifications,
              }}
              onChange={handleFieldChange}
            />
          )}
          {currentStep === 3 && (
            <InterestsStep
              data={{
                subjects_enjoyed: formData.subjects_enjoyed,
                areas_of_interest: formData.areas_of_interest,
                work_preference: formData.work_preference,
                work_style: formData.work_style,
              }}
              onChange={handleFieldChange}
            />
          )}
          {currentStep === 4 && (
            <PersonalityStep
              data={{
                strengths: formData.strengths,
                weaknesses: formData.weaknesses,
                work_environment: formData.work_environment,
                problem_solving_preference: formData.problem_solving_preference,
              }}
              onChange={handleFieldChange}
            />
          )}
          {currentStep === 5 && (
            <CareerVisionStep
              data={{
                long_term_goal: formData.long_term_goal,
                industries_of_interest: formData.industries_of_interest,
                willing_to_learn: formData.willing_to_learn,
                salary_expectation: formData.salary_expectation,
                plan_duration_days: formData.plan_duration_days,
              }}
              onChange={handleFieldChange}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || submitting}
            className="flex-1 sm:flex-none"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="flex-1 sm:flex-none">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1 sm:flex-none">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Get Career Insights
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}