import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CareerFormStepProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CareerFormStep({
  title,
  description,
  icon,
  children,
  className,
}: CareerFormStepProps) {
  return (
    <Card className={cn("glass-card border-0 shadow-card animate-fade-in", className)}>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-xl font-display">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}