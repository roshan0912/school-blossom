import { cn } from "@/lib/utils";

interface SchoolLogoProps {
  className?: string;
  size?: number;
  showRing?: boolean;
}

/**
 * Vedanta Valley Public School official logo.
 * Use this everywhere the brand mark is needed instead of a generic icon.
 */
export function SchoolLogo({ className, size = 40, showRing = true }: SchoolLogoProps) {
  return (
    <div
      className={cn(
        "school-logo-surface relative inline-flex items-center justify-center overflow-hidden rounded-lg shrink-0",
        showRing && "ring-1 ring-border/60 shadow-sm",
        className
      )}
      style={{ width: size, height: size }}
    >
      <img
        src="/images/school-logo.jpg"
        alt="Vedanta Valley Public School"
        className="w-full h-full object-contain p-0.5"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
