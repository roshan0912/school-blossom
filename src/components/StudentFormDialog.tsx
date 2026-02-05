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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Users, MapPin, Heart, Bus, Camera } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";
import type { Database } from "@/integrations/supabase/types";

type FeeStatus = Database["public"]["Enums"]["fee_status"];

interface ClassOption {
  id: string;
  name: string;
}

interface StudentFormData {
  name: string;
  roll_no: string;
  class_id: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  nationality: string;
  religion: string;
  category: string;
  aadhar_number: string;
  email: string;
  phone: string;
  admission_no: string;
  admission_date: string;
  previous_school: string;
  parent_name: string;
  mother_name: string;
  father_occupation: string;
  mother_occupation: string;
  guardian_name: string;
  guardian_relation: string;
  guardian_phone: string;
  address: string;
  permanent_address: string;
  city: string;
  district: string;
  state: string;
  pin_code: string;
  medical_conditions: string;
  emergency_contact: string;
  emergency_phone: string;
  transport_required: boolean;
  pickup_point: string;
  fee_status: FeeStatus;
  photo_url: string | null;
}

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: ClassOption[];
  initialData?: Partial<StudentFormData> | null;
  isEditing?: boolean;
  onSubmit: (data: StudentFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const defaultFormData: StudentFormData = {
  name: "",
  roll_no: "",
  class_id: "",
  date_of_birth: "",
  gender: "",
  blood_group: "",
  nationality: "Indian",
  religion: "",
  category: "",
  aadhar_number: "",
  email: "",
  phone: "",
  admission_no: "",
  admission_date: "",
  previous_school: "",
  parent_name: "",
  mother_name: "",
  father_occupation: "",
  mother_occupation: "",
  guardian_name: "",
  guardian_relation: "",
  guardian_phone: "",
  address: "",
  permanent_address: "",
  city: "",
  district: "",
  state: "",
  pin_code: "",
  medical_conditions: "",
  emergency_contact: "",
  emergency_phone: "",
  transport_required: false,
  pickup_point: "",
  fee_status: "pending",
  photo_url: null,
};

export function StudentFormDialog({
  open,
  onOpenChange,
  classes,
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting = false,
}: StudentFormDialogProps) {
  const [formData, setFormData] = useState<StudentFormData>(defaultFormData);
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

  const updateField = (field: keyof StudentFormData, value: string | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update student information" : "Enter complete student details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-4">
              <TabsTrigger value="photo" className="text-xs gap-1">
                <Camera className="h-3 w-3" />
                Photo
              </TabsTrigger>
              <TabsTrigger value="basic" className="text-xs gap-1">
                <User className="h-3 w-3" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="admission" className="text-xs gap-1">
                Admission
              </TabsTrigger>
              <TabsTrigger value="guardian" className="text-xs gap-1">
                <Users className="h-3 w-3" />
                Guardian
              </TabsTrigger>
              <TabsTrigger value="address" className="text-xs gap-1">
                <MapPin className="h-3 w-3" />
                Address
              </TabsTrigger>
              <TabsTrigger value="other" className="text-xs gap-1">
                <Heart className="h-3 w-3" />
                Other
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] pr-4">
              {/* Photo Tab */}
              <TabsContent value="photo" className="space-y-4 mt-0">
                <div className="flex flex-col items-center justify-center py-8">
                  <PhotoUpload
                    currentPhotoUrl={formData.photo_url}
                    onPhotoChange={(url) => updateField("photo_url", url)}
                    folder="students"
                    name={formData.name}
                  />
                  <p className="text-sm text-muted-foreground mt-4">
                    Upload a passport size photo (max 5MB)
                  </p>
                </div>
              </TabsContent>

              {/* Basic Information */}
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
                    <Label htmlFor="roll_no">Roll No</Label>
                    <Input
                      id="roll_no"
                      value={formData.roll_no}
                      onChange={(e) => updateField("roll_no", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => updateField("date_of_birth", e.target.value)}
                    />
                  </div>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => updateField("nationality", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Input
                      id="religion"
                      value={formData.religion}
                      onChange={(e) => updateField("religion", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                        <SelectItem value="st">ST</SelectItem>
                        <SelectItem value="obc">OBC</SelectItem>
                        <SelectItem value="ews">EWS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </TabsContent>

              {/* Admission Details */}
              <TabsContent value="admission" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admission_no">Admission No</Label>
                    <Input
                      id="admission_no"
                      value={formData.admission_no}
                      onChange={(e) => updateField("admission_no", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admission_date">Admission Date</Label>
                    <Input
                      id="admission_date"
                      type="date"
                      value={formData.admission_date}
                      onChange={(e) => updateField("admission_date", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class">Class *</Label>
                    <Select value={formData.class_id} onValueChange={(v) => updateField("class_id", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee_status">Fee Status</Label>
                    <Select
                      value={formData.fee_status}
                      onValueChange={(v: FeeStatus) => updateField("fee_status", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previous_school">Previous School</Label>
                  <Input
                    id="previous_school"
                    value={formData.previous_school}
                    onChange={(e) => updateField("previous_school", e.target.value)}
                    placeholder="Name of previous school (if any)"
                  />
                </div>
              </TabsContent>

              {/* Guardian Information */}
              <TabsContent value="guardian" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent_name">Father's Name</Label>
                    <Input
                      id="parent_name"
                      value={formData.parent_name}
                      onChange={(e) => updateField("parent_name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="father_occupation">Father's Occupation</Label>
                    <Input
                      id="father_occupation"
                      value={formData.father_occupation}
                      onChange={(e) => updateField("father_occupation", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mother_name">Mother's Name</Label>
                    <Input
                      id="mother_name"
                      value={formData.mother_name}
                      onChange={(e) => updateField("mother_name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mother_occupation">Mother's Occupation</Label>
                    <Input
                      id="mother_occupation"
                      value={formData.mother_occupation}
                      onChange={(e) => updateField("mother_occupation", e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium mb-3">Guardian (if other than parents)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guardian_name">Guardian Name</Label>
                      <Input
                        id="guardian_name"
                        value={formData.guardian_name}
                        onChange={(e) => updateField("guardian_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardian_relation">Relationship</Label>
                      <Input
                        id="guardian_relation"
                        value={formData.guardian_relation}
                        onChange={(e) => updateField("guardian_relation", e.target.value)}
                        placeholder="e.g., Uncle, Aunt"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="guardian_phone">Guardian Phone</Label>
                    <Input
                      id="guardian_phone"
                      value={formData.guardian_phone}
                      onChange={(e) => updateField("guardian_phone", e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Address Details */}
              <TabsContent value="address" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="address">Current Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="House No, Street, Locality"
                    rows={3}
                  />
                </div>

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
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => updateField("district", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => updateField("state", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin_code">PIN Code</Label>
                    <Input
                      id="pin_code"
                      value={formData.pin_code}
                      onChange={(e) => updateField("pin_code", e.target.value)}
                      maxLength={6}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Other Details */}
              <TabsContent value="other" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="medical_conditions">Medical Conditions</Label>
                  <Textarea
                    id="medical_conditions"
                    value={formData.medical_conditions}
                    onChange={(e) => updateField("medical_conditions", e.target.value)}
                    placeholder="Any allergies, chronic conditions, or special medical needs"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={(e) => updateField("emergency_contact", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone">Emergency Phone</Label>
                    <Input
                      id="emergency_phone"
                      value={formData.emergency_phone}
                      onChange={(e) => updateField("emergency_phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="transport">Transport Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Does the student need school transport?
                      </p>
                    </div>
                    <Switch
                      id="transport"
                      checked={formData.transport_required}
                      onCheckedChange={(checked) => updateField("transport_required", checked)}
                    />
                  </div>

                  {formData.transport_required && (
                    <div className="space-y-2">
                      <Label htmlFor="pickup_point">Pickup Point</Label>
                      <Input
                        id="pickup_point"
                        value={formData.pickup_point}
                        onChange={(e) => updateField("pickup_point", e.target.value)}
                        placeholder="e.g., Near City Mall, Main Road"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-gradient" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Student" : "Add Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
