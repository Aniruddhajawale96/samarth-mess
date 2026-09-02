import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, ...props }, ref) => {
    return (
      <div className={cn("stack", className)}>
        {label && <label className="field-label" htmlFor={props.id}>{label}</label>}
        <textarea ref={ref} className={cn("input", "min-h-[80px]", className)} {...props} />
        {hint && <p className="hint">{hint}</p>}
        {error && <p className="hint" style={{ color: "var(--red)" }}>{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
