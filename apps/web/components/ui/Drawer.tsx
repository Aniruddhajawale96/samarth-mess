import * as React from "react";
import { cn } from "../../lib/utils";

export interface DrawerProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
}

export const Drawer = React.forwardRef<HTMLDialogElement, DrawerProps>(
  ({ className, open, onOpenChange, title, children, ...props }, ref) => {
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
          "panel backdrop:bg-black/50 p-6 m-0 max-w-sm w-full h-full fixed top-0 right-0 left-auto translate-x-0 rounded-none border-y-0 border-r-0 shadow-[-8px_0_24px_rgba(23,33,27,0.06)]",
          className
        )}
        {...props}
      >
        <div className="flex justify-between items-center mb-6">
          {title && <h2 className="text-xl font-bold">{title}</h2>}
          {onOpenChange && (
            <button
              onClick={() => onOpenChange(false)}
              className="text-[var(--muted)] hover:text-[var(--ink)] p-1 text-2xl leading-none"
            >
              &times;
            </button>
          )}
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)] -mx-6 px-6 pb-6">
          {children}
        </div>
      </dialog>
    );
  }
);
Drawer.displayName = "Drawer";
