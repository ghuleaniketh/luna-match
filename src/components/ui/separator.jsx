import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Separator = forwardRef(function Separator(
  { className, orientation = "horizontal", ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-slate-800/80",
        orientation === "vertical" ? "h-full w-px" : "h-px w-full",
        className,
      )}
      {...props}
    />
  );
});

