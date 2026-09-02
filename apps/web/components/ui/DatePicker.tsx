import * as React from "react";
import { Input, InputProps } from "./Input";

export const DatePicker = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return <Input type="date" ref={ref} {...props} />;
  }
);
DatePicker.displayName = "DatePicker";

export const Calendar = DatePicker; // alias for simple usage
