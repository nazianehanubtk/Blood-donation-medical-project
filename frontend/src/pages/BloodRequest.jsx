import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, Droplet, MapPin, Phone, User, Send, CheckCircle } from "lucide-react";
import { notify } from "../components/Toast";
import { SuccessState, LoadingSpinner } from "../components/StateHelpers";

function BloodRequest() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }
  const isDonor = (user?.user_type || "").toLowerCase() === "donor";

  return isDonor ? <DonorRequestList /> : <PatientRequestForm />;
}

/* =========================================================
   DONOR VIEW — list of matching requests, with Respond action
   ========================================================= */
function DonorRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);
  const [respondedIds, setRespondedIds] = useState([]);

  const fetchRequests = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    fetch("http://localhost:5000/api/blood-requests/for-donor", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setLoading(false);
        if (!ok || !data.success) {
          setError(data.message || "Could not load requests.");
          return;
        }
        setRequests(data.requests || []);
      })
      .catch((err) => {
        console.error("Fetch donor requests error:", err);
        setLoading(false);
        setError("Could not reach the server. Please try again.");
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRespond = (requestId) => {
    const token = localStorage.getItem("token");
    setRespondingId(requestId);

    fetch(`http://localhost:5000/api/blood-requests/${requestId}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: "I'm available to donate." }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setRespondingId(null);
        if (!ok || !data.success) {
          notify.error(data.message || "Could not submit response.");
          return;
        }
        notify.success("Response sent! The requester will be notified.");
        setRespondedIds((prev) => [...prev, requestId]);
      })
      .catch((err) => {
        console.error("Respond error:", err);
        setRespondingId(null);
        notify.error("Could not reach the server. Please try again.");
      });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Blood Requests For You</h1>
        <p>Patients and hospitals near you that match your blood group</p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "var(--red-light)",
            border: "1px solid #ffd0da",
            borderRadius: "var(--radius-sm)",
            color: "var(--red-dark)",
            fontSize: "14px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading requests..." />
      ) : requests.length === 0 ? (
        <div className="form-card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <Droplet size={32} style={{ color: "var(--muted)", marginBottom: "12px" }} />
          <p style={{ color: "var(--muted)" }}>
            No matching requests right now — we'll show them here as soon as someone
            in your district needs your blood group.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {requests.map((r) => {
            const alreadyResponded = respondedIds.includes(r.id);
            return (
              <div key={r.id} className="form-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <span className="badge blood-group" style={{ marginRight: "8px" }}>
                      {r.blood_group}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color:
                          r.urgency === "emergency" || r.urgency === "critical"
                            ? "var(--red-dark)"
                            : "var(--muted)",
                      }}
                    >
                      {r.urgency}
                    </span>
                  </div>
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                    {r.units_needed} unit{r.units_needed > 1 ? "s" : ""} needed
                  </span>
                </div>

                <h3 style={{ margin: "12px 0 6px" }}>
                  {r.patient_name ? `Patient: ${r.patient_name}` : "Blood needed"}
                  {r.patient_age ? ` (${r.patient_age} yrs)` : ""}
                </h3>

                {r.hospital_name && (
                  <p style={{ fontSize: "14px", color: "var(--muted)", margin: "0 0 4px" }}>
                    {r.hospital_name}
                  </p>
                )}

                <p style={{ fontSize: "14px", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={14} /> {r.district}
                </p>
                <p style={{ fontSize: "14px", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <User size={14} /> {r.requester_name}
                </p>
                <p style={{ fontSize: "14px", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={14} /> {r.requester_phone}
                </p>

                {alreadyResponded ? (
                  <button className="btn btn-outline btn-block" disabled style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <CheckCircle size={16} /> Response Sent
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => handleRespond(r.id)}
                    disabled={respondingId === r.id}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  >
                    {respondingId === r.id ? (
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    ) : (
                      <Send size={16} />
                    )}
                    {respondingId === r.id ? "Sending..." : "I Can Help"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PATIENT / HOSPITAL VIEW — the original request form
   ========================================================= */
function PatientRequestForm() {
  const [formData, setFormData] = useState({
    requester_name: "",
    requester_phone: "",
    requester_email: "",
    blood_group: "",
    district: "",
    urgency: "normal",
    hospital_name: "",
    patient_name: "",
    patient_age: "",
    units_needed: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    fetch("http://localhost:5000/api/blood-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setLoading(false);

        if (!ok || !data.success) {
          const errorMsg = data.message || "Could not submit request. Please try again.";
          setError(errorMsg);
          notify.error(errorMsg);
          return;
        }

        setShowSuccess(true);
        notify.success("Blood request submitted successfully!");
        setTimeout(() => {
          setShowSuccess(false);
          resetForm();
        }, 3000);
      })
      .catch((err) => {
        console.error("Blood request error:", err);
        setLoading(false);
        const errorMsg = "Could not reach the server. Please try again.";
        setError(errorMsg);
        notify.error(errorMsg);
      });
  };

  const resetForm = () => {
    setFormData({
      requester_name: "",
      requester_phone: "",
      requester_email: "",
      blood_group: "",
      district: "",
      urgency: "normal",
      hospital_name: "",
      patient_name: "",
      patient_age: "",
      units_needed: "",
    });
    setError("");
  };

  if (showSuccess) {
    return (
      <div className="page">
        <SuccessState
          title="Request Submitted!"
          message="We'll notify matching donors and get back to you soon."
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Request Blood</h1>
        <p>Submit your blood request and we'll find matching donors</p>
      </div>

      <div className="form-card">
        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "var(--red-light)",
              border: "1px solid #ffd0da",
              borderRadius: "var(--radius-sm)",
              color: "var(--red-dark)",
              fontSize: "14px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Requester Info */}
          <fieldset style={{ border: "none", padding: "0 0 24px 0", margin: 0 }}>
            <legend style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "var(--ink)" }}>
              Your Information
            </legend>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className="form-control"
                  type="text"
                  name="requester_name"
                  value={formData.requester_name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  className="form-control"
                  type="text"
                  name="requester_phone"
                  value={formData.requester_phone}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email (optional)</label>
              <input
                className="form-control"
                type="email"
                name="requester_email"
                value={formData.requester_email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>
          </fieldset>

          {/* Blood Request Details */}
          <fieldset style={{ border: "none", padding: "0 0 24px 0", margin: 0, borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
            <legend style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "var(--ink)" }}>
              Blood Requirements
            </legend>

            <div className="form-row">
              <div className="form-group">
                <label>Blood Group</label>
                <select
                  className="form-control"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select group</option>
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
              <div className="form-group">
                <label>Units Needed</label>
                <input
                  className="form-control"
                  type="number"
                  name="units_needed"
                  value={formData.units_needed}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>District</label>
                <input
                  className="form-control"
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Khulna"
                  required
                />
              </div>
              <div className="form-group">
                <label>Urgency Level</label>
                <select
                  className="form-control"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Hospital & Patient Info */}
          <fieldset style={{ border: "none", padding: "0", margin: 0, borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
            <legend style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "var(--ink)" }}>
              Hospital & Patient Details
            </legend>

            <div className="form-group">
              <label>Hospital Name</label>
              <input
                className="form-control"
                type="text"
                name="hospital_name"
                value={formData.hospital_name}
                onChange={handleChange}
                placeholder="Hospital name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  className="form-control"
                  type="text"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleChange}
                  placeholder="Patient's name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Patient Age</label>
                <input
                  className="form-control"
                  type="number"
                  name="patient_age"
                  value={formData.patient_age}
                  onChange={handleChange}
                  placeholder="Age"
                  min="0"
                  required
                />
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{
              marginTop: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Submitting request..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BloodRequest;