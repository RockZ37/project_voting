import * as React from "react";
import { cn } from "@/src/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
