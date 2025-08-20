"use client";

import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastStyles = {
  success: {
    bg: "bg-green-50 border-green-200",
    icon: CheckCircleIcon,
    iconColor: "text-green-400",
    titleColor: "text-green-800",
    messageColor: "text-green-700",
    progressColor: "bg-green-500",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    icon: XCircleIcon,
    iconColor: "text-red-400",
    titleColor: "text-red-800",
    messageColor: "text-red-700",
    progressColor: "bg-red-500",
  },
  warning: {
    bg: "bg-yellow-50 border-yellow-200",
    icon: ExclamationTriangleIcon,
    iconColor: "text-yellow-400",
    titleColor: "text-yellow-800",
    messageColor: "text-yellow-700",
    progressColor: "bg-yellow-500",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: InformationCircleIcon,
    iconColor: "text-blue-400",
    titleColor: "text-blue-800",
    messageColor: "text-blue-700",
    progressColor: "bg-blue-500",
  },
};

export default function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const styles = toastStyles[type];
  const Icon = styles.icon;

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // Auto-hide timer
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) return 0;
        return prev - 100 / (duration / 100);
      });
    }, 100);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(progressInterval);
    };
  }, [id, duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`relative w-80 max-w-sm rounded-lg border p-4 shadow-lg ${styles.bg}`}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 h-1 bg-gray-200 rounded-t-lg w-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear ${styles.progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <XMarkIcon className="h-4 w-4 text-gray-500" />
        </button>

        {/* Content */}
        <div className="flex items-start space-x-3">
          <Icon className={`h-6 w-6 flex-shrink-0 ${styles.iconColor}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${styles.titleColor}`}>
              {title}
            </p>
            {message && (
              <p className={`mt-1 text-sm ${styles.messageColor}`}>{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast Container Component
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      },
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Expose addToast globally
  if (typeof window !== "undefined") {
    (window as any).showToast = addToast;
  }

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
}

// Utility functions for showing toasts
export const showToast = {
  success: (title: string, message?: string, duration?: number) => {
    if (typeof window !== "undefined" && (window as any).showToast) {
      (window as any).showToast({ type: "success", title, message, duration });
    }
  },
  error: (title: string, message?: string, duration?: number) => {
    if (typeof window !== "undefined" && (window as any).showToast) {
      (window as any).showToast({ type: "error", title, message, duration });
    }
  },
  warning: (title: string, message?: string, duration?: number) => {
    if (typeof window !== "undefined" && (window as any).showToast) {
      (window as any).showToast({ type: "warning", title, message, duration });
    }
  },
  info: (title: string, message?: string, duration?: number) => {
    if (typeof window !== "undefined" && (window as any).showToast) {
      (window as any).showToast({ type: "info", title, message, duration });
    }
  },
};
