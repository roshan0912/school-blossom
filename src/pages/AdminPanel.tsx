import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Shield, UserPlus, MoreHorizontal, Trash2, Users, GraduationCap,
  IndianRupee, BookOpen, Bus, ClipboardList, Activity, Bell,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles, useUpdateUserRole, useDeleteUserRole } from "@/hooks/useUserRoles";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/pdfGenerator";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleColors: Record<AppRole, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  teacher: "bg-primary/10 text-primary border-primary/20",
  staff: "bg-secondary text-secondary-foreground border-secondary",
};

function useActivityLogs() {
  return useQuery({
    queryKey: ["activity-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

function useSystemOverview() {
  return useQuery({
    queryKey: ["system-overview"],
    queryFn: async () => {
      const [students, teachers, classes, books, routes, inventory, announcements, homework] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("teachers").select("id", { count: "exact", head: true }),
        supabase.from("classes").select("id", { count: "exact", head: true }),
        supabase.from("library_books").select("id", { count: "exact", head: true }),
        supabase.from("transport_routes").select("id", { count: "exact", head: true }),
        supabase.from("inventory_items").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase.from("homework").select("id", { count: "exact", head: true }),
      ]);
      return {
        students: students.count || 0,
        teachers: teachers.count || 0,
        classes: classes.count || 0,
        books: books.count || 0,
        routes: routes.count || 0,
        inventory: inventory.count || 0,
        announcements: announcements.count || 0,
        homework: homework.count || 0,
      };
    },
  });
}

export default function AdminPanel() {
  const { userRole } = useAuth();
  const { data: userRoles, isLoading } = useUserRoles();
  const updateRole = useUpdateUserRole();
  const deleteRole = useDeleteUserRole();
  const { data: stats } = useDashboardStats();
  const { data: overview } = useSystemOverview();
  const { data: activityLogs } = useActivityLogs();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; userId: string; email: string; role: AppRole } | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("staff");

  if (userRole !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const handleEditRole = (user: { id: string; userId: string; email: string; role: AppRole }) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setEditDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    await updateRole.mutateAsync({ id: selectedUser.id, role: newRole });
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Are you sure you want to remove this user's role?")) return;
    await deleteRole.mutateAsync(id);
  };

  const columns = [
    {
      key: "email",
      label: "User",
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
            {item.profile?.full_name?.split(" ").map((n: string) => n[0]).join("") || item.profile?.email?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-medium">{item.profile?.full_name || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">{item.profile?.email || "No email"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (item: any) => (
        <Badge variant="outline" className={roleColors[item.role as AppRole]}>
          {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Assigned On",
      render: (item: any) => new Date(item.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="gap-2"
              onClick={() => handleEditRole({
                id: item.id,
                userId: item.user_id,
                email: item.profile?.email || "",
                role: item.role,
              })}
            >
              <Shield className="h-4 w-4" /> Change Role
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-destructive"
              onClick={() => handleDeleteRole(item.id)}
            >
              <Trash2 className="h-4 w-4" /> Remove Role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const overviewCards = [
    { label: "Students", value: overview?.students || 0, icon: GraduationCap, color: "text-primary" },
    { label: "Teachers", value: overview?.teachers || 0, icon: Users, color: "text-primary" },
    { label: "Classes", value: overview?.classes || 0, icon: BookOpen, color: "text-primary" },
    { label: "Library Books", value: overview?.books || 0, icon: BookOpen, color: "text-accent-foreground" },
    { label: "Transport Routes", value: overview?.routes || 0, icon: Bus, color: "text-accent-foreground" },
    { label: "Inventory Items", value: overview?.inventory || 0, icon: ClipboardList, color: "text-accent-foreground" },
    { label: "Announcements", value: overview?.announcements || 0, icon: Bell, color: "text-warning" },
    { label: "Homework", value: overview?.homework || 0, icon: ClipboardList, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-description">System overview, user roles, and activity logs</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        {/* System Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Financial Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fees Collected</p>
                  <p className="text-2xl font-bold mt-1 text-success">{formatINR(stats?.feesCollected || 0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10 text-success">
                  <IndianRupee className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Salaries</p>
                  <p className="text-2xl font-bold mt-1 text-warning">{formatINR(stats?.pendingSalaries || 0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10 text-warning">
                  <IndianRupee className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold mt-1">{userRoles?.length || 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Module counts */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {overviewCards.map((card) => (
              <Card key={card.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Attendance snapshot */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Today's Student Attendance</h3>
              <p className="text-3xl font-bold text-primary">{stats?.studentAttendanceRate.toFixed(0) || 0}%</p>
              <p className="text-sm text-muted-foreground mt-1">{stats?.todayStudentAttendance || 0} students present</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Today's Teacher Attendance</h3>
              <p className="text-3xl font-bold text-primary">{stats?.teacherAttendanceRate.toFixed(0) || 0}%</p>
              <p className="text-sm text-muted-foreground mt-1">{stats?.todayTeacherAttendance || 0} teachers present</p>
            </Card>
          </div>
        </TabsContent>

        {/* User Roles */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admins</p>
                  <p className="text-3xl font-bold mt-1 text-destructive">
                    {userRoles?.filter(r => r.role === "admin").length || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teachers</p>
                  <p className="text-3xl font-bold mt-1 text-primary">
                    {userRoles?.filter(r => r.role === "teacher").length || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <UserPlus className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Staff</p>
                  <p className="text-3xl font-bold mt-1">
                    {userRoles?.filter(r => r.role === "staff").length || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-secondary text-secondary-foreground">
                  <UserPlus className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>

          <DataTable
            data={userRoles || []}
            columns={columns}
            searchPlaceholder="Search users..."
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Activity Logs */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Recent Activity
            </h3>
            {activityLogs && activityLogs.length > 0 ? (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{log.action}</p>
                      {log.entity_type && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {log.entity_type} {log.entity_id ? `• ${log.entity_id.slice(0, 8)}` : ""}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No activity logs yet. Actions like adding students, teachers, or managing records will appear here.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Role</Label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={updateRole.isPending}>
              {updateRole.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
