import { useState, useEffect, useCallback } from "react";
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

export interface BillingItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  date: string;
  validTill?: string;
  status: "paid" | "pending" | "active";
  type: "subscription" | "addon" | "usage";
}

export interface CloudUsage {
  storageUsed: number;
  storageLimit: number;
  apiCalls: number;
  apiLimit: number;
  activeUsers: number;
  userLimit: number;
}

const defaultSchoolSettings: SchoolSettings = {
  schoolName: "Vedanta Valley Public School",
  contactEmail: "admin@vedantavalley.edu",
  phone: "+91 98765-43210",
  website: "www.vedantavalley.edu",
  address: "Vedanta Valley, City, State 123456",
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

const demoBillingHistory: BillingItem[] = [
  {
    id: "bill-001",
    name: "Vedanta Valley Public School - Cloud ERP",
    description: "Complete school management system with all modules",
    amount: 6400,
    date: "2026-03-01",
    validTill: "2079-03-01",
    status: "active",
    type: "subscription",
  },
  {
    id: "bill-002",
    name: "Advanced Analytics Module",
    description: "Graph generator & chart visualizations",
    amount: 299,
    date: "2026-02-01",
    status: "paid",
    type: "addon",
  },
  {
    id: "bill-003",
    name: "Excel Export Pro",
    description: "Advanced Excel sheet generator with templates",
    amount: 199,
    date: "2026-02-01",
    status: "paid",
    type: "addon",
  },
  {
    id: "bill-004",
    name: "PDF Report Generator",
    description: "Custom PDF reports and payslips",
    amount: 149,
    date: "2026-02-01",
    status: "paid",
    type: "addon",
  },
  {
    id: "bill-005",
    name: "SMS Notifications",
    description: "1000 SMS credits for attendance alerts",
    amount: 99,
    date: "2026-02-01",
    status: "paid",
    type: "usage",
  },
];

const demoCloudUsage: CloudUsage = {
  storageUsed: 2.4,
  storageLimit: 50,
  apiCalls: 12450,
  apiLimit: 100000,
  activeUsers: 8,
  userLimit: 50,
};

export function useSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // School settings (stored in localStorage)
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(defaultSchoolSettings);

  // Notification settings (stored in localStorage)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);

  // Backup settings (stored in localStorage)
  const [backupSettings, setBackupSettings] = useState<BackupSettings>(defaultBackupSettings);

  // Profile settings (fetched from Supabase)
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    fullName: "",
    email: "",
    phone: "",
    avatarUrl: null,
  });

  // Billing data
  const [billingHistory] = useState<BillingItem[]>(demoBillingHistory);
  const [cloudUsage] = useState<CloudUsage>(demoCloudUsage);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSchool = localStorage.getItem("school_settings");
    if (storedSchool) {
      try {
        setSchoolSettings(JSON.parse(storedSchool));
      } catch (e) {
        console.error("Error parsing school settings:", e);
      }
    }

    const storedNotif = localStorage.getItem("notification_settings");
    if (storedNotif) {
      try {
        setNotificationSettings(JSON.parse(storedNotif));
      } catch (e) {
        console.error("Error parsing notification settings:", e);
      }
    }

    const storedBackup = localStorage.getItem("backup_settings");
    if (storedBackup) {
      try {
        setBackupSettings(JSON.parse(storedBackup));
      } catch (e) {
        console.error("Error parsing backup settings:", e);
      }
    }
  }, []);

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
  const saveSchoolSettings = useCallback((settings: SchoolSettings) => {
    setSchoolSettings(settings);
    localStorage.setItem("school_settings", JSON.stringify(settings));
    toast.success("School settings saved successfully!");
  }, []);

  // Save notification settings
  const saveNotificationSettings = useCallback((settings: NotificationSettings) => {
    setNotificationSettings(settings);
    localStorage.setItem("notification_settings", JSON.stringify(settings));
    toast.success("Notification preferences saved!");
  }, []);

  // Save backup settings
  const saveBackupSettings = useCallback((settings: BackupSettings) => {
    setBackupSettings(settings);
    localStorage.setItem("backup_settings", JSON.stringify(settings));
    toast.success("Backup settings saved!");
  }, []);

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
      a.download = `vedantavalley-backup-${new Date().toISOString().split("T")[0]}.json`;
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

  // Download invoice
  const downloadInvoice = (bill: BillingItem) => {
    const invoiceContent = `
INVOICE
=======================================================

Invoice No: INV-${bill.id.toUpperCase()}
Date: ${new Date(bill.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}

Bill To:
${schoolSettings.schoolName}
${schoolSettings.address}
Email: ${schoolSettings.contactEmail}
Phone: ${schoolSettings.phone}

-------------------------------------------------------
ITEM DETAILS
-------------------------------------------------------

Item: ${bill.name}
Description: ${bill.description}
${bill.validTill ? `Validity: ${new Date(bill.date).toLocaleDateString("en-IN")} to ${new Date(bill.validTill).toLocaleDateString("en-IN")}` : ""}

Amount: ₹${bill.amount.toLocaleString("en-IN")}

-------------------------------------------------------

Subtotal: ₹${bill.amount.toLocaleString("en-IN")}
GST (18%): ₹${Math.round(bill.amount * 0.18).toLocaleString("en-IN")}
-------------------------------------------------------
TOTAL: ₹${Math.round(bill.amount * 1.18).toLocaleString("en-IN")}

=======================================================
Payment Status: ${bill.status.toUpperCase()}
=======================================================

Thank you for choosing Vedanta Valley Public School!
For support: admin@vedantavalley.edu
    `.trim();

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${bill.id}-${bill.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Invoice downloaded!");
  };

  return {
    isLoading,
    isSaving,
    schoolSettings,
    notificationSettings,
    backupSettings,
    profileSettings,
    billingHistory,
    cloudUsage,
    saveSchoolSettings,
    saveNotificationSettings,
    saveBackupSettings,
    saveProfileSettings,
    changePassword,
    createBackup,
    downloadLastBackup,
    downloadInvoice,
  };
}
