import { forwardRef } from "react";
import { Wrench } from "lucide-react";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/ui/tag-input";
import { CareerFormStep } from "./CareerFormStep";

interface SkillsStepProps {
  data: {
    technical_skills: string[];
    soft_skills: string[];
    tools_technologies: string[];
    certifications: string[];
  };
  onChange: (field: string, value: string[]) => void;
}

export const SkillsStep = forwardRef<HTMLDivElement, SkillsStepProps>(
  ({ data, onChange }, ref) => {
    return (
      <CareerFormStep
        ref={ref}
        title="Skills & Exposure"
        description="Share your abilities and experiences"
        icon={<Wrench className="h-6 w-6" />}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Technical Skills</Label>
            <p className="text-sm text-muted-foreground">
              Programming languages, frameworks, technical abilities
            </p>
            <TagInput
              value={data.technical_skills}
              onChange={(tags) => onChange("technical_skills", tags)}
              placeholder="e.g., Python, JavaScript, Data Analysis..."
            />
          </div>
          
          <div className="space-y-2">
            <Label>Soft Skills</Label>
            <p className="text-sm text-muted-foreground">
              Communication, leadership, interpersonal skills
            </p>
            <TagInput
              value={data.soft_skills}
              onChange={(tags) => onChange("soft_skills", tags)}
              placeholder="e.g., Communication, Leadership, Problem-solving..."
            />
          </div>
          
          <div className="space-y-2">
            <Label>Tools / Technologies Known</Label>
            <p className="text-sm text-muted-foreground">
              Software, platforms, tools you're proficient with
            </p>
            <TagInput
              value={data.tools_technologies}
              onChange={(tags) => onChange("tools_technologies", tags)}
              placeholder="e.g., Excel, Figma, Git, AWS..."
            />
          </div>
          
          <div className="space-y-2">
            <Label>Certifications (if any)</Label>
            <p className="text-sm text-muted-foreground">
              Professional certifications you've earned
            </p>
            <TagInput
              value={data.certifications}
              onChange={(tags) => onChange("certifications", tags)}
              placeholder="e.g., AWS Certified, Google Analytics..."
            />
          </div>
        </div>
      </CareerFormStep>
    );
  }
);

SkillsStep.displayName = "SkillsStep";
