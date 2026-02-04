import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sparkles, 
  Target, 
  Calendar, 
  Trophy, 
  ArrowRight, 
  CheckCircle2,
  Users,
  TrendingUp,
  Zap,
  LayoutDashboard
} from "lucide-react";

export default function Index() {
  const { user } = useAuth();

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Career Mirror",
      description: "AI-powered deep analysis that reflects your true personality, strengths, and career inclinations.",
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Ranked Recommendations",
      description: "5-6 carefully curated career paths ranked by market demand, salary growth, and personal fit.",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Daily Growth Plan",
      description: "Personalized day-by-day tasks and reflections to guide your career development journey.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Visual dashboard to monitor your growth, completed tasks, and reflection insights.",
    },
  ];

  const steps = [
    { number: "01", title: "Complete Your Profile", description: "Fill out a comprehensive career application form" },
    { number: "02", title: "AI Analysis", description: "Our AI deeply analyzes your profile and aspirations" },
    { number: "03", title: "Receive Your Mirror", description: "Get personalized career insights and recommendations" },
    { number: "04", title: "Follow Your Plan", description: "Execute your daily growth plan and track progress" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient">
        <div className="container px-4 pt-16 pb-24">
          {/* Header */}
          <header className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl mirror-gradient">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">Career Mirror</span>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="default" size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </header>

          {/* Hero Content */}
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              Discover Your <span className="text-gradient-primary">Ideal Career Path</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-powered career guidance that deeply understands you. Get personalized 
              recommendations, a tailored growth plan, and daily tasks to achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 shadow-card">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 h-14">
                Learn More
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-16">
            {[
              { icon: <Users className="h-5 w-5" />, value: "10K+", label: "Career Plans Created" },
              { icon: <TrendingUp className="h-5 w-5" />, value: "85%", label: "Goal Achievement" },
              { icon: <Zap className="h-5 w-5" />, value: "5 min", label: "Average Analysis" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-2">
                  {stat.icon}
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Everything You Need for Career Clarity
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive career guidance system that goes beyond generic advice
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="glass-card border-0 shadow-card hover:shadow-elevated transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your journey to career clarity in four simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-display font-bold text-primary/20 mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <ArrowRight className="h-6 w-6 text-primary/30 -ml-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 mirror-gradient">
        <div className="container px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground mb-4">
            Ready to Discover Your Path?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands who have found career clarity with Career Mirror. 
            One profile, one focused journey, endless possibilities.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 h-14">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t">
        <div className="container px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg mirror-gradient">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">Career Mirror</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Career Mirror. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}