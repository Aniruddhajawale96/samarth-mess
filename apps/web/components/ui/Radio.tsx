import * as React from "react";
import { cn } from "../../lib/utils";

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn("flex items-center gap-2 cursor-pointer", className)}>
        <input type="radio" ref={ref} className="accent-[var(--green)] w-4 h-4" {...props} />
        <span className="text-sm font-medium">{label}</span>
      </label>
    );
  }
);
Radio.displayName = "Radio";
