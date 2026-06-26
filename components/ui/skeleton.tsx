import { cn } from "@/lib/utils";

/**
 * Skeleton loading component
 * 
 * WHY: Better UX than spinners for content loading.
 * Mimics the shape of the content being loaded,
 * reducing layout shift and perceived load time.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-border-light", className)}
      {...props}
    />
  );
}

export { Skeleton };
