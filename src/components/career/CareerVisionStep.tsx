import { forwardRef } from "react";
import { Target, IndianRupee, Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { CareerFormStep } from "./CareerFormStep";

interface CareerVisionStepProps {
  data: {
    long_term_goal: string;
    industries_of_interest: string[];
    willing_to_learn: boolean;
    salary_expectation: number;
    plan_duration_days: number;
  };
  onChange: (field: string, value: string | string[] | boolean | number) => void;
}

export const CareerVisionStep = forwardRef<HTMLDivElement, CareerVisionStepProps>(
  ({ data, onChange }, ref) => {
    return (
      <CareerFormStep
        ref={ref}
        title="Career Intent & Vision"
        description="Your goals and aspirations for the future"
        icon={<Target className="h-6 w-6" />}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="long_term_goal">Long-Term Career Goal</Label>
            <p className="text-sm text-muted-foreground">
              Where do you see yourself in 5-10 years?
            </p>
            <Textarea
              id="long_term_goal"
              value={data.long_term_goal}
              onChange={(e) => onChange("long_term_goal", e.target.value)}
              placeholder="Describe your career vision... e.g., 'Lead a product team at a tech company' or 'Start my own consultancy'"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Industries of Interest</Label>
            <p className="text-sm text-muted-foreground">
              Which industries attract you?
            </p>
            <TagInput
              value={data.industries_of_interest}
              onChange={(tags) => onChange("industries_of_interest", tags)}
              placeholder="e.g., Technology, Healthcare, Finance, Education..."
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Willingness to Learn New Skills</Label>
              <p className="text-sm text-muted-foreground">
                Are you open to learning new things for your career?
              </p>
            </div>
            <Switch
              checked={data.willing_to_learn}
              onCheckedChange={(checked) => onChange("willing_to_learn", checked)}
            />
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              <Label>Salary Expectation: ₹{data.salary_expectation} LPA</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              This helps tailor career recommendations to match your expectations
            </p>
            <Slider
              value={[data.salary_expectation]}
              onValueChange={(value) => onChange("salary_expectation", value[0])}
              min={0}
              max={20}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>₹0 LPA</span>
              <span>₹20 LPA</span>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <Label>Career Plan Duration: {data.plan_duration_days} days</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              How long do you want your personalized career development plan to be?
            </p>
            <Slider
              value={[data.plan_duration_days]}
              onValueChange={(value) => onChange("plan_duration_days", value[0])}
              min={7}
              max={365}
              step={7}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 week</span>
              <span>6 months</span>
              <span>1 year</span>
            </div>
          </div>
        </div>
      </CareerFormStep>
    );
  }
);

CareerVisionStep.displayName = "CareerVisionStep";
