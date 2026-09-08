import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "border-blue-400/25 bg-blue-950/35 text-blue-200",
  success: "border-emerald-400/25 bg-emerald-950/35 text-emerald-200",
  warning: "border-amber-400/25 bg-amber-950/35 text-amber-200",
  muted: "border-zinc-700 bg-zinc-900/80 text-zinc-400",
  outline: "border-zinc-700/80 bg-zinc-900/30 text-zinc-300",
};

export const Badge = forwardRef(function Badge(
  { className, variant = "default", ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
});
