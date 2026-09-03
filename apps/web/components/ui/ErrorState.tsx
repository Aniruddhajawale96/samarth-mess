import * as React from "react";
import { cn } from "../../lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ className, message, onRetry, ...props }: ErrorStateProps) {
  const handleRetry = onRetry || (() => window.location.reload());
  return (
    <div className={cn("error-state", className)} {...props}>
      <p>{message || "Something went wrong."}</p>
      <button className="button button-secondary" onClick={handleRetry} style={{ marginTop: 12 }}>
        Try Again
      </button>
    </div>
  );
}
