import * as React from "react";
import { cn } from "../../lib/utils";

export interface DialogProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
}

export const Dialog = React.forwardRef<HTMLDialogElement, DialogProps>(
  ({ className, open, onOpenChange, title, description, children, ...props }, ref) => {
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    React.useImperativeHandle(ref, () => dialogRef.current!);

    React.useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (open && !dialog.open) {
        dialog.showModal();
      } else if (!open && dialog.open) {
        dialog.close();
      }
    }, [open]);

    const handleClose = (e: React.SyntheticEvent<HTMLDialogElement>) => {
      onOpenChange?.(false);
      props.onClose?.(e);
    };

    return (
      <dialog
        ref={dialogRef}
        onClose={handleClose}
        className={cn(
          "panel backdrop:bg-black/50 p-6 m-auto max-w-lg w-full fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[var(--shadow)]",
          className
        )}
        {...props}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            {title && <h2 className="text-lg font-bold">{title}</h2>}
            {description && <p className="text-sm text-[var(--muted)] mt-1">{description}</p>}
          </div>
          {onOpenChange && (
            <button
              onClick={() => onOpenChange(false)}
              className="text-[var(--muted)] hover:text-[var(--ink)] p-1 text-xl leading-none"
            >
              &times;
            </button>
          )}
        </div>
        {children}
      </dialog>
    );
  }
);
Dialog.displayName = "Dialog";
