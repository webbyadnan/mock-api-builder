import { cn } from "@/lib/utils";
import { METHOD_COLORS, type HttpMethod } from "@/types";

interface BadgeProps {
  method: HttpMethod;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({ method, className, size = "md" }: BadgeProps) {
  const colors = METHOD_COLORS[method];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border font-mono font-semibold uppercase tracking-wider",
        colors.bg,
        colors.text,
        colors.border,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      {method}
    </span>
  );
}
