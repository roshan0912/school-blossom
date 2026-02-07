import { Card, CardContent } from "@/components/ui/card";
import { Bus } from "lucide-react";

export default function TransportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transport</h1>
        <p className="text-muted-foreground">
          Bus routes, drivers, and student assignments
        </p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Bus className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Manage bus routes, driver information, student-route assignments,
            and pickup schedules. Database is ready — UI is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
