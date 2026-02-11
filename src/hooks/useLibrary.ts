import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Book = Database["public"]["Tables"]["library_books"]["Row"];
type BookInsert = Database["public"]["Tables"]["library_books"]["Insert"];
type Issue = Database["public"]["Tables"]["library_issues"]["Row"];

export function useBooks() {
  return useQuery({
    queryKey: ["library_books"],
    queryFn: async () => {
      const { data, error } = await supabase.from("library_books").select("*").order("title");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: BookInsert) => {
      const { data, error } = await supabase.from("library_books").insert(b).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["library_books"] }); toast.success("Book added"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Book> & { id: string }) => {
      const { data, error } = await supabase.from("library_books").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["library_books"] }); toast.success("Book updated"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("library_books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["library_books"] }); toast.success("Book deleted"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useLibraryIssues() {
  return useQuery({
    queryKey: ["library_issues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_issues")
        .select(`*, library_books(id, title, author), students(id, name, roll_no)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (issue: Database["public"]["Tables"]["library_issues"]["Insert"]) => {
      const { data, error } = await supabase.from("library_issues").insert(issue).select().single();
      if (error) throw error;
      // Decrement available copies
      const { data: book } = await supabase.from("library_books").select("available_copies").eq("id", issue.book_id).single();
      if (book) {
        await supabase.from("library_books").update({ available_copies: Math.max(0, book.available_copies - 1) }).eq("id", issue.book_id);
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library_issues"] });
      qc.invalidateQueries({ queryKey: ["library_books"] });
      toast.success("Book issued");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useReturnBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ issueId, bookId, fine }: { issueId: string; bookId: string; fine?: number }) => {
      const { error } = await supabase
        .from("library_issues")
        .update({ status: "returned", return_date: new Date().toISOString().split("T")[0], fine: fine || 0 })
        .eq("id", issueId);
      if (error) throw error;
      // Increment available copies
      const { data: book } = await supabase.from("library_books").select("available_copies, total_copies").eq("id", bookId).single();
      if (book) {
        await supabase.from("library_books").update({ available_copies: Math.min(book.total_copies, book.available_copies + 1) }).eq("id", bookId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library_issues"] });
      qc.invalidateQueries({ queryKey: ["library_books"] });
      toast.success("Book returned");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}
