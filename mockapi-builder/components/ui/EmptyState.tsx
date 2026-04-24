import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#E5E1D8] bg-[#F0EDE6] text-[#9C9789]">
          {icon}
        </div>
      )}
      <h3 className="font-mono text-lg font-semibold text-[#1A1A1A]">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-[#9C9789]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
