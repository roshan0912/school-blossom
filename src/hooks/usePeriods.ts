import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePeriods() {
  return useQuery({
    queryKey: ["periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("periods")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (period: {
      name: string;
      start_time: string;
      end_time: string;
      order_index: number;
      is_break: boolean;
    }) => {
      const { data, error } = await supabase
        .from("periods")
        .insert(period)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      toast.success("Period added successfully");
    },
    onError: (e) => toast.error("Failed to add period: " + e.message),
  });
}

export function useUpdatePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      start_time?: string;
      end_time?: string;
      order_index?: number;
      is_break?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("periods")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      toast.success("Period updated");
    },
    onError: (e) => toast.error("Failed to update period: " + e.message),
  });
}

export function useDeletePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("periods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      queryClient.invalidateQueries({ queryKey: ["timetable-entries"] });
      toast.success("Period deleted");
    },
    onError: (e) => toast.error("Failed to delete period: " + e.message),
  });
}
