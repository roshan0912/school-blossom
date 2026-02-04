import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Users, User, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Recipient {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
}

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientType: "student" | "teacher";
  recipient?: Recipient | null;
  allRecipients?: Recipient[];
  isBulk?: boolean;
}

export function SendMessageDialog({
  open,
  onOpenChange,
  recipientType,
  recipient,
  allRecipients = [],
  isBulk = false,
}: SendMessageDialogProps) {
  const [messageType, setMessageType] = useState<"sms" | "email">("sms");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (messageType === "email" && !subject.trim()) {
      toast.error("Please enter a subject for email");
      return;
    }

    setIsSending(true);

    try {
      const recipients = isBulk ? allRecipients : recipient ? [recipient] : [];
      
      if (recipients.length === 0) {
        toast.error("No recipients selected");
        return;
      }

      let successCount = 0;
      let failCount = 0;

      // Send actual SMS messages via Twilio
      if (messageType === "sms") {
        for (const r of recipients) {
          if (!r.phone) {
            failCount++;
            continue;
          }

          try {
            const { data, error } = await supabase.functions.invoke('send-sms', {
              body: { to: r.phone, message: message }
            });

            if (error) throw error;
            
            if (data.success) {
              successCount++;
            } else {
              failCount++;
              console.error(`Failed to send SMS to ${r.name}:`, data.error);
            }
          } catch (err) {
            failCount++;
            console.error(`Failed to send SMS to ${r.name}:`, err);
          }
        }
      }

      // Log messages to database
      const messageRecords = recipients.map((r) => ({
        recipient_type: isBulk ? `all_${recipientType}s` : recipientType,
        recipient_id: r.id,
        recipient_name: r.name,
        recipient_contact: messageType === "sms" ? r.phone : r.email,
        message_type: messageType,
        subject: messageType === "email" ? subject : null,
        message: message,
        status: messageType === "sms" ? (successCount > 0 ? "sent" : "failed") : "sent",
      }));

      const { error } = await supabase.from("messages").insert(messageRecords);

      if (error) throw error;

      if (messageType === "sms") {
        if (successCount > 0 && failCount === 0) {
          toast.success(`SMS sent successfully to ${successCount} recipient(s)`);
        } else if (successCount > 0 && failCount > 0) {
          toast.warning(`SMS sent to ${successCount} recipient(s), failed for ${failCount}`);
        } else {
          toast.error("Failed to send SMS to all recipients");
        }
      } else {
        toast.success(
          `Email logged for ${isBulk ? `${recipients.length} ${recipientType}s` : recipient?.name}`,
          { description: "Email sending requires additional integration" }
        );
      }

      setMessage("");
      setSubject("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const recipientCount = isBulk ? allRecipients.length : 1;
  const hasPhone = isBulk
    ? allRecipients.some((r) => r.phone)
    : recipient?.phone;
  const hasEmail = isBulk
    ? allRecipients.some((r) => r.email)
    : recipient?.email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBulk ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
            Send Message
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Send message to all ${recipientType}s (${recipientCount} recipients)`
              : `Send message to ${recipient?.name || "recipient"}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient Info */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Recipients:</span>
              <Badge variant="secondary">
                {isBulk ? `${recipientCount} ${recipientType}s` : recipient?.name}
              </Badge>
            </div>
            {!isBulk && recipient && (
              <div className="text-xs text-muted-foreground space-y-1">
                {recipient.phone && <p>Phone: {recipient.phone}</p>}
                {recipient.email && <p>Email: {recipient.email}</p>}
              </div>
            )}
          </div>

          {/* Message Type Tabs */}
          <Tabs value={messageType} onValueChange={(v) => setMessageType(v as "sms" | "email")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sms" disabled={!hasPhone} className="gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="email" disabled={!hasEmail} className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sms" className="space-y-4 mt-4">
              {!hasPhone && (
                <p className="text-sm text-warning">
                  No phone numbers available for selected recipients
                </p>
              )}
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Type your SMS message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {message.length}/160 characters
                </p>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              {!hasEmail && (
                <p className="text-sm text-warning">
                  No email addresses available for selected recipients
                </p>
              )}
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Type your email message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMessage("Reminder: Please pay your pending fees by the end of this month.")}
              >
                Fee Reminder
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMessage("Notice: Parent-teacher meeting scheduled for this week. Please confirm your attendance.")}
              >
                PTM Notice
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMessage("Holiday Notice: School will remain closed on the mentioned date.")}
              >
                Holiday
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="btn-gradient gap-2"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSending ? "Sending..." : `Send ${messageType.toUpperCase()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
