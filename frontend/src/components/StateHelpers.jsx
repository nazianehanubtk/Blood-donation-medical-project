import React from "react";
import { AlertCircle, Loader2, InboxIcon } from "lucide-react";

export function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="state-container state-loading">
      <div className="spinner-icon">
        <Loader2 size={40} />
      </div>
      <p>{text}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry, retryText = "Try Again" }) {
  return (
    <div className="state-container state-error">
      <AlertCircle size={40} />
      <p className="error-message">{error || "Something went wrong"}</p>
      {onRetry && (
        <button className="btn btn-outline btn-sm" onClick={onRetry}>
          {retryText}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = "No data found", description = "" }) {
  return (
    <div className="state-container state-empty">
      <InboxIcon size={40} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}

export function SuccessState({ title = "Success!", message = "" }) {
  return (
    <div className="state-container state-success">
      <div className="success-icon">✓</div>
      <h2>{title}</h2>
      {message && <p>{message}</p>}
    </div>
  );
}
