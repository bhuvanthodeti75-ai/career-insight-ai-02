import { Heart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TagInput } from "@/components/ui/tag-input";
import { CareerFormStep } from "./CareerFormStep";

interface InterestsStepProps {
  data: {
    subjects_enjoyed: string[];
    areas_of_interest: string[];
    work_preference: string;
    work_style: string;
  };
  onChange: (field: string, value: string | string[]) => void;
}

export function InterestsStep({ data, onChange }: InterestsStepProps) {
  return (
    <CareerFormStep
      title="Interests & Inclinations"
      description="What excites you and how do you prefer to work"
      icon={<Heart className="h-6 w-6" />}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Subjects You Enjoyed the Most</Label>
          <p className="text-sm text-muted-foreground">
            Academic subjects or topics that genuinely interested you
          </p>
          <TagInput
            value={data.subjects_enjoyed}
            onChange={(tags) => onChange("subjects_enjoyed", tags)}
            placeholder="e.g., Mathematics, Psychology, Design..."
          />
        </div>

        <div className="space-y-2">
          <Label>Areas of Strong Interest</Label>
          <p className="text-sm text-muted-foreground">
            Fields or domains you're passionate about
          </p>
          <TagInput
            value={data.areas_of_interest}
            onChange={(tags) => onChange("areas_of_interest", tags)}
            placeholder="e.g., AI/ML, Sustainable Energy, Healthcare..."
          />
        </div>

        <div className="space-y-3">
          <Label>Type of Work Preferred *</Label>
          <RadioGroup
            value={data.work_preference}
            onValueChange={(value) => onChange("work_preference", value)}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { value: "technical", label: "Technical", desc: "Building, coding, analyzing" },
              { value: "analytical", label: "Analytical", desc: "Research, data, strategy" },
              { value: "creative", label: "Creative", desc: "Design, content, innovation" },
              { value: "people_oriented", label: "People-Oriented", desc: "Managing, helping, connecting" },
            ].map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={option.value}
                  className="flex cursor-pointer flex-col rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                >
                  <span className="font-semibold">{option.label}</span>
                  <span className="text-sm text-muted-foreground">{option.desc}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Preferred Work Style *</Label>
          <RadioGroup
            value={data.work_style}
            onValueChange={(value) => onChange("work_style", value)}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { value: "individual", label: "Individual", desc: "Independent, focused work" },
              { value: "team_based", label: "Team-Based", desc: "Collaborative, group work" },
            ].map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={`style-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`style-${option.value}`}
                  className="flex cursor-pointer flex-col rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                >
                  <span className="font-semibold">{option.label}</span>
                  <span className="text-sm text-muted-foreground">{option.desc}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </CareerFormStep>
  );
}