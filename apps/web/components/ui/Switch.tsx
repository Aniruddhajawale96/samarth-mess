import * as React from "react";
import { cn } from "../../lib/utils";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn("flex items-center gap-2 cursor-pointer", className)}>
        <div className="relative">
          <input type="checkbox" ref={ref} className="sr-only peer" {...props} />
          <div className="w-11 h-6 bg-[var(--line)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--green)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--green)]"></div>
        </div>
        {label && <span className="text-sm font-medium">{label}</span>}
      </label>
    );
  }
);
Switch.displayName = "Switch";
