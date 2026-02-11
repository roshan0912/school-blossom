import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Document = Database["public"]["Tables"]["documents"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];

export function useDocuments(entityType?: string) {
  return useQuery({
    queryKey: ["documents", entityType],
    queryFn: async () => {
      let query = supabase.from("documents").select("*").order("created_at", { ascending: false });
      if (entityType) query = query.eq("entity_type", entityType);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: DocumentInsert) => {
      const { data, error } = await supabase.from("documents").insert(doc).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents"] }); toast.success("Document uploaded"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents"] }); toast.success("Document deleted"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export async function uploadDocument(file: File, entityType: string, entityId?: string) {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from("photos").upload(`documents/${fileName}`, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("photos").getPublicUrl(data.path);
  return urlData.publicUrl;
}
