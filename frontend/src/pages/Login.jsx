import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import { notify } from "../components/Toast";
import AuthBrandPanel from "../components/AuthBrandPanel";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          notify.success("Login successful!");
          navigate("/");
        } else {
          setError(data.message || "Login failed! Please check your credentials.");
          notify.error(data.message || "Login failed");
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        setLoading(false);
        setError("Could not reach the server. Please try again.");
        notify.error("Connection error. Please try again.");
      });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-shell">
        <AuthBrandPanel
          heading="Access Your Account"
          subheading="Log in to find donors, submit requests, and manage your profile — all in one place."
        />

        <div className="auth-form-panel">
          <div className="auth-card">
            <h1>Welcome Back</h1>
            <p className="auth-sub">Log in to your LifeDrop account</p>

            <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted-light)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "40px" }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted-light)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "40px" }}
                required
              />
            </div>
          </div>

          {error && <p className="field-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

            <p className="auth-foot">
              Don't have an account? <Link to="/register">Register Now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;