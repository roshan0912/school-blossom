import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Class = Database["public"]["Tables"]["classes"]["Row"];
type ClassInsert = Database["public"]["Tables"]["classes"]["Insert"];
type ClassUpdate = Database["public"]["Tables"]["classes"]["Update"];

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select(`
          *,
          teachers(id, name)
        `)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classData: ClassInsert) => {
      const { data, error } = await supabase
        .from("classes")
        .insert(classData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add class: " + error.message);
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ClassUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("classes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update class: " + error.message);
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete class: " + error.message);
    },
  });
}
