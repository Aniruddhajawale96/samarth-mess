import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, ...props }, ref) => {
    return (
      <div className={cn("stack", className)}>
        {label && <label className="field-label" htmlFor={props.id}>{label}</label>}
        <input ref={ref} className="input" {...props} />
        {hint && <p className="hint">{hint}</p>}
        {error && <p className="hint" style={{ color: "var(--red)" }}>{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
