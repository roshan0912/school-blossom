import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoutes, useCreateRoute, useDeleteRoute, useTransportAssignments, useCreateAssignment, useDeleteAssignment } from "@/hooks/useTransport";
import { useStudents } from "@/hooks/useStudents";
import { Bus, Trash2, MapPin, Phone, Users } from "lucide-react";

export default function TransportPage() {
  const { data: routes, isLoading: rLoading } = useRoutes();
  const { data: assignments, isLoading: aLoading } = useTransportAssignments();
  const { data: students } = useStudents();
  const createRoute = useCreateRoute();
  const deleteRoute = useDeleteRoute();
  const createAssignment = useCreateAssignment();
  const deleteAssignment = useDeleteAssignment();
  const [routeDialog, setRouteDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [rForm, setRForm] = useState({ route_name: "", route_number: "", driver_name: "", driver_phone: "", vehicle_number: "", capacity: "" });
  const [aForm, setAForm] = useState({ route_id: "", student_id: "", pickup_point: "" });

  const handleAddRoute = () => {
    if (!rForm.route_name) return;
    createRoute.mutate({
      route_name: rForm.route_name,
      route_number: rForm.route_number || null,
      driver_name: rForm.driver_name || null,
      driver_phone: rForm.driver_phone || null,
      vehicle_number: rForm.vehicle_number || null,
      capacity: Number(rForm.capacity) || 0,
    });
    setRouteDialog(false);
    setRForm({ route_name: "", route_number: "", driver_name: "", driver_phone: "", vehicle_number: "", capacity: "" });
  };

  const handleAssign = () => {
    if (!aForm.route_id || !aForm.student_id) return;
    createAssignment.mutate({ route_id: aForm.route_id, student_id: aForm.student_id, pickup_point: aForm.pickup_point || null });
    setAssignDialog(false);
    setAForm({ route_id: "", student_id: "", pickup_point: "" });
  };

  const routeColumns = [
    { key: "route_name", label: "Route", render: (i: any) => <div><p className="font-medium">{i.route_name}</p>{i.route_number && <p className="text-xs text-muted-foreground">#{i.route_number}</p>}</div> },
    { key: "driver_name", label: "Driver", render: (i: any) => i.driver_name || "—" },
    { key: "driver_phone", label: "Phone", render: (i: any) => i.driver_phone ? <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{i.driver_phone}</span> : "—" },
    { key: "vehicle_number", label: "Vehicle", render: (i: any) => i.vehicle_number ? <Badge variant="outline">{i.vehicle_number}</Badge> : "—" },
    { key: "capacity", label: "Capacity", render: (i: any) => <span className="flex items-center gap-1"><Users className="h-3 w-3" />{i.capacity || 0}</span> },
    { key: "actions", label: "Actions", render: (i: any) => <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteRoute.mutate(i.id)}><Trash2 className="h-4 w-4" /></Button> },
  ];

  const assignColumns = [
    { key: "student", label: "Student", render: (i: any) => <span className="font-medium">{i.students?.name || "—"}</span> },
    { key: "route", label: "Route", render: (i: any) => i.transport_routes?.route_name || "—" },
    { key: "pickup_point", label: "Pickup Point", render: (i: any) => i.pickup_point ? <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{i.pickup_point}</span> : "—" },
    { key: "actions", label: "Actions", render: (i: any) => <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteAssignment.mutate(i.id)}><Trash2 className="h-4 w-4" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Transport</h1>
        <p className="page-description">Bus routes, drivers, and student assignments</p>
      </div>

      <Tabs defaultValue="routes">
        <TabsList>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="assignments">Student Assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="routes" className="mt-4">
          <DataTable data={routes || []} columns={routeColumns} searchPlaceholder="Search routes..." onAdd={() => setRouteDialog(true)} addLabel="Add Route" isLoading={rLoading} />
        </TabsContent>
        <TabsContent value="assignments" className="mt-4">
          <DataTable data={assignments || []} columns={assignColumns} searchPlaceholder="Search assignments..." onAdd={() => setAssignDialog(true)} addLabel="Assign Student" isLoading={aLoading} />
        </TabsContent>
      </Tabs>

      <Dialog open={routeDialog} onOpenChange={setRouteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Route</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Route Name *</Label><Input value={rForm.route_name} onChange={(e) => setRForm({ ...rForm, route_name: e.target.value })} placeholder="e.g. Route A" /></div>
              <div><Label>Route Number</Label><Input value={rForm.route_number} onChange={(e) => setRForm({ ...rForm, route_number: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Driver Name</Label><Input value={rForm.driver_name} onChange={(e) => setRForm({ ...rForm, driver_name: e.target.value })} /></div>
              <div><Label>Driver Phone</Label><Input value={rForm.driver_phone} onChange={(e) => setRForm({ ...rForm, driver_phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Vehicle Number</Label><Input value={rForm.vehicle_number} onChange={(e) => setRForm({ ...rForm, vehicle_number: e.target.value })} /></div>
              <div><Label>Capacity</Label><Input type="number" value={rForm.capacity} onChange={(e) => setRForm({ ...rForm, capacity: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRouteDialog(false)}>Cancel</Button>
            <Button onClick={handleAddRoute} className="btn-gradient">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Student to Route</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Route *</Label>
              <Select value={aForm.route_id} onValueChange={(v) => setAForm({ ...aForm, route_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                <SelectContent>{routes?.map((r) => <SelectItem key={r.id} value={r.id}>{r.route_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Student *</Label>
              <Select value={aForm.student_id} onValueChange={(v) => setAForm({ ...aForm, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Pickup Point</Label><Input value={aForm.pickup_point} onChange={(e) => setAForm({ ...aForm, pickup_point: e.target.value })} placeholder="e.g. Main Gate, Stop 3" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssign} className="btn-gradient">Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
