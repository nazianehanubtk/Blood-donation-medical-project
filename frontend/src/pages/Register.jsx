import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { notify } from "../components/Toast";
import { SuccessState } from "../components/StateHelpers";
import AuthBrandPanel from "../components/AuthBrandPanel";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    user_type: "",
    blood_group: "",
    district: "",
    age: "",
    weight: "",
    gender: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setLoading(false);

        if (!ok || !data.success) {
          const errorMsg = data.message || "Registration failed! Please try again.";
          setError(errorMsg);
          notify.error(errorMsg);
          return;
        }

        setShowSuccess(true);
        notify.success("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch((err) => {
        console.error("Registration error:", err);
        setLoading(false);
        const errorMsg = "Could not reach the server. Please try again.";
        setError(errorMsg);
        notify.error(errorMsg);
      });
  };

  if (showSuccess) {
    return (
      <div className="auth-wrap">
        <SuccessState
          title="Account Created!"
          message="Redirecting to login page..."
        />
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-shell auth-shell-wide">
        <AuthBrandPanel
          heading="Join the Network"
          subheading="Register as a donor, patient, or hospital and help LifeDrop connect the right blood to the right person, faster."
        />

        <div className="auth-form-panel">
          <div className="form-card">
            <div className="page-header" style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: 26 }}>Create Your Account</h1>
              <p>Join as a donor, patient, or hospital</p>
            </div>

            <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              className="form-control"
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                className="form-control"
                type="text"
                name="phone"
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className="form-control"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>User Type</label>
              <select
                className="form-control"
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Select type
                </option>
                <option value="donor">Donor</option>
                <option value="patient">Patient</option>
                <option value="hospital">Hospital</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select
                className="form-control"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Select group
                </option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>District</label>
            <input
              className="form-control"
              type="text"
              name="district"
              placeholder="e.g. Khulna"
              value={formData.district}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                className="form-control"
                type="number"
                name="age"
                placeholder="Minimum 18"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                className="form-control"
                type="number"
                name="weight"
                placeholder="e.g. 60"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              className="form-control"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
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
            {loading ? "Creating account..." : "Register"}
          </button>
            </form>

            <p className="auth-foot">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;