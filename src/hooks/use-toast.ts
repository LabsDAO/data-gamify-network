
// This is the actual implementation of the toast
import * as React from "react";
import {
  Toast as ToastPrimitive,
  ToastActionElement,
} from "@/components/ui/toast";
import { 
  useToast as useToastHook,
  ToastProps as ToastHookProps 
} from "@/components/ui/use-toast-hook";

// Define the extended toast props with our variant option
type ToastProps = ToastHookProps & {
  variant?: "default" | "destructive" | "success";
};

// Re-export the hook
export const useToast = useToastHook;

// Define and export the toast function
type ToastFunction = (props: ToastProps) => void;

export const toast: ToastFunction = (props) => {
  // This is a client component, this code is safe to use window object
  const windowWithToast = window as Window & {
    toast?: ToastFunction;
  };

  // If toast exists in window, use it
  if (windowWithToast.toast) {
    windowWithToast.toast(props);
    return;
  }

  // Log a fallback message if toast isn't available at runtime
  console.warn("Toast notification:", props.title, props.description);
};

export type { ToastActionElement, ToastProps };
