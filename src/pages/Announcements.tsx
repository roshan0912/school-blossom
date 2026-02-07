import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export default function Announcements() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Announcements</h1>
        <p className="text-muted-foreground">
          School notices and communications
        </p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Megaphone className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Create school-wide or class-specific announcements with priority
            levels and expiry dates. Database is ready — UI is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
