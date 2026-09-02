import * as React from "react";
import { cn } from "../../lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "error" | "notice";
  onClose?: () => void;
}

export function Alert({ className, variant = "default", onClose, children, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        variant === "error" ? "error-banner" : "notice",
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} aria-label="Close" type="button">
          &times;
        </button>
      )}
    </div>
  );
}
