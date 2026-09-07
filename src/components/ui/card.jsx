import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Card = forwardRef(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-slate-800/90 bg-slate-950/70 text-slate-100 shadow-xl backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
});

export const CardHeader = forwardRef(function CardHeader(
  { className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  );
});

export const CardTitle = forwardRef(function CardTitle(
  { className, ...props },
  ref,
) {
  return (
    <h3 ref={ref} className={cn("font-semibold tracking-tight", className)} {...props} />
  );
});

export const CardDescription = forwardRef(function CardDescription(
  { className, ...props },
  ref,
) {
  return (
    <p ref={ref} className={cn("text-sm text-slate-400", className)} {...props} />
  );
});

export const CardContent = forwardRef(function CardContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />;
});

export const CardFooter = forwardRef(function CardFooter(
  { className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  );
});

