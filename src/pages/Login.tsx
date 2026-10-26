import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, GraduationCap, Users, IndianRupee, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { SchoolLogo } from "@/components/SchoolLogo";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const HIGHLIGHTS = [
  { icon: GraduationCap, label: "Students & Classes", detail: "Enrolment, grades and report cards" },
  { icon: Users, label: "Staff & Payroll", detail: "Monthly salary, attendance and records" },
  { icon: IndianRupee, label: "Fees & Finance", detail: "Month-wise collection and receipts" },
];

export default function Login() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      setIsLoading(false);
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Please verify your email before signing in");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Welcome back!");
    navigate("/dashboard");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-border/60 bg-mesh p-10 xl:p-14">
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/[0.05] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-primary/[0.04] blur-3xl" />

        <div className="relative flex items-center gap-3.5">
          <SchoolLogo size={56} />
          <div>
            <span className="block text-lg font-bold tracking-tight leading-tight">Vedanta Valley</span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Public School</span>
          </div>
        </div>

        <div className="relative max-w-md space-y-8">
          <div>
            <h1 className="text-[2rem] xl:text-4xl font-bold leading-tight tracking-tight animate-fade-in">
              School operations,<br />
              <span className="text-primary">beautifully organised.</span>
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground animate-fade-in stagger-2">
              One calm workspace for admissions, attendance, fees, payroll and report cards — built for the CBSE journey from Jalpaiguri.
            </p>
          </div>

          <ul className="space-y-3 animate-fade-in stagger-3">
            {HIGHLIGHTS.map(({ icon: Icon, label, detail }) => (
              <li
                key={label}
                className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-card/60 px-4 py-3.5 backdrop-blur-sm transition-colors duration-200 hover:border-primary/30"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-[13px] text-muted-foreground">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Secure staff &amp; admin access · Roshan Dev &amp; Co</span>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen items-center justify-center bg-mesh p-5 sm:p-8">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Mobile brand */}
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <SchoolLogo size={52} />
            <div>
              <span className="block text-lg font-bold tracking-tight leading-none">Vedanta Valley</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Public School</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/70 p-7 sm:p-9 backdrop-blur-xl" style={{ boxShadow: "var(--shadow-workspace)" }}>
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Staff Portal</p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your school workspace to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`h-11 rounded-xl bg-background pl-10 text-[15px] ${errors.email ? "border-destructive" : ""}`}
                    required
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                  <Link to="/forgot-password" className="text-[13px] font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`h-11 rounded-xl bg-background pl-10 pr-10 text-[15px] ${errors.password ? "border-destructive" : ""}`}
                    required
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <Button type="submit" className="h-11 w-full rounded-xl text-[15px] btn-gradient" disabled={isLoading}>
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="mt-7 border-t border-border/60 pt-5 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Vedanta Valley Public School · Roshan Dev &amp; Co
          </p>
        </div>
      </main>
    </div>
  );
}
