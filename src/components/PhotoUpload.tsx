import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoChange: (url: string | null) => void;
  folder: "students" | "teachers";
  name?: string;
}

export function PhotoUpload({ currentPhotoUrl, onPhotoChange, folder, name = "" }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop changes (e.g., when editing existing record)
  useEffect(() => {
    setPreviewUrl(currentPhotoUrl || null);
    setLocalPreview(null);
  }, [currentPhotoUrl]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayUrl = localPreview || previewUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Create instant local preview
    const objectUrl = URL.createObjectURL(file);
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(objectUrl);

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(fileName);

      setPreviewUrl(urlData.publicUrl);
      setLocalPreview(null);
      onPhotoChange(urlData.publicUrl);
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload photo");
      // Remove local preview on error
      setLocalPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setPreviewUrl(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-2 border-border overflow-hidden bg-primary/10 flex items-center justify-center">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={name || "Photo preview"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-medium text-primary">
              {name ? getInitials(name) : "?"}
            </span>
          )}
        </div>
        {displayUrl && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
            onClick={handleRemovePhoto}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            {displayUrl ? "Change Photo" : "Upload Photo"}
          </>
        )}
      </Button>
    </div>
  );
}
