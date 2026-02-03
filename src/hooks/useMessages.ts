import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  recipient_type: string;
  recipient_id: string | null;
  recipient_name: string | null;
  recipient_contact: string | null;
  message_type: string;
  subject: string | null;
  message: string;
  status: string | null;
  sent_at: string;
  created_at: string;
}

interface MessageInsert {
  recipient_type: string;
  recipient_id?: string | null;
  recipient_name?: string | null;
  recipient_contact?: string | null;
  message_type: string;
  subject?: string | null;
  message: string;
  status?: string;
}

export function useMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Message[];
    },
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messages: MessageInsert[]) => {
      const { data, error } = await supabase
        .from("messages")
        .insert(messages)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error) => {
      toast.error("Failed to log message: " + error.message);
    },
  });
}
