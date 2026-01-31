import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, UserPlus, MoreHorizontal, Trash2 } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles, useUpdateUserRole, useDeleteUserRole } from "@/hooks/useUserRoles";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleColors: Record<AppRole, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  teacher: "bg-primary/10 text-primary border-primary/20",
  staff: "bg-secondary text-secondary-foreground border-secondary",
};

export default function AdminPanel() {
  const { userRole } = useAuth();
  const { data: userRoles, isLoading } = useUserRoles();
  const updateRole = useUpdateUserRole();
  const deleteRole = useDeleteUserRole();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; userId: string; email: string; role: AppRole } | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("staff");

  // Only admins can access this page
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
    
    await updateRole.mutateAsync({
      id: selectedUser.id,
      role: newRole,
    });
    
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

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-description">Manage user roles and permissions</p>
      </div>

      {/* Role Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-2xl border border-border p-6">
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
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
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
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
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
        </div>
      </div>

      <DataTable
        data={userRoles || []}
        columns={columns}
        searchPlaceholder="Search users..."
        isLoading={isLoading}
      />

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
