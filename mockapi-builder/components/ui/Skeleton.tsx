import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#E5E1D8]",
        className,
      )}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#E5E1D8] bg-white p-5">
      <Skeleton className="mb-3 h-5 w-2/3" />
      <Skeleton className="mb-4 h-3 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="mt-4 h-3 w-1/3" />
    </div>
  );
}

export function EndpointRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-[#E5E1D8] px-4 py-3">
      <Skeleton className="h-6 w-14" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="ml-auto h-4 w-16" />
    </div>
  );
}
