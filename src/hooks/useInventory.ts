import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Item = Database["public"]["Tables"]["inventory_items"]["Row"];
type ItemInsert = Database["public"]["Tables"]["inventory_items"]["Insert"];
type Category = Database["public"]["Tables"]["inventory_categories"]["Row"];

export function useInventoryCategories() {
  return useQuery({
    queryKey: ["inventory_categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory_categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: Database["public"]["Tables"]["inventory_categories"]["Insert"]) => {
      const { data, error } = await supabase.from("inventory_categories").insert(c).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory_categories"] }); toast.success("Category added"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useInventoryItems() {
  return useQuery({
    queryKey: ["inventory_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select(`*, inventory_categories(id, name)`)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (i: ItemInsert) => {
      const { data, error } = await supabase.from("inventory_items").insert(i).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory_items"] }); toast.success("Item added"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Item> & { id: string }) => {
      const { data, error } = await supabase.from("inventory_items").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory_items"] }); toast.success("Item updated"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory_items"] }); toast.success("Item deleted"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}
