import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBooks, useCreateBook, useDeleteBook, useLibraryIssues, useCreateIssue, useReturnBook } from "@/hooks/useLibrary";
import { useStudents } from "@/hooks/useStudents";
import { BookOpen, Trash2, MoreHorizontal, RotateCcw, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function Library() {
  const { data: books, isLoading: bLoading } = useBooks();
  const { data: issues, isLoading: iLoading } = useLibraryIssues();
  const { data: students } = useStudents();
  const createBook = useCreateBook();
  const deleteBook = useDeleteBook();
  const createIssue = useCreateIssue();
  const returnBook = useReturnBook();
  const [bookDialog, setBookDialog] = useState(false);
  const [issueDialog, setIssueDialog] = useState(false);
  const [bForm, setBForm] = useState({ title: "", author: "", isbn: "", category: "", total_copies: "1", location: "", publisher: "" });
  const [issForm, setIssForm] = useState({ book_id: "", student_id: "", due_date: "" });

  const handleAddBook = () => {
    if (!bForm.title) return;
    createBook.mutate({
      title: bForm.title,
      author: bForm.author || null,
      isbn: bForm.isbn || null,
      category: bForm.category || null,
      total_copies: Number(bForm.total_copies) || 1,
      available_copies: Number(bForm.total_copies) || 1,
      location: bForm.location || null,
      publisher: bForm.publisher || null,
    });
    setBookDialog(false);
    setBForm({ title: "", author: "", isbn: "", category: "", total_copies: "1", location: "", publisher: "" });
  };

  const handleIssue = () => {
    if (!issForm.book_id || !issForm.student_id || !issForm.due_date) return;
    createIssue.mutate({ book_id: issForm.book_id, student_id: issForm.student_id, due_date: issForm.due_date });
    setIssueDialog(false);
    setIssForm({ book_id: "", student_id: "", due_date: "" });
  };

  const bookColumns = [
    { key: "title", label: "Title", render: (i: any) => <div><p className="font-medium">{i.title}</p><p className="text-xs text-muted-foreground">{i.author || "Unknown author"}</p></div> },
    { key: "isbn", label: "ISBN", render: (i: any) => i.isbn || "—" },
    { key: "category", label: "Category", render: (i: any) => i.category ? <Badge variant="outline">{i.category}</Badge> : "—" },
    { key: "copies", label: "Available", render: (i: any) => <span className={i.available_copies === 0 ? "text-destructive font-semibold" : "text-success font-semibold"}>{i.available_copies}/{i.total_copies}</span> },
    { key: "location", label: "Location", render: (i: any) => i.location || "—" },
    {
      key: "actions", label: "Actions", render: (i: any) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteBook.mutate(i.id)}><Trash2 className="h-4 w-4" /></Button>
      ),
    },
  ];

  const issueColumns = [
    { key: "book", label: "Book", render: (i: any) => <span className="font-medium">{i.library_books?.title || "—"}</span> },
    { key: "student", label: "Student", render: (i: any) => i.students?.name || "—" },
    { key: "issue_date", label: "Issued", render: (i: any) => format(new Date(i.issue_date), "dd MMM yyyy") },
    { key: "due_date", label: "Due", render: (i: any) => format(new Date(i.due_date), "dd MMM yyyy") },
    {
      key: "status", label: "Status", render: (i: any) => (
        <Badge variant="outline" className={i.status === "returned" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>
          {i.status === "returned" ? "Returned" : "Issued"}
        </Badge>
      ),
    },
    {
      key: "actions", label: "Actions", render: (i: any) => i.status !== "returned" ? (
        <Button variant="outline" size="sm" className="gap-1" onClick={() => returnBook.mutate({ issueId: i.id, bookId: i.book_id })}>
          <RotateCcw className="h-3.5 w-3.5" /> Return
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Library</h1>
        <p className="page-description">Book inventory and issue/return management</p>
      </div>

      <Tabs defaultValue="books">
        <TabsList>
          <TabsTrigger value="books">Book Inventory</TabsTrigger>
          <TabsTrigger value="issues">Issued Books</TabsTrigger>
        </TabsList>
        <TabsContent value="books" className="mt-4">
          <DataTable data={books || []} columns={bookColumns} searchPlaceholder="Search books..." onAdd={() => setBookDialog(true)} addLabel="Add Book" isLoading={bLoading} />
        </TabsContent>
        <TabsContent value="issues" className="mt-4">
          <DataTable data={issues || []} columns={issueColumns} searchPlaceholder="Search issues..." onAdd={() => setIssueDialog(true)} addLabel="Issue Book" isLoading={iLoading} />
        </TabsContent>
      </Tabs>

      <Dialog open={bookDialog} onOpenChange={setBookDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Book</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={bForm.title} onChange={(e) => setBForm({ ...bForm, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Author</Label><Input value={bForm.author} onChange={(e) => setBForm({ ...bForm, author: e.target.value })} /></div>
              <div><Label>ISBN</Label><Input value={bForm.isbn} onChange={(e) => setBForm({ ...bForm, isbn: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Input value={bForm.category} onChange={(e) => setBForm({ ...bForm, category: e.target.value })} placeholder="e.g. Fiction, Science" /></div>
              <div><Label>Total Copies</Label><Input type="number" value={bForm.total_copies} onChange={(e) => setBForm({ ...bForm, total_copies: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Location</Label><Input value={bForm.location} onChange={(e) => setBForm({ ...bForm, location: e.target.value })} placeholder="e.g. Shelf A3" /></div>
              <div><Label>Publisher</Label><Input value={bForm.publisher} onChange={(e) => setBForm({ ...bForm, publisher: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookDialog(false)}>Cancel</Button>
            <Button onClick={handleAddBook} className="btn-gradient">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={issueDialog} onOpenChange={setIssueDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Issue Book</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Book *</Label>
              <Select value={issForm.book_id} onValueChange={(v) => setIssForm({ ...issForm, book_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select book" /></SelectTrigger>
                <SelectContent>{books?.filter(b => b.available_copies > 0).map((b) => <SelectItem key={b.id} value={b.id}>{b.title} ({b.available_copies} available)</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Student *</Label>
              <Select value={issForm.student_id} onValueChange={(v) => setIssForm({ ...issForm, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Due Date *</Label><Input type="date" value={issForm.due_date} onChange={(e) => setIssForm({ ...issForm, due_date: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialog(false)}>Cancel</Button>
            <Button onClick={handleIssue} className="btn-gradient">Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
