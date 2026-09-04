import React from "react";
import { Droplet, ShieldCheck } from "lucide-react";
import AuthIllustration from "./AuthIllustration";

/**
 * Left-hand brand panel used on the Login and Register screens.
 * Keeps the auth flow visually anchored to the LifeDrop identity
 * instead of feeling like a bare form.
 */
function AuthBrandPanel({ heading, subheading }) {
  return (
    <div className="auth-brand-panel">
      <div className="auth-brand-logo">
        <Droplet size={22} />
        <span>
          Life<strong>Drop</strong>
        </span>
      </div>

      <div className="auth-brand-illustration">
        <AuthIllustration />
      </div>

      <h2>{heading}</h2>
      <p>{subheading}</p>

      <div className="auth-brand-trust">
        <ShieldCheck size={16} />
        <span>Every Drop Can Save a Life.</span>
      </div>
    </div>
  );
}

export default AuthBrandPanel;