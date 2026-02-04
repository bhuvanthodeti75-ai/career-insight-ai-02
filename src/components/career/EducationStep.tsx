import { forwardRef } from "react";
import { GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CareerFormStep } from "./CareerFormStep";

interface EducationStepProps {
  data: {
    highest_qualification: string;
    field_of_study: string;
    current_status: string;
    graduation_year: string;
  };
  onChange: (field: string, value: string) => void;
}

const qualifications = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Professional Certification",
  "Other",
];

const currentStatuses = [
  "Student",
  "Fresh Graduate",
  "Working Professional (0-2 years)",
  "Working Professional (2-5 years)",
  "Working Professional (5+ years)",
  "Career Transition",
];

export const EducationStep = forwardRef<HTMLDivElement, EducationStepProps>(
  ({ data, onChange }, ref) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 15 }, (_, i) => String(currentYear - 7 + i));

    return (
      <CareerFormStep
        ref={ref}
        title="Educational Background"
        description="Tell us about your academic journey"
        icon={<GraduationCap className="h-6 w-6" />}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="highest_qualification">Highest Qualification *</Label>
            <Select
              value={data.highest_qualification}
              onValueChange={(value) => onChange("highest_qualification", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select qualification" />
              </SelectTrigger>
              <SelectContent>
                {qualifications.map((qual) => (
                  <SelectItem key={qual} value={qual}>
                    {qual}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="field_of_study">Field / Stream of Study *</Label>
            <Input
              id="field_of_study"
              value={data.field_of_study}
              onChange={(e) => onChange("field_of_study", e.target.value)}
              placeholder="e.g., Computer Science, Commerce, Arts"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_status">Current Status *</Label>
            <Select
              value={data.current_status}
              onValueChange={(value) => onChange("current_status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your status" />
              </SelectTrigger>
              <SelectContent>
                {currentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduation_year">Year of Graduation / Current Year *</Label>
            <Select
              value={data.graduation_year}
              onValueChange={(value) => onChange("graduation_year", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CareerFormStep>
    );
  }
);

EducationStep.displayName = "EducationStep";
