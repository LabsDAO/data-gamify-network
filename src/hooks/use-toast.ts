
// This is the actual implementation of the toast
import { useToast as useToastUI } from "@/components/ui/use-toast";
import type { Toast, ToastActionElement } from "@/components/ui/toast";

type ToastProps = Toast & {
  variant?: "default" | "destructive" | "success";
};

export const useToast = useToastUI;

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
