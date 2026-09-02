import * as React from "react";
import { cn } from "../../lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn("flex items-center gap-2 cursor-pointer", className)}>
        <input type="checkbox" ref={ref} className="accent-[var(--green)] w-4 h-4" {...props} />
        <span className="text-sm font-medium">{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
