import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Homework = Database["public"]["Tables"]["homework"]["Row"];
type HomeworkInsert = Database["public"]["Tables"]["homework"]["Insert"];

export function useHomework() {
  return useQuery({
    queryKey: ["homework"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homework")
        .select(`*, classes(id, name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (hw: HomeworkInsert) => {
      const { data, error } = await supabase.from("homework").insert(hw).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["homework"] }); toast.success("Homework assigned"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useUpdateHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Homework> & { id: string }) => {
      const { data, error } = await supabase.from("homework").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["homework"] }); toast.success("Homework updated"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useDeleteHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homework").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["homework"] }); toast.success("Homework deleted"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}
