import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DailyPlanItem {
  day: number;
  focus: string;
  task: string;
  timeRequired: number;
  reflection: string;
}

interface ExtendRequest {
  applicationId: string;
  currentDays: number;
  targetDays: number;
  context: {
    fullName: string;
    topCareer: string;
    skills: string[];
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { applicationId, currentDays, targetDays, context } = await req.json() as ExtendRequest;

    // Calculate how many more days to generate (max 7 at a time to avoid truncation)
    const daysToGenerate = Math.min(7, targetDays - currentDays);
    const startDay = currentDays + 1;
    const endDay = currentDays + daysToGenerate;

    const systemPrompt = `You are Career Mirror, generating a continuation of an existing career development plan. Generate ONLY days ${startDay} to ${endDay} (${daysToGenerate} days total).

Each day must include:
- Day number (starting at ${startDay})
- Skill or topic to focus on
- A small actionable task
- Estimated time required (in minutes)
- One reflection question

Be progressive - build on skills from earlier days. Keep tasks practical and achievable.`;

    const userPrompt = `Generate days ${startDay} to ${endDay} of a career growth plan for:
- Name: ${context.fullName}
- Target Career: ${context.topCareer}
- Key Skills: ${context.skills.join(", ")}

Return ONLY valid JSON in this exact format:
{
  "dailyPlan": [
    {
      "day": ${startDay},
      "focus": "Topic/Skill to focus on",
      "task": "Specific actionable task",
      "timeRequired": 45,
      "reflection": "A thought-provoking question?"
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    const extractJson = (response: string): { dailyPlan: DailyPlanItem[] } => {
      let cleaned = response
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON object found");
      }

      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      cleaned = cleaned
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/[\x00-\x1F\x7F]/g, "")
        .replace(/\n/g, " ");

      return JSON.parse(cleaned);
    };

    const parsed = extractJson(content);
    const newDays = parsed.dailyPlan || [];

    // Fetch current application
    const { data: appData, error: appError } = await supabase
      .from("career_applications")
      .select("daily_plan")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .single();

    if (appError || !appData) {
      throw new Error("Application not found");
    }

    const existingPlan = (appData.daily_plan || []) as DailyPlanItem[];
    const updatedPlan = [...existingPlan, ...newDays];

    // Update application with extended plan
    const { error: updateError } = await supabase
      .from("career_applications")
      .update({ daily_plan: updatedPlan })
      .eq("id", applicationId)
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        newDays,
        totalDays: updatedPlan.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Extend plan error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to extend your plan. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
