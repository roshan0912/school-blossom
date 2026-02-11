import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventoryItems, useCreateItem, useDeleteItem, useInventoryCategories, useCreateCategory } from "@/hooks/useInventory";
import { Package, Trash2, Plus, Boxes } from "lucide-react";
import { formatINR } from "@/lib/pdfGenerator";

export default function InventoryPage() {
  const { data: items, isLoading: itemsLoading } = useInventoryItems();
  const { data: categories } = useInventoryCategories();
  const createItem = useCreateItem();
  const deleteItem = useDeleteItem();
  const createCategory = useCreateCategory();
  const [itemDialog, setItemDialog] = useState(false);
  const [catDialog, setCatDialog] = useState(false);
  const [form, setForm] = useState({ name: "", category_id: "", quantity: "1", unit: "pieces", location: "", condition: "good", purchase_value: "0", supplier: "" });
  const [catForm, setCatForm] = useState({ name: "", description: "" });

  const totalValue = items?.reduce((s, i) => s + (Number(i.purchase_value) || 0) * i.quantity, 0) || 0;
  const totalItems = items?.reduce((s, i) => s + i.quantity, 0) || 0;

  const handleAddItem = () => {
    if (!form.name) return;
    createItem.mutate({
      name: form.name,
      category_id: form.category_id || null,
      quantity: Number(form.quantity) || 1,
      unit: form.unit || "pieces",
      location: form.location || null,
      condition: form.condition || "good",
      purchase_value: Number(form.purchase_value) || 0,
      supplier: form.supplier || null,
    });
    setItemDialog(false);
    setForm({ name: "", category_id: "", quantity: "1", unit: "pieces", location: "", condition: "good", purchase_value: "0", supplier: "" });
  };

  const handleAddCategory = () => {
    if (!catForm.name) return;
    createCategory.mutate({ name: catForm.name, description: catForm.description || null });
    setCatDialog(false);
    setCatForm({ name: "", description: "" });
  };

  const conditionColors: Record<string, string> = {
    good: "bg-success/10 text-success border-success/20",
    fair: "bg-warning/10 text-warning border-warning/20",
    poor: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const itemColumns = [
    { key: "name", label: "Item", render: (i: any) => <span className="font-medium">{i.name}</span> },
    { key: "category", label: "Category", render: (i: any) => i.inventory_categories?.name ? <Badge variant="outline">{i.inventory_categories.name}</Badge> : "—" },
    { key: "quantity", label: "Qty", render: (i: any) => `${i.quantity} ${i.unit || ""}` },
    { key: "condition", label: "Condition", render: (i: any) => <Badge variant="outline" className={conditionColors[i.condition] || ""}>{i.condition || "—"}</Badge> },
    { key: "location", label: "Location", render: (i: any) => i.location || "—" },
    { key: "value", label: "Value", render: (i: any) => formatINR(Number(i.purchase_value || 0) * i.quantity) },
    { key: "actions", label: "Actions", render: (i: any) => <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteItem.mutate(i.id)}><Trash2 className="h-4 w-4" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Inventory</h1>
        <p className="page-description">Assets, lab equipment, and stock management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-muted-foreground">Total Items</p><p className="text-2xl font-bold mt-1">{totalItems}</p></div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary"><Package className="h-6 w-6" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-muted-foreground">Categories</p><p className="text-2xl font-bold mt-1">{categories?.length || 0}</p></div>
          <div className="p-3 rounded-xl bg-info/10 text-info"><Boxes className="h-6 w-6" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-muted-foreground">Total Value</p><p className="text-2xl font-bold mt-1 text-success">{formatINR(totalValue)}</p></div>
          <div className="p-3 rounded-xl bg-success/10 text-success"><Package className="h-6 w-6" /></div>
        </CardContent></Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setCatDialog(true)}><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      <DataTable data={items || []} columns={itemColumns} searchPlaceholder="Search items..." onAdd={() => setItemDialog(true)} addLabel="Add Item" isLoading={itemsLoading} />

      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Condition</Label>
                <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
              <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
              <div><Label>Value (₹)</Label><Input type="number" value={form.purchase_value} onChange={(e) => setForm({ ...form, purchase_value: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Supplier</Label><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog(false)}>Cancel</Button>
            <Button onClick={handleAddItem} className="btn-gradient">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} /></div>
            <div><Label>Description</Label><Input value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCategory} className="btn-gradient">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
