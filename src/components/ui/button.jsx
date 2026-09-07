import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
  default:
    "bg-cyan-500 text-slate-950 shadow-[0_8px_24px_-10px_rgba(34,211,238,0.8)] hover:bg-cyan-400",
  secondary:
    "border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800",
  outline:
    "border border-white/15 bg-white/[0.04] text-slate-200 hover:border-cyan-400/50 hover:bg-white/[0.08]",
  ghost: "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100",
  gradient:
    "bg-gradient-to-r from-cyan-400 to-orange-400 text-slate-950 shadow-[0_8px_24px_-10px_rgba(34,211,238,0.8)] hover:brightness-110",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-8 rounded-lg px-3 text-xs",
  lg: "h-11 rounded-xl px-6",
  icon: "h-9 w-9",
};

export const Button = forwardRef(function Button(
  { className, variant = "default", size = "default", as = "button", ...props },
  ref,
) {
  const Component = as;

  return (
    <Component
      ref={ref}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 disabled:pointer-events-none disabled:opacity-40",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
});

