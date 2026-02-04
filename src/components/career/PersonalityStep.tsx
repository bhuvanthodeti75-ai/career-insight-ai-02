import { forwardRef } from "react";
import { Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { CareerFormStep } from "./CareerFormStep";

interface PersonalityStepProps {
  data: {
    strengths: string[];
    weaknesses: string[];
    work_environment: string;
    problem_solving_preference: string;
  };
  onChange: (field: string, value: string | string[]) => void;
}

export const PersonalityStep = forwardRef<HTMLDivElement, PersonalityStepProps>(
  ({ data, onChange }, ref) => {
    return (
      <CareerFormStep
        ref={ref}
        title="Personality & Work Values"
        description="Understanding your character and preferences"
        icon={<Sparkles className="h-6 w-6" />}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Your Strengths</Label>
            <p className="text-sm text-muted-foreground">
              What are you naturally good at?
            </p>
            <TagInput
              value={data.strengths}
              onChange={(tags) => onChange("strengths", tags)}
              placeholder="e.g., Quick learner, Detail-oriented, Creative thinker..."
            />
          </div>

          <div className="space-y-2">
            <Label>Your Weaknesses / Areas to Improve</Label>
            <p className="text-sm text-muted-foreground">
              Be honest - self-awareness is valuable
            </p>
            <TagInput
              value={data.weaknesses}
              onChange={(tags) => onChange("weaknesses", tags)}
              placeholder="e.g., Public speaking, Time management..."
            />
          </div>

          <div className="space-y-3">
            <Label>Preferred Work Environment *</Label>
            <RadioGroup
              value={data.work_environment}
              onValueChange={(value) => onChange("work_environment", value)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                { value: "startup", label: "Startup", desc: "Fast-paced, innovative, flexible" },
                { value: "corporate", label: "Corporate", desc: "Structured, stable, established" },
                { value: "flexible_hybrid", label: "Flexible / Hybrid", desc: "Best of both worlds" },
              ].map((option) => (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={`env-${option.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`env-${option.value}`}
                    className="flex cursor-pointer flex-col rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <span className="font-semibold">{option.label}</span>
                    <span className="text-sm text-muted-foreground">{option.desc}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem_solving">Problem-Solving vs Execution Preference</Label>
            <p className="text-sm text-muted-foreground">
              Do you prefer figuring out solutions or executing known tasks?
            </p>
            <Textarea
              id="problem_solving"
              value={data.problem_solving_preference}
              onChange={(e) => onChange("problem_solving_preference", e.target.value)}
              placeholder="Describe your preference... e.g., 'I enjoy solving complex problems and finding creative solutions' or 'I prefer clear tasks with defined outcomes'"
              rows={3}
            />
          </div>
        </div>
      </CareerFormStep>
    );
  }
);

PersonalityStep.displayName = "PersonalityStep";
