import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Trophy,
  Calendar,
  Target,
  ChevronRight,
  LogOut,
  Loader2,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  BarChart3,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import type { CareerApplication, CareerRecommendation, DailyPlanItem, DailyProgress } from "@/lib/supabase";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<CareerApplication | null>(null);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [reflectionInput, setReflectionInput] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);
  const [activeTab, setActiveTab] = useState("mirror");
  const [generatingMoreDays, setGeneratingMoreDays] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch application
      const { data: appData, error: appError } = await supabase
        .from("career_applications")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (appError) {
        // Handle specific errors
        if (appError.code === "PGRST116") {
          // No rows found - redirect to apply
          navigate("/apply");
          return;
        }
        console.error("Application fetch error:", appError);
        toast({
          variant: "destructive",
          title: "Error loading your data",
          description: "Please try refreshing the page.",
        });
        return;
      }

      if (!appData) {
        navigate("/apply");
        return;
      }

      if (appData.status !== "analyzed") {
        // Avoid redirect loops for "submitted" applications.
        if (appData.status === "draft") {
          navigate("/apply");
          return;
        }

        // "submitted" means analysis hasn't completed (or failed previously).
        // Show a clear state instead of bouncing between routes.
        setApplication(appData as unknown as CareerApplication);
        setProgress([]);
        return;
      }

      setApplication(appData as unknown as CareerApplication);

      // Fetch progress
      const { data: progressData, error: progressError } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("application_id", appData.id)
        .order("day_number", { ascending: true });

      if (progressError) {
        console.error("Progress fetch error:", progressError);
        // Non-critical - continue with empty progress
      }

      setProgress((progressData || []) as unknown as DailyProgress[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try refreshing the page.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (dayNumber: number) => {
    if (!application || !user) return;
    setSavingProgress(true);

    try {
      const existingProgress = progress.find((p) => p.day_number === dayNumber);

      if (existingProgress) {
        const { error } = await supabase
          .from("daily_progress")
          .update({
            completed: true,
            reflection_answer: reflectionInput || existingProgress.reflection_answer,
            completed_at: new Date().toISOString(),
          })
          .eq("id", existingProgress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("daily_progress").insert({
          user_id: user.id,
          application_id: application.id,
          day_number: dayNumber,
          completed: true,
          reflection_answer: reflectionInput,
          completed_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast({
        title: "Day completed!",
        description: "Great job on your progress. Keep going!",
      });

      setReflectionInput("");
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving progress",
        description: "Please try again.",
      });
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleGenerateMoreDays = async () => {
    if (!application || !user) return;
    
    const currentPlan = (application.daily_plan || []) as DailyPlanItem[];
    const currentDays = currentPlan.length;
    const targetDays = application.plan_duration_days || 30;
    
    if (currentDays >= targetDays) {
      toast({
        title: "Plan complete!",
        description: "You've reached your target number of days.",
      });
      return;
    }
    
    setGeneratingMoreDays(true);
    
    try {
      const careers = (application.career_recommendations || []) as CareerRecommendation[];
      const topCareer = careers[0]?.title || "your target career";
      
      const { data, error } = await supabase.functions.invoke("extend-daily-plan", {
        body: {
          applicationId: application.id,
          currentDays,
          targetDays,
          context: {
            fullName: application.full_name,
            topCareer,
            skills: application.technical_skills || [],
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Plan extended!",
        description: `Added ${data.newDays.length} more days to your plan.`,
      });
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error generating more days:", error);
      toast({
        variant: "destructive",
        title: "Error generating plan",
        description: "Please try again in a moment.",
      });
    } finally {
      setGeneratingMoreDays(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return null;
  }

  if (application.status !== "analyzed") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl mirror-gradient">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">Career Mirror</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="container py-10 px-4">
          <Card className="glass-card border-0 shadow-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-display">Your analysis isn’t ready yet</CardTitle>
              <CardDescription>
                Your application is saved, but the career analysis hasn’t been generated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={() => navigate("/apply")}>
                Go to application
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => fetchData()}
              >
                Refresh status
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const careers = (application.career_recommendations || []) as CareerRecommendation[];
  const dailyPlan = (application.daily_plan || []) as DailyPlanItem[];
  const completedDays = progress.filter((p) => p.completed).length;
  const totalDays = application.plan_duration_days || 0;
  const progressPercent = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  const currentDayPlan = dailyPlan.find((d) => d.day === selectedDay);
  const currentDayProgress = progress.find((p) => p.day_number === selectedDay);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl mirror-gradient">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">Career Mirror</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container py-8 px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome, {application.full_name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Your personalized career journey awaits
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="glass-card border-0 shadow-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">
                  {completedDays} of {totalDays} days completed
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1.5">
                {Math.round(progressPercent)}%
              </Badge>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="mirror" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Mirror</span>
            </TabsTrigger>
            <TabsTrigger value="careers" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Careers</span>
            </TabsTrigger>
            <TabsTrigger value="daily" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Daily Plan</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
          </TabsList>

          {/* Career Mirror Tab */}
          <TabsContent value="mirror" className="space-y-6 animate-fade-in">
            <Card className="glass-card border-0 shadow-card overflow-hidden">
              <div className="mirror-gradient p-6">
                <div className="flex items-center gap-3 text-primary-foreground">
                  <Sparkles className="h-6 w-6" />
                  <h2 className="text-xl font-display font-bold">Your Career Mirror</h2>
                </div>
                <p className="text-primary-foreground/80 mt-1">
                  A reflection of who you are and where you're headed
                </p>
              </div>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  {application.career_mirror_summary?.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-foreground/90 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Careers Tab */}
          <TabsContent value="careers" className="space-y-4 animate-fade-in">
            <div className="grid gap-4">
              {careers.map((career, index) => (
                <Card key={index} className="glass-card border-0 shadow-card overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-golden/10 text-golden font-bold text-lg">
                          #{career.rank}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-display">{career.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="h-4 w-4 text-golden fill-golden" />
                            <span className="font-semibold text-golden">{career.score}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Why This Fits You
                      </h4>
                      <p className="text-muted-foreground">{career.whyItFits}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Industry Relevance
                      </h4>
                      <p className="text-muted-foreground">{career.industryRelevance}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Skills to Improve</h4>
                      <div className="flex flex-wrap gap-2">
                        {career.skillsToImprove.map((skill, i) => (
                          <Badge key={i} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t">
                      {[
                        { label: "Market Demand", value: career.scoreBreakdown.marketDemand },
                        { label: "Salary Growth", value: career.scoreBreakdown.salaryGrowth },
                        { label: "Stability", value: career.scoreBreakdown.stability },
                        { label: "Personal Fit", value: career.scoreBreakdown.personalAlignment },
                      ].map((item) => (
                        <div key={item.label} className="text-center p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="font-bold text-lg">{item.value}/10</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Daily Plan Tab */}
          <TabsContent value="daily" className="space-y-4 animate-fade-in">
            {/* Progress indicator for plan generation */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="text-sm">
                <span className="font-medium">{dailyPlan.length}</span>
                <span className="text-muted-foreground"> of </span>
                <span className="font-medium">{totalDays}</span>
                <span className="text-muted-foreground"> days generated</span>
              </div>
              {dailyPlan.length < totalDays && (
                <Button
                  size="sm"
                  onClick={handleGenerateMoreDays}
                  disabled={generatingMoreDays}
                >
                  {generatingMoreDays ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Generate More Days
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4">
              {dailyPlan.map((day) => {
                const isCompleted = progress.some(
                  (p) => p.day_number === day.day && p.completed
                );
                const isSelected = selectedDay === day.day;

                return (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? "mirror-gradient text-primary-foreground shadow-card"
                        : isCompleted
                        ? "bg-success/10 text-success border-2 border-success/30"
                        : "bg-card border-2 border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-xs opacity-70">Day</span>
                    <span className="font-bold">{day.day}</span>
                  </button>
                );
              })}
            </div>

            {currentDayPlan && (
              <Card className="glass-card border-0 shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display">Day {selectedDay}</CardTitle>
                    {currentDayProgress?.completed && (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-lg font-medium text-foreground">
                    {currentDayPlan.focus}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Today's Task
                    </h4>
                    <p className="text-foreground/90">{currentDayPlan.task}</p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Estimated time: {currentDayPlan.timeRequired} minutes
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Reflection Question
                    </h4>
                    <p className="text-foreground/90 italic">"{currentDayPlan.reflection}"</p>
                    
                    {!currentDayProgress?.completed && (
                      <>
                        <Textarea
                          placeholder="Write your reflection here..."
                          value={reflectionInput}
                          onChange={(e) => setReflectionInput(e.target.value)}
                          rows={3}
                        />
                        <Button
                          onClick={() => handleMarkComplete(selectedDay)}
                          disabled={savingProgress}
                          className="w-full"
                        >
                          {savingProgress ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark Day Complete
                            </>
                          )}
                        </Button>
                      </>
                    )}
                    
                    {currentDayProgress?.completed && currentDayProgress.reflection_answer && (
                      <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-sm text-success-foreground">
                          <strong>Your reflection:</strong> {currentDayProgress.reflection_answer}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="glass-card border-0 shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary mx-auto mb-3 flex items-center justify-center">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-bold">{completedDays}</p>
                  <p className="text-muted-foreground">Days Completed</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-0 shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-xl bg-golden/10 text-golden mx-auto mb-3 flex items-center justify-center">
                    <Target className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-bold">{totalDays - completedDays}</p>
                  <p className="text-muted-foreground">Days Remaining</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-0 shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-xl bg-success/10 text-success mx-auto mb-3 flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-bold">
                    {progress.filter((p) => p.reflection_answer).length}
                  </p>
                  <p className="text-muted-foreground">Reflections Written</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card className="glass-card border-0 shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle className="font-display">Performance Overview</CardTitle>
                </div>
                <CardDescription>Your daily progress and completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    completed: { label: "Completed", color: "hsl(var(--success))" },
                    pending: { label: "Pending", color: "hsl(var(--muted))" },
                  }}
                  className="h-[250px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyPlan.slice(0, Math.min(dailyPlan.length, 14)).map((day) => {
                        const isCompleted = progress.some(
                          (p) => p.day_number === day.day && p.completed
                        );
                        return {
                          day: `Day ${day.day}`,
                          value: isCompleted ? 1 : 0.3,
                          status: isCompleted ? "completed" : "pending",
                        };
                      })}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name, item) => (
                              <span className="font-medium">
                                {item.payload.status === "completed" ? "✓ Completed" : "○ Pending"}
                              </span>
                            )}
                          />
                        }
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {dailyPlan.slice(0, Math.min(dailyPlan.length, 14)).map((day, index) => {
                          const isCompleted = progress.some(
                            (p) => p.day_number === day.day && p.completed
                          );
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={isCompleted ? "hsl(var(--success))" : "hsl(var(--muted))"}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                {dailyPlan.length > 14 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Showing first 14 days. Total: {dailyPlan.length} days.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-0 shadow-card">
              <CardHeader>
                <CardTitle className="font-display">Daily Progress Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dailyPlan.map((day) => {
                    const dayProgress = progress.find((p) => p.day_number === day.day);
                    const isCompleted = dayProgress?.completed;

                    return (
                      <div
                        key={day.day}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                          isCompleted ? "bg-success/5" : "bg-muted/30"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">Day {day.day}: {day.focus}</p>
                          {isCompleted && dayProgress?.completed_at && (
                            <p className="text-sm text-muted-foreground">
                              Completed on{" "}
                              {new Date(dayProgress.completed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDay(day.day);
                            setActiveTab("daily");
                          }}
                        >
                          View
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}