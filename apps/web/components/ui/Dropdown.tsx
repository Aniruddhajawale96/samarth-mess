import * as React from "react";
import { cn } from "../../lib/utils";

export interface DropdownProps {
  trigger: React.ReactNode;
  dropdownContent: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ className, trigger, dropdownContent, align = "left" }: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative inline-block text-left", className)}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-10 mt-2 w-56 rounded-md bg-[var(--surface)] shadow-[var(--shadow)] ring-1 ring-black ring-opacity-5 focus:outline-none",
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          )}
        >
          <div className="py-1">{dropdownContent}</div>
        </div>
      )}
    </div>
  );
}
