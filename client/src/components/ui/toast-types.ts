import * as React from "react";

export interface ToastProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: "default" | "destructive";
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export type ToastActionElement = React.ReactElement;