import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2, TrendingUp, IndianRupee, Users, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardStats, useTotalIncome } from "@/hooks/useDashboardStats";
import { useFeeInstallments } from "@/hooks/useFees";
import { formatINR } from "@/lib/pdfGenerator";
import { toast } from "sonner";

export default function AiAssistant() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: stats } = useDashboardStats();
  const { data: incomeData } = useTotalIncome();
  const { data: installments } = useFeeInstallments();

  const pendingCount = installments?.filter(i => i.status !== "paid").length || 0;
  const paidCount = installments?.filter(i => i.status === "paid").length || 0;

  const getAiSuggestion = async () => {
    if (!query.trim()) { toast.error("Enter a question"); return; }
    setIsLoading(true);
    setResponse("");

    const contextPrompt = `You are an AI assistant for Vedanta Valley Public School ERP system. Here is the current real-time school data:

ENROLLMENT:
- Total Students: ${stats?.totalStudents || 0}
- Total Teachers: ${stats?.totalTeachers || 0}
- Total Classes: ${stats?.totalClasses || 0}

FINANCIAL DATA:
- Total Fee Collected: ₹${incomeData?.feeCollected || 0}
- Total Fee Pending: ₹${incomeData?.feePending || 0}
- Total Salary Paid: ₹${incomeData?.salaryPaid || 0}
- Net Income (Collected - Salary): ₹${incomeData?.netIncome || 0}
- Fee Collection Rate: ${incomeData && (incomeData.feeCollected + incomeData.feePending) > 0 ? ((incomeData.feeCollected / (incomeData.feeCollected + incomeData.feePending)) * 100).toFixed(1) : 0}%

INSTALLMENTS:
- Paid Installments: ${paidCount}
- Pending Installments: ${pendingCount}
- Pending Salary Teachers: ${stats?.pendingSalaries ? `₹${stats.pendingSalaries}` : "₹0"}

ATTENDANCE (Today):
- Student Attendance Rate: ${stats?.studentAttendanceRate?.toFixed(1) || 0}%
- Teacher Attendance Rate: ${stats?.teacherAttendanceRate?.toFixed(1) || 0}%
- Students Present Today: ${stats?.todayStudentAttendance || 0}
- Teachers Present Today: ${stats?.todayTeacherAttendance || 0}

Based on this data, provide actionable suggestions to improve school economy and operations. Be specific with numbers and percentages. Answer in a professional yet friendly tone. Keep answers concise and structured with bullet points.

User Question: ${query}`;

    try {
      const resp = await supabase.functions.invoke("ai-assistant", {
        body: { messages: [{ role: "user", content: contextPrompt }] },
      });

      if (resp.error) throw new Error(resp.error.message);
      setResponse(resp.data?.response || "No response received.");
    } catch (e: any) {
      toast.error("AI error: " + (e.message || "Unknown error"));
      setResponse("Unable to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "How can I increase fee collection rate?",
    "Suggest ways to reduce school expenses",
    "How to improve student enrollment?",
    "What should be the ideal teacher-student ratio?",
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> AI Economy Assistant</h1>
        <p className="page-description">Get AI-powered suggestions to boost school economy and operations</p>
      </div>

      {/* School Economy Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10"><IndianRupee className="h-5 w-5 text-success" /></div>
          <div><p className="text-sm text-muted-foreground">Fee Collected</p><p className="text-xl font-bold text-success">{formatINR(incomeData?.feeCollected || 0)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning/10"><IndianRupee className="h-5 w-5 text-warning" /></div>
          <div><p className="text-sm text-muted-foreground">Fee Pending</p><p className="text-xl font-bold text-warning">{formatINR(incomeData?.feePending || 0)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-destructive/10"><IndianRupee className="h-5 w-5 text-destructive" /></div>
          <div><p className="text-sm text-muted-foreground">Salary Expenditure</p><p className="text-xl font-bold text-destructive">{formatINR(incomeData?.salaryPaid || 0)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div>
          <div><p className="text-sm text-muted-foreground">Net Income</p><p className="text-xl font-bold text-primary">{formatINR(incomeData?.netIncome || 0)}</p></div>
        </CardContent></Card>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <Button key={prompt} variant="outline" size="sm" className="text-xs" onClick={() => { setQuery(prompt); }}>
            {prompt}
          </Button>
        ))}
      </div>

      {/* Chat Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Ask AI Assistant</CardTitle>
          <CardDescription>Ask questions about improving school economy, fee collection, operations, etc.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., How can I improve fee collection rate?"
              className="min-h-[60px]"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); getAiSuggestion(); } }}
            />
            <Button onClick={getAiSuggestion} disabled={isLoading} className="btn-gradient h-auto">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>

          {response && (
            <div className="p-4 rounded-xl bg-muted/50 border whitespace-pre-wrap text-sm leading-relaxed">
              {response}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
