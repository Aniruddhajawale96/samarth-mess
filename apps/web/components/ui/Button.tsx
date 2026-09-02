import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
  wide?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", wide, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "button",
          variant === "primary" && "button-primary",
          variant === "secondary" && "button-secondary",
          variant === "ghost" && "text-button",
          size === "sm" && "small-button",
          wide && "button-wide",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
