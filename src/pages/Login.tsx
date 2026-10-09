import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { SchoolLogo } from "@/components/SchoolLogo";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

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
    <div className="min-h-screen bg-background flex">
      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 bg-mesh">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <SchoolLogo size={64} />
              <div>
                <span className="text-xl font-bold tracking-tight block leading-none">Vedanta Valley</span>
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Public School</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-2 text-[15px]">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 h-12 rounded-xl text-[15px] ${errors.email ? "border-destructive" : ""}`}
                  required
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 h-12 rounded-xl text-[15px] ${errors.password ? "border-destructive" : ""}`}
                  required
                />
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full h-12 btn-gradient rounded-xl text-[15px]" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground border-t border-border pt-5">Vedanta Valley Public School · Roshan Dev &amp; Co</p>
        </div>
      </div>
    </div>
  );
}
