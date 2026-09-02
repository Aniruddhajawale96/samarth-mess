import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  page: number;
  limit: number;
  total?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ className, page, limit, total, onPageChange, ...props }: PaginationProps) {
  const isFirst = page <= 1;
  const isLast = total ? page * limit >= total : false; // If total is unknown, we can't disable next reliably here, rely on caller

  return (
    <div className={cn("flex items-center justify-between px-2 py-4", className)} {...props}>
      <div className="text-sm text-[var(--muted)]">
        Page {page} {total && `of ${Math.ceil(total / limit)}`}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={isFirst} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" disabled={isLast} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
