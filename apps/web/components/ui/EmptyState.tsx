import * as React from "react";
import { cn } from "../../lib/utils";

export function EmptyState({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("empty", className)} {...props}>
      {children || "No records found"}
    </div>
  );
}
