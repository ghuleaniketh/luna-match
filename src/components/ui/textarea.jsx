import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-20 w-full resize-y rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 shadow-sm transition-colors placeholder:text-slate-500 focus-visible:border-cyan-500/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

