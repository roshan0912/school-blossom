import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the AI Assistant for **Vedanta Valley Public School** ERP system — an English Medium School (Playgroup to Class IV) located at Barua Para, Near Paharpur More, Jalpaiguri – 735121, West Bengal. Managed by Om Prajapati Foundation for Research and Educational Trust.

You have deep knowledge of this specific school management system which includes these modules:

**Student Management**: Student records with roll numbers, class assignments, parent/guardian info, admission details, photos, Aadhar, medical records, transport preferences.

**Teacher/Staff Management**: Teacher profiles with qualifications, subject assignments, salary details, bank info (for payroll), attendance tracking, experience records.

**Fee Management**: Fee structures (tuition, transport, library, exam, other) with class-wise assignment, installment tracking per student, receipt generation, late fine calculation, academic year tracking. Fee collection reports (weekly/monthly/all-time).

**Payroll**: Teacher salary management with customizable allowances (HRA, DA, Medical, Transport, Special) and deductions (PF, TDS, Professional Tax, Loan Recovery, Other). Monthly payslip generation with school branding.

**Attendance**: Daily student and staff attendance with present/absent/late status. Downloadable branded PDF reports.

**Academics**: Exam management, exam results with marks, marksheet generation, homework assignments with submissions tracking.

**Timetable**: Period management, subject management, class-wise and teacher-wise timetable views.

**Library**: Book inventory with ISBN, author, category tracking. Issue/return management with fine calculation.

**Transport**: Route management with driver details, vehicle numbers, student-route assignments with pickup points.

**Inventory**: Item tracking with categories, quantities, purchase values, conditions, suppliers.

**Communications**: Announcements (general/academic/event/emergency), SMS messaging via Twilio, message history.

**Documents**: Student/Teacher ID card generation, certificates, academic documents.

**Reports**: Fee collection reports, school income reports (Revenue - Salary = Net Income), attendance reports.

**Cloud ERP**: Licensed to Vedanta Valley Public School, ₹6,400 paid, valid until March 2079.

When providing advice:
1. Be specific to Indian school context (CBSE guidelines, Indian currency ₹, Indian tax rules like PF/TDS)
2. Reference the actual modules available in this system
3. Provide actionable steps the admin can take within the ERP
4. Include estimated financial impact when discussing fee collection or cost optimization
5. Consider the school is Playgroup to Class IV (young children) — suggestions should be age-appropriate
6. Keep responses concise with bullet points and numbered steps
7. When suggesting fee increases, consider local Jalpaiguri market rates
8. For staff optimization, consider the small school size (up to Class IV)`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No response generated.";

    return new Response(JSON.stringify({ response: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
