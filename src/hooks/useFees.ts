import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type FeeStructure = Database["public"]["Tables"]["fee_structures"]["Row"];
type FeeStructureInsert = Database["public"]["Tables"]["fee_structures"]["Insert"];
type FeeInstallment = Database["public"]["Tables"]["fee_installments"]["Row"];

export function useFeeStructures() {
  return useQuery({
    queryKey: ["fee_structures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fee_structures")
        .select(`*, classes(id, name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateFeeStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fs: FeeStructureInsert) => {
      const { data, error } = await supabase.from("fee_structures").insert(fs).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fee_structures"] }); toast.success("Fee structure created"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useDeleteFeeStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fee_structures").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fee_structures"] }); toast.success("Fee structure deleted"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useFeeInstallments(studentId?: string) {
  return useQuery({
    queryKey: ["fee_installments", studentId],
    queryFn: async () => {
      let query = supabase
        .from("fee_installments")
        .select(`*, fee_structures(id, name, fee_type, amount), students(id, name, roll_no)`)
        .order("due_date", { ascending: true });
      if (studentId) query = query.eq("student_id", studentId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateFeeInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fi: Database["public"]["Tables"]["fee_installments"]["Insert"]) => {
      const { data, error } = await supabase.from("fee_installments").insert(fi).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fee_installments"] }); toast.success("Installment created"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useUpdateFeeInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeeInstallment> & { id: string }) => {
      const { data, error } = await supabase.from("fee_installments").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fee_installments"] }); qc.invalidateQueries({ queryKey: ["fee-stats"] }); qc.invalidateQueries({ queryKey: ["total-income"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); toast.success("Installment updated"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useDeleteFeeInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fee_installments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fee_installments"] }); qc.invalidateQueries({ queryKey: ["fee-stats"] }); qc.invalidateQueries({ queryKey: ["total-income"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); toast.success("Installment deleted"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}
