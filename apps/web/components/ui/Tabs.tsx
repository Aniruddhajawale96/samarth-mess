import * as React from "react";
import { cn } from "../../lib/utils";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  tabs: { label: string; value: string }[];
}

export function Tabs({ className, value, onValueChange, tabs, ...props }: TabsProps) {
  return (
    <div className={cn("flex items-center gap-2 border-b border-[var(--line)]", className)} {...props}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onValueChange(tab.value)}
          className={cn(
            "px-4 py-2 text-sm font-bold border-b-2 transition-colors",
            value === tab.value
              ? "border-[var(--green)] text-[var(--green)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
