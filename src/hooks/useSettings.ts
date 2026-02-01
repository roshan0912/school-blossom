import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SchoolSettings {
  schoolName: string;
  contactEmail: string;
  phone: string;
  website: string;
  address: string;
  academicYear: string;
  gradingSystem: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  attendance: boolean;
  fees: boolean;
}

export interface BackupSettings {
  autoBackup: boolean;
  frequency: string;
  lastBackup: string | null;
}

export interface ProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
}

const defaultSchoolSettings: SchoolSettings = {
  schoolName: "EduManage School",
  contactEmail: "admin@edumanage.edu",
  phone: "+91 98765-43210",
  website: "www.edumanage.edu",
  address: "123 Education Street, City, State 123456",
  academicYear: "2025-2026",
  gradingSystem: "percentage",
};

const defaultNotificationSettings: NotificationSettings = {
  email: true,
  push: true,
  attendance: true,
  fees: true,
};

const defaultBackupSettings: BackupSettings = {
  autoBackup: true,
  frequency: "daily",
  lastBackup: null,
};

export function useSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // School settings (stored in localStorage)
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => {
    const stored = localStorage.getItem("school_settings");
    return stored ? JSON.parse(stored) : defaultSchoolSettings;
  });

  // Notification settings (stored in localStorage)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem("notification_settings");
    return stored ? JSON.parse(stored) : defaultNotificationSettings;
  });

  // Backup settings (stored in localStorage)
  const [backupSettings, setBackupSettings] = useState<BackupSettings>(() => {
    const stored = localStorage.getItem("backup_settings");
    return stored ? JSON.parse(stored) : defaultBackupSettings;
  });

  // Profile settings (fetched from Supabase)
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    fullName: "",
    email: "",
    phone: "",
    avatarUrl: null,
  });

  // Load profile from Supabase
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          setProfileSettings({
            fullName: profile.full_name || user.user_metadata?.full_name || "",
            email: profile.email || user.email || "",
            phone: profile.phone || "",
            avatarUrl: profile.avatar_url,
          });
        } else {
          setProfileSettings({
            fullName: user.user_metadata?.full_name || "",
            email: user.email || "",
            phone: "",
            avatarUrl: null,
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Save school settings
  const saveSchoolSettings = (settings: SchoolSettings) => {
    setSchoolSettings(settings);
    localStorage.setItem("school_settings", JSON.stringify(settings));
    toast.success("School settings saved!");
  };

  // Save notification settings
  const saveNotificationSettings = (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    localStorage.setItem("notification_settings", JSON.stringify(settings));
    toast.success("Notification preferences saved!");
  };

  // Save backup settings
  const saveBackupSettings = (settings: BackupSettings) => {
    setBackupSettings(settings);
    localStorage.setItem("backup_settings", JSON.stringify(settings));
    toast.success("Backup settings saved!");
  };

  // Save profile settings to Supabase
  const saveProfileSettings = async (settings: ProfileSettings) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from("profiles")
          .update({
            full_name: settings.fullName,
            email: settings.email,
            phone: settings.phone,
            avatar_url: settings.avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      } else {
        await supabase.from("profiles").insert({
          user_id: user.id,
          full_name: settings.fullName,
          email: settings.email,
          phone: settings.phone,
          avatar_url: settings.avatarUrl,
        });
      }

      setProfileSettings(settings);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsSaving(true);
    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        return false;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success("Password updated successfully!");
      return true;
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Create backup (export all data as JSON)
  const createBackup = async () => {
    try {
      const [students, teachers, classes, exams, payments] = await Promise.all([
        supabase.from("students").select("*"),
        supabase.from("teachers").select("*"),
        supabase.from("classes").select("*"),
        supabase.from("exams").select("*"),
        supabase.from("payments").select("*"),
      ]);

      const backupData = {
        exportedAt: new Date().toISOString(),
        students: students.data || [],
        teachers: teachers.data || [],
        classes: classes.data || [],
        exams: exams.data || [],
        payments: payments.data || [],
        settings: {
          school: schoolSettings,
          notifications: notificationSettings,
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edumanage-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update last backup time
      const newBackupSettings = {
        ...backupSettings,
        lastBackup: new Date().toISOString(),
      };
      setBackupSettings(newBackupSettings);
      localStorage.setItem("backup_settings", JSON.stringify(newBackupSettings));

      toast.success("Backup created and downloaded!");
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Failed to create backup");
    }
  };

  // Download last backup
  const downloadLastBackup = () => {
    if (!backupSettings.lastBackup) {
      toast.error("No backup available");
      return;
    }
    createBackup();
  };

  return {
    isLoading,
    isSaving,
    schoolSettings,
    notificationSettings,
    backupSettings,
    profileSettings,
    saveSchoolSettings,
    saveNotificationSettings,
    saveBackupSettings,
    saveProfileSettings,
    changePassword,
    createBackup,
    downloadLastBackup,
  };
}
