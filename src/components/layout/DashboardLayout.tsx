import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Moon, Sun, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { GlobalSearch } from "@/components/GlobalSearch";
import { SchoolLogo } from "@/components/SchoolLogo";

export function DashboardLayout() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("school-theme") === "dark");
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("school-theme", isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getInitials = () => {
    const name = user?.user_metadata?.full_name;
    if (name) return name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Sidebar />
      
      {/* Main content */}
      <div className="workspace-main">
        {/* Top header */}
        <header className="workspace-header sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-4 border-b border-border/60 bg-card/70 backdrop-blur-xl px-3 sm:px-6">
          <div className="min-w-0 flex-1 flex items-center gap-3 ml-12 lg:ml-0">
            <SchoolLogo size={32} className="lg:hidden" />
            <GlobalSearch />
          </div>
          
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" aria-label="Recent updates" title="Recent updates" onClick={() => window.dispatchEvent(new Event("show-school-updates"))}><Sparkles className="h-4 w-4" /></Button>
            <Button
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <NotificationDropdown />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-2 gap-2 rounded-xl">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs" style={{ background: 'var(--gradient-primary)' }}>
                    {getInitials()}
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold">
                    {user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold">{user?.user_metadata?.full_name || user?.email}</p>
                  {userRole && (
                    <p className="text-xs text-muted-foreground capitalize font-medium">{userRole}</p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive gap-2 rounded-lg mx-1">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
