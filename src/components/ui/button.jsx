import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
  default:
    "bg-blue-500 text-white shadow-sm shadow-blue-950/40 hover:bg-blue-400",
  secondary:
    "border border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800",
  outline:
    "border border-zinc-700 bg-zinc-900/40 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/70",
  ghost: "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100",
  gradient:
    "bg-blue-500 text-white shadow-sm shadow-blue-950/40 hover:bg-blue-400",
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
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-[transform,background-color,border-color,box-shadow,color] duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 disabled:pointer-events-none disabled:opacity-40",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
});
