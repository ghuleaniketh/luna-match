import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "border-cyan-500/40 bg-cyan-950/70 text-cyan-300",
  success: "border-emerald-500/40 bg-emerald-950/70 text-emerald-300",
  warning: "border-orange-500/40 bg-orange-950/60 text-orange-300",
  muted: "border-slate-700 bg-slate-900 text-slate-400",
  outline: "border-white/15 bg-white/[0.03] text-slate-300",
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

