import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Route = Database["public"]["Tables"]["transport_routes"]["Row"];
type RouteInsert = Database["public"]["Tables"]["transport_routes"]["Insert"];

export function useRoutes() {
  return useQuery({
    queryKey: ["transport_routes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("transport_routes").select("*").order("route_name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: RouteInsert) => {
      const { data, error } = await supabase.from("transport_routes").insert(r).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport_routes"] }); toast.success("Route added"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useUpdateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Route> & { id: string }) => {
      const { data, error } = await supabase.from("transport_routes").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport_routes"] }); toast.success("Route updated"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useDeleteRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transport_routes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport_routes"] }); toast.success("Route deleted"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useTransportAssignments() {
  return useQuery({
    queryKey: ["transport_assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transport_assignments")
        .select(`*, transport_routes(id, route_name, route_number), students(id, name, roll_no)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: Database["public"]["Tables"]["transport_assignments"]["Insert"]) => {
      const { data, error } = await supabase.from("transport_assignments").insert(a).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport_assignments"] }); toast.success("Student assigned to route"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transport_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport_assignments"] }); toast.success("Assignment removed"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}
