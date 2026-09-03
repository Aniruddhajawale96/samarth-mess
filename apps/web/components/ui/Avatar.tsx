import * as React from "react";
import { cn } from "../../lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  fallback?: string;
  size?: "sm" | "default" | "lg";
}

export function Avatar({ className, src, fallback, size = "default", ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-[var(--line)] text-[var(--muted)] font-bold rounded-full",
        size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-16 h-16 text-lg" : "w-10 h-10 text-sm",
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span>{fallback || "?"}</span>
      )}
    </div>
  );
}
