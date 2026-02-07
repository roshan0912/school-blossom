import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function Homework() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Homework</h1>
        <p className="text-muted-foreground">
          Assign and track homework for classes
        </p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ClipboardList className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Assign homework to classes, upload files, set due dates, and track
            completion. Database is ready — UI is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
