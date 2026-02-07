import { Card, CardContent } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export default function FeeManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fee Management</h1>
        <p className="text-muted-foreground">
          Fee structures, installments, and payment tracking
        </p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Receipt className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Set up fee structures, manage installments, apply late fines,
            generate receipts, and view payment history. Database is ready — UI
            is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
