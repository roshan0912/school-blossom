import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  DollarSign,
  FileText,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  School,
  Shield,
  CalendarDays,
  ClipboardList,
  Receipt,
  LibraryBig,
  Bus,
  Package,
  FolderOpen,
  Megaphone,
  Sparkles,
  ScrollText,
  FileOutput,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navigationSections = [
  {
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Students", href: "/students", icon: Users },
      { name: "Teachers", href: "/teachers", icon: GraduationCap },
    ],
  },
  {
    label: "Academic",
    items: [
      { name: "Classes", href: "/classes", icon: BookOpen },
      { name: "Timetable", href: "/timetable", icon: CalendarDays },
      { name: "Attendance", href: "/attendance", icon: Calendar },
      { name: "Exams", href: "/exams", icon: FileText },
      { name: "Marksheet", href: "/marksheet", icon: ScrollText },
      { name: "TC Generator", href: "/tc-generator", icon: FileOutput },
      { name: "Homework", href: "/homework", icon: ClipboardList },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Fee Management", href: "/fees", icon: Receipt },
      { name: "Payroll", href: "/payroll", icon: DollarSign },
    ],
  },
  {
    label: "Resources",
    items: [
      { name: "Library", href: "/library", icon: LibraryBig },
      { name: "Transport", href: "/transport", icon: Bus },
      { name: "Inventory", href: "/inventory", icon: Package },
      { name: "Documents", href: "/documents", icon: FolderOpen },
    ],
  },
  {
    label: "System",
    items: [
      { name: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
      { name: "Announcements", href: "/announcements", icon: Megaphone },
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { userRole, user, signOut } = useAuth();

  const adminSection = {
    label: "Admin",
    items: [{ name: "Admin Panel", href: "/admin", icon: Shield }],
  };

  const allSections = userRole === "admin"
    ? [...navigationSections, adminSection]
    : navigationSections;

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card/80 backdrop-blur-md shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-[260px] bg-sidebar-background border-r border-sidebar-border z-40 transform transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl text-primary-foreground overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
              <School className="h-5 w-5 relative z-10" />
              <div className="absolute inset-0 bg-white/10 animate-pulse-soft" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-tight">Vedanta Valley</h1>
              <p className="text-[11px] text-muted-foreground font-medium">Public School ERP</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
            {allSections.map((section, sIdx) => (
              <div key={sIdx} className={cn(sIdx > 0 && "mt-5")}>
                {section.label && (
                  <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">
                    {section.label}
                  </p>
                )}
                {section.items.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      location.pathname.startsWith(item.href));
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "sidebar-link group",
                        isActive && "sidebar-link-active"
                      )}
                    >
                      <item.icon className={cn(
                        "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                      )} />
                      <span className="text-[13px] font-medium">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold" style={{ background: 'var(--gradient-primary)' }}>
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}</p>
                <p className="text-[11px] text-muted-foreground truncate capitalize font-medium">{userRole || "No role"}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
