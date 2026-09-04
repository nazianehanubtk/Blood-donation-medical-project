import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      icon={false}
    />
  );
}

export const notify = {
  success: (message) =>
    toast.success(message, {
      icon: <CheckCircle size={20} className="toast-icon" />,
    }),
  error: (message) =>
    toast.error(message, {
      icon: <XCircle size={20} className="toast-icon" />,
    }),
  info: (message) =>
    toast.info(message, {
      icon: <Info size={20} className="toast-icon" />,
    }),
  warning: (message) =>
    toast.warning(message, {
      icon: <AlertCircle size={20} className="toast-icon" />,
    }),
};
