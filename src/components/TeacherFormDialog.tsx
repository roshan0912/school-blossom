import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Briefcase, MapPin, CreditCard } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SalaryStatus = Database["public"]["Enums"]["salary_status"];

interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  nationality: string;
  aadhar_number: string;
  qualification: string;
  experience_years: string;
  joining_date: string;
  subject: string;
  classes: string;
  permanent_address: string;
  city: string;
  state: string;
  pin_code: string;
  emergency_contact: string;
  emergency_phone: string;
  salary: string;
  salary_status: SalaryStatus;
  bank_name: string;
  bank_account: string;
  ifsc_code: string;
}

interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<TeacherFormData> | null;
  isEditing?: boolean;
  onSubmit: (data: TeacherFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const defaultFormData: TeacherFormData = {
  name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  blood_group: "",
  nationality: "Indian",
  aadhar_number: "",
  qualification: "",
  experience_years: "",
  joining_date: "",
  subject: "",
  classes: "",
  permanent_address: "",
  city: "",
  state: "",
  pin_code: "",
  emergency_contact: "",
  emergency_phone: "",
  salary: "",
  salary_status: "pending",
  bank_name: "",
  bank_account: "",
  ifsc_code: "",
};

export function TeacherFormDialog({
  open,
  onOpenChange,
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting = false,
}: TeacherFormDialogProps) {
  const [formData, setFormData] = useState<TeacherFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...defaultFormData, ...initialData });
      } else {
        setFormData(defaultFormData);
      }
      setActiveTab("basic");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateField = (field: keyof TeacherFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update teacher information" : "Enter complete teacher details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="basic" className="text-xs gap-1">
                <User className="h-3 w-3" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="professional" className="text-xs gap-1">
                <Briefcase className="h-3 w-3" />
                Professional
              </TabsTrigger>
              <TabsTrigger value="address" className="text-xs gap-1">
                <MapPin className="h-3 w-3" />
                Address
              </TabsTrigger>
              <TabsTrigger value="bank" className="text-xs gap-1">
                <CreditCard className="h-3 w-3" />
                Bank & Salary
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] pr-4">
              {/* Personal Information */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => updateField("date_of_birth", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(v) => updateField("gender", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blood_group">Blood Group</Label>
                    <Select value={formData.blood_group} onValueChange={(v) => updateField("blood_group", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => updateField("nationality", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aadhar_number">Aadhar Number</Label>
                    <Input
                      id="aadhar_number"
                      value={formData.aadhar_number}
                      onChange={(e) => updateField("aadhar_number", e.target.value)}
                      maxLength={12}
                      placeholder="XXXX XXXX XXXX"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Professional Information */}
              <TabsContent value="professional" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      value={formData.qualification}
                      onChange={(e) => updateField("qualification", e.target.value)}
                      placeholder="e.g., B.Ed, M.A., Ph.D."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Experience (Years)</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      value={formData.experience_years}
                      onChange={(e) => updateField("experience_years", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                      placeholder="e.g., Mathematics, English"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classes">Classes Assigned</Label>
                    <Input
                      id="classes"
                      value={formData.classes}
                      onChange={(e) => updateField("classes", e.target.value)}
                      placeholder="e.g., 10-A, 11-B, 12-A"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joining_date">Joining Date</Label>
                  <Input
                    id="joining_date"
                    type="date"
                    value={formData.joining_date}
                    onChange={(e) => updateField("joining_date", e.target.value)}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium mb-3">Emergency Contact</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact">Contact Name</Label>
                      <Input
                        id="emergency_contact"
                        value={formData.emergency_contact}
                        onChange={(e) => updateField("emergency_contact", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_phone">Contact Phone</Label>
                      <Input
                        id="emergency_phone"
                        value={formData.emergency_phone}
                        onChange={(e) => updateField("emergency_phone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Address Details */}
              <TabsContent value="address" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="permanent_address">Permanent Address</Label>
                  <Textarea
                    id="permanent_address"
                    value={formData.permanent_address}
                    onChange={(e) => updateField("permanent_address", e.target.value)}
                    placeholder="House No, Street, Locality"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => updateField("state", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin_code">PIN Code</Label>
                  <Input
                    id="pin_code"
                    value={formData.pin_code}
                    onChange={(e) => updateField("pin_code", e.target.value)}
                    maxLength={6}
                    className="w-1/2"
                  />
                </div>
              </TabsContent>

              {/* Bank & Salary Details */}
              <TabsContent value="bank" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Monthly Salary (₹)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => updateField("salary", e.target.value)}
                      placeholder="e.g., 25000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary_status">Salary Status</Label>
                    <Select
                      value={formData.salary_status}
                      onValueChange={(v: SalaryStatus) => updateField("salary_status", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium mb-3">Bank Details (for Salary Transfer)</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) => updateField("bank_name", e.target.value)}
                        placeholder="e.g., State Bank of India"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bank_account">Account Number</Label>
                        <Input
                          id="bank_account"
                          value={formData.bank_account}
                          onChange={(e) => updateField("bank_account", e.target.value)}
                          placeholder="Account number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ifsc_code">IFSC Code</Label>
                        <Input
                          id="ifsc_code"
                          value={formData.ifsc_code}
                          onChange={(e) => updateField("ifsc_code", e.target.value.toUpperCase())}
                          placeholder="e.g., SBIN0001234"
                          maxLength={11}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-gradient" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Teacher" : "Add Teacher"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
