import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Search, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function DashboardLayout() {
  const [isDark, setIsDark] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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
    const email = user?.email || "";
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-xl px-6">
          <div className="flex-1 flex items-center gap-4 ml-12 lg:ml-0">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search anything..."
                className="pl-10 h-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <NotificationDropdown />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-2 gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                    {getInitials()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {user?.email?.split("@")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.email}</p>
                  {userRole && (
                    <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
