import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "rectangular" | "text";
  className?: string;
}

/**
 * Base skeleton loading component with CF-branded teal shimmer
 */
export function Skeleton({
  variant = "default",
  className,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    default: "rounded-lg",
    circular: "rounded-full",
    rectangular: "rounded-none",
    text: "rounded",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-cf-teal-100 via-cf-teal-50 to-cf-teal-100",
        variantClasses[variant],
        className
      )}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite",
      }}
      {...props}
    />
  );
}

