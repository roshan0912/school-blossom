import { Card, CardContent } from "@/components/ui/card";
import { LibraryBig } from "lucide-react";

export default function Library() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-muted-foreground">
          Book inventory and issue/return management
        </p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <LibraryBig className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Manage book inventory, track issue/return cycles, calculate fines,
            and monitor student reading activity. Database is ready — UI is
            under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
