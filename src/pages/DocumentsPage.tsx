import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground">
          Upload and manage student/teacher files securely
        </p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FolderOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Upload and store student certificates, teacher documents, and school
            files securely. Database is ready — UI is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
