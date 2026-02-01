import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, User, Bell, Shield, Database, Loader2, Eye, EyeOff, Download, RefreshCw } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";

export default function Settings() {
  const isMobile = useIsMobile();
  const {
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
  } = useSettings();

  // Local state for forms
  const [schoolForm, setSchoolForm] = useState(schoolSettings);
  const [notifForm, setNotifForm] = useState(notificationSettings);
  const [profileForm, setProfileForm] = useState(profileSettings);
  const [backupForm, setBackupForm] = useState(backupSettings);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync with hook data
  useEffect(() => {
    setSchoolForm(schoolSettings);
  }, [schoolSettings]);

  useEffect(() => {
    setNotifForm(notificationSettings);
  }, [notificationSettings]);

  useEffect(() => {
    setProfileForm(profileSettings);
  }, [profileSettings]);

  useEffect(() => {
    setBackupForm(backupSettings);
  }, [backupSettings]);

  const handleSchoolSave = () => {
    saveSchoolSettings(schoolForm);
  };

  const handleNotificationSave = () => {
    saveNotificationSettings(notifForm);
  };

  const handleProfileSave = () => {
    saveProfileSettings(profileForm);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      return;
    }
    if (newPassword.length < 6) {
      return;
    }

    setIsChangingPassword(true);
    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsChangingPassword(false);
  };

  const handleBackupSave = () => {
    saveBackupSettings(backupForm);
  };

  const getInitials = () => {
    const name = profileForm.fullName || profileForm.email;
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your school and account settings</p>
      </div>

      <Tabs defaultValue="school" className="space-y-6">
        <TabsList className={`bg-muted/50 p-1 h-auto ${isMobile ? 'grid grid-cols-3 gap-1 w-full' : 'flex flex-wrap'}`}>
          <TabsTrigger 
            value="school" 
            className={`gap-2 data-[state=active]:bg-background ${isMobile ? 'flex-col py-2 text-xs' : ''}`}
          >
            <Building className="h-4 w-4" />
            <span className={isMobile ? 'hidden sm:inline' : ''}>School</span>
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className={`gap-2 data-[state=active]:bg-background ${isMobile ? 'flex-col py-2 text-xs' : ''}`}
          >
            <User className="h-4 w-4" />
            <span className={isMobile ? 'hidden sm:inline' : ''}>Profile</span>
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className={`gap-2 data-[state=active]:bg-background ${isMobile ? 'flex-col py-2 text-xs' : ''}`}
          >
            <Bell className="h-4 w-4" />
            <span className={isMobile ? 'hidden sm:inline' : ''}>Alerts</span>
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className={`gap-2 data-[state=active]:bg-background ${isMobile ? 'flex-col py-2 text-xs' : ''}`}
          >
            <Shield className="h-4 w-4" />
            <span className={isMobile ? 'hidden sm:inline' : ''}>Security</span>
          </TabsTrigger>
          <TabsTrigger 
            value="backup" 
            className={`gap-2 data-[state=active]:bg-background ${isMobile ? 'flex-col py-2 text-xs col-span-2 sm:col-span-1' : ''}`}
          >
            <Database className="h-4 w-4" />
            <span className={isMobile ? 'hidden sm:inline' : ''}>Backup</span>
          </TabsTrigger>
        </TabsList>

        {/* School Settings */}
        <TabsContent value="school" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Update your school details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input 
                    id="schoolName" 
                    value={schoolForm.schoolName}
                    onChange={(e) => setSchoolForm({ ...schoolForm, schoolName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input 
                    id="contactEmail" 
                    type="email" 
                    value={schoolForm.contactEmail}
                    onChange={(e) => setSchoolForm({ ...schoolForm, contactEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={schoolForm.phone}
                    onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    value={schoolForm.website}
                    onChange={(e) => setSchoolForm({ ...schoolForm, website: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={schoolForm.address}
                  onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                />
              </div>
              <Button onClick={handleSchoolSave} className="btn-gradient">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Settings</CardTitle>
              <CardDescription>Configure academic year and grading system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Select 
                    value={schoolForm.academicYear}
                    onValueChange={(value) => setSchoolForm({ ...schoolForm, academicYear: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                      <SelectItem value="2026-2027">2026-2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grading System</Label>
                  <Select 
                    value={schoolForm.gradingSystem}
                    onValueChange={(value) => setSchoolForm({ ...schoolForm, gradingSystem: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (0-100)</SelectItem>
                      <SelectItem value="gpa">GPA (0-10)</SelectItem>
                      <SelectItem value="letter">Letter Grade (A-F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSchoolSave} className="btn-gradient">
                Save Academic Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                  {getInitials()}
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-medium">{profileForm.fullName || "No name set"}</p>
                  <p className="text-sm text-muted-foreground">{profileForm.email}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profilePhone">Phone</Label>
                  <Input 
                    id="profilePhone" 
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileEmail">Email</Label>
                <Input 
                  id="profileEmail" 
                  type="email" 
                  value={profileForm.email}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <Button 
                onClick={handleProfileSave} 
                className="btn-gradient"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground truncate">Receive updates via email</p>
                </div>
                <Switch
                  checked={notifForm.email}
                  onCheckedChange={(checked) => setNotifForm({ ...notifForm, email: checked })}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground truncate">Receive browser notifications</p>
                </div>
                <Switch
                  checked={notifForm.push}
                  onCheckedChange={(checked) => setNotifForm({ ...notifForm, push: checked })}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Attendance Alerts</p>
                  <p className="text-sm text-muted-foreground truncate">Get notified about attendance issues</p>
                </div>
                <Switch
                  checked={notifForm.attendance}
                  onCheckedChange={(checked) => setNotifForm({ ...notifForm, attendance: checked })}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Fee Reminders</p>
                  <p className="text-sm text-muted-foreground truncate">Receive fee payment reminders</p>
                </div>
                <Switch
                  checked={notifForm.fees}
                  onCheckedChange={(checked) => setNotifForm({ ...notifForm, fees: checked })}
                />
              </div>
              <Button onClick={handleNotificationSave} className="btn-gradient">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input 
                    id="currentPassword" 
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input 
                    id="newPassword" 
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {newPassword && newPassword.length < 6 && (
                  <p className="text-xs text-destructive">Password must be at least 6 characters</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>
              <Button 
                onClick={handlePasswordChange} 
                className="btn-gradient"
                disabled={
                  isChangingPassword || 
                  !currentPassword || 
                  !newPassword || 
                  newPassword.length < 6 || 
                  newPassword !== confirmPassword
                }
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Security</CardTitle>
              <CardDescription>Manage your login sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">You are currently logged in on this device</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-success">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  Active
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Backup</CardTitle>
              <CardDescription>Manage your data backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-medium">Last Backup</p>
                  <p className="text-sm text-muted-foreground">
                    {backupSettings.lastBackup 
                      ? format(new Date(backupSettings.lastBackup), "MMMM d, yyyy 'at' h:mm a")
                      : "No backup created yet"
                    }
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={downloadLastBackup}
                  disabled={!backupSettings.lastBackup}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={createBackup} className="btn-gradient gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Create Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automatic Backups</CardTitle>
              <CardDescription>Configure automatic backup schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Enable Auto-Backup</p>
                  <p className="text-sm text-muted-foreground truncate">Automatically backup data based on schedule</p>
                </div>
                <Switch 
                  checked={backupForm.autoBackup}
                  onCheckedChange={(checked) => setBackupForm({ ...backupForm, autoBackup: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select 
                  value={backupForm.frequency}
                  onValueChange={(value) => setBackupForm({ ...backupForm, frequency: value })}
                  disabled={!backupForm.autoBackup}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleBackupSave} 
                className="btn-gradient"
                disabled={!backupForm.autoBackup}
              >
                Save Backup Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
