import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CareerApplication {
  full_name: string;
  email: string;
  age: number;
  current_city: string;
  highest_qualification: string;
  field_of_study: string;
  current_status: string;
  graduation_year: string;
  technical_skills: string[];
  soft_skills: string[];
  tools_technologies: string[];
  certifications: string[];
  subjects_enjoyed: string[];
  areas_of_interest: string[];
  work_preference: string;
  work_style: string;
  strengths: string[];
  weaknesses: string[];
  work_environment: string;
  problem_solving_preference: string;
  long_term_goal: string;
  industries_of_interest: string[];
  willing_to_learn: boolean;
  salary_expectation: number;
  plan_duration_days: number;
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

    const { application } = await req.json() as { application: CareerApplication };

    const systemPrompt = `You are Career Mirror, an expert career counselor and psychologist with deep insight into human potential. Your role is to analyze a person's complete profile and provide:

1. A deeply personal "Career Mirror" summary that reflects their personality, learning behavior, work mindset, and career inclination. This should sound human, reflective, and insightful - like a wise mentor speaking directly to them. Not robotic or generic.

2. Exactly 5-6 carefully chosen career recommendations that are:
   - Realistic for their background and education level
   - Market-relevant and in-demand
   - Achievable with dedicated effort
   - Aligned with their personality and preferences
   - Matched to their salary expectations (₹${application.salary_expectation} LPA target)

3. For each career, provide:
   - Job title
   - Why this career fits them specifically (personalized reasoning)
   - Skills they need to improve
   - Industry relevance and growth potential
   - A ranking from 1-10 based on: market demand, salary growth, career stability, and personal alignment

4. A detailed day-by-day career growth plan for ${application.plan_duration_days} days, where each day includes:
   - Day number
   - Skill or topic to focus on
   - A small actionable task
   - Estimated time required (in minutes)
   - One reflection question to encourage self-awareness

Be thoughtful, precise, and encouraging. Never give generic advice - everything must be tailored to this specific person.`;

    const userPrompt = `Analyze this career application and provide comprehensive career guidance:

PERSONAL INFORMATION:
- Name: ${application.full_name}
- Age: ${application.age}
- Location: ${application.current_city}

EDUCATION:
- Highest Qualification: ${application.highest_qualification}
- Field of Study: ${application.field_of_study}
- Current Status: ${application.current_status}
- Year: ${application.graduation_year}

SKILLS & EXPOSURE:
- Technical Skills: ${application.technical_skills.join(", ") || "None specified"}
- Soft Skills: ${application.soft_skills.join(", ") || "None specified"}
- Tools/Technologies: ${application.tools_technologies.join(", ") || "None specified"}
- Certifications: ${application.certifications.join(", ") || "None"}

INTERESTS & INCLINATIONS:
- Subjects Enjoyed: ${application.subjects_enjoyed.join(", ") || "None specified"}
- Areas of Interest: ${application.areas_of_interest.join(", ") || "None specified"}
- Work Preference: ${application.work_preference}
- Work Style: ${application.work_style}

PERSONALITY & VALUES:
- Strengths: ${application.strengths.join(", ") || "None specified"}
- Weaknesses: ${application.weaknesses.join(", ") || "None specified"}
- Preferred Environment: ${application.work_environment}
- Problem-solving Preference: ${application.problem_solving_preference}

CAREER VISION:
- Long-term Goal: ${application.long_term_goal || "Not specified"}
- Industries of Interest: ${application.industries_of_interest.join(", ") || "None specified"}
- Willing to Learn New Skills: ${application.willing_to_learn ? "Yes" : "No"}
- Target Salary: ₹${application.salary_expectation} LPA
- Plan Duration: ${application.plan_duration_days} days

Provide your response in the following JSON format:
{
  "careerMirror": "A 3-4 paragraph deeply personal reflection...",
  "careers": [
    {
      "rank": 1,
      "title": "Job Title",
      "whyItFits": "Personalized explanation...",
      "skillsToImprove": ["skill1", "skill2"],
      "industryRelevance": "Explanation of market demand...",
      "score": 9.2,
      "scoreBreakdown": {
        "marketDemand": 9,
        "salaryGrowth": 9,
        "stability": 8,
        "personalAlignment": 10
      }
    }
  ],
  "dailyPlan": [
    {
      "day": 1,
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
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response - handle markdown code blocks
    let jsonContent = content;
    
    // Remove markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    const analysis = JSON.parse(jsonContent);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Career analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
