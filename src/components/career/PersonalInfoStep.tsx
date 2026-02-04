import { forwardRef } from "react";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CareerFormStep } from "./CareerFormStep";

interface PersonalInfoStepProps {
  data: {
    full_name: string;
    email: string;
    age: string;
    current_city: string;
  };
  onChange: (field: string, value: string) => void;
}

export const PersonalInfoStep = forwardRef<HTMLDivElement, PersonalInfoStepProps>(
  ({ data, onChange }, ref) => {
    return (
      <CareerFormStep
        ref={ref}
        title="Personal Information"
        description="Let's start with the basics about you"
        icon={<User className="h-6 w-6" />}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={data.full_name}
              onChange={(e) => onChange("full_name", e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email ID *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              value={data.age}
              onChange={(e) => onChange("age", e.target.value)}
              placeholder="25"
              min="16"
              max="70"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_city">Current City / Region *</Label>
            <Input
              id="current_city"
              value={data.current_city}
              onChange={(e) => onChange("current_city", e.target.value)}
              placeholder="Mumbai, India"
              required
            />
          </div>
        </div>
      </CareerFormStep>
    );
  }
);

PersonalInfoStep.displayName = "PersonalInfoStep";
