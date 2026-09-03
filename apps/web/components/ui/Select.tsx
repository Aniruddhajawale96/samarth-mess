import * as React from "react";
import { cn } from "../../lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, options, ...props }, ref) => {
    return (
      <div className={cn("stack", className)}>
        {label && <label className="field-label" htmlFor={props.id}>{label}</label>}
        <select ref={ref} className="input" {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {hint && <p className="hint">{hint}</p>}
        {error && <p className="hint" style={{ color: "var(--red)" }}>{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
