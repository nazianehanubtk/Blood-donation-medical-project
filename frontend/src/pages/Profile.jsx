import React, { useState } from "react";
import { Edit2, Mail, Droplet, MapPin, Save, X, Loader2, Calendar } from "lucide-react";
import { notify } from "../components/Toast";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("user")) || {
          name: "John Doe",
          email: "john@example.com",
          blood_group: "A+",
          district: "Khulna",
        }
      );
    } catch {
      return {
        name: "John Doe",
        email: "john@example.com",
        blood_group: "A+",
        district: "Khulna",
      };
    }
  });

  // Editable copy — only touched while isEditing is true
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    district: user.district || "",
    age: user.age || "",
    weight: user.weight || "",
    gender: user.gender || "",
    lastDonationDate: user.lastDonationDate || user.last_donation_date || "",
  });

  const isDonor = (user.user_type || "").toLowerCase() === "donor";
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => {
    // Reset form to current saved values whenever edit mode opens
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      district: user.district || "",
      age: user.age || "",
      weight: user.weight || "",
      gender: user.gender || "",
      lastDonationDate: user.lastDonationDate || user.last_donation_date || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify.error("You're not logged in.");
      return;
    }

    setSaving(true);

    const payload = {
      name: formData.name,
      phone: formData.phone,
      district: formData.district,
      age: formData.age ? Number(formData.age) : null,
      weight: formData.weight ? Number(formData.weight) : null,
      gender: formData.gender,
      // Only donors can edit this — for patient/hospital we simply don't send it
      ...(isDonor ? { lastDonationDate: formData.lastDonationDate || null } : {}),
    };

    fetch("http://localhost:5000/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setSaving(false);

        if (!ok || !data.success) {
          notify.error(data.message || "Could not update profile.");
          return;
        }

        // Merge the server's updated fields into the locally stored user
        // (server returns bloodGroup/lastDonationDate as camelCase; keep user_type as-is since it's not editable here)
        const updatedUser = {
          ...user,
          name: data.user.name,
          phone: data.user.phone,
          district: data.user.district,
          age: data.user.age,
          weight: data.user.weight,
          gender: data.user.gender,
          lastDonationDate: data.user.lastDonationDate,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        notify.success("Profile updated successfully");
      })
      .catch((err) => {
        console.error("Update profile error:", err);
        setSaving(false);
        notify.error("Could not reach the server. Please try again.");
      });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your Profile</h1>
        <p>View and manage your account information</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">{initial}</div>

        <h2>{user.name}</h2>
        <p className="profile-type">{user.user_type || "Member"}</p>

        {!isEditing ? (
          <>
            <div className="profile-info">
              <div className="profile-row">
                <div className="label">
                  <Mail size={16} style={{ marginRight: "8px", display: "inline" }} />
                  Email
                </div>
                <div className="value">{user.email}</div>
              </div>

              <div className="profile-row">
                <div className="label">
                  <Droplet size={16} style={{ marginRight: "8px", display: "inline", color: "var(--red)" }} />
                  Blood Group
                </div>
                <div className="value" style={{ color: "var(--red)", fontWeight: "bold" }}>
                  {user.blood_group || user.bloodGroup}
                </div>
              </div>

              <div className="profile-row">
                <div className="label">
                  <MapPin size={16} style={{ marginRight: "8px", display: "inline" }} />
                  Location
                </div>
                <div className="value">{user.district}</div>
              </div>

              {user.phone && (
                <div className="profile-row">
                  <div className="label">Phone</div>
                  <div className="value">{user.phone}</div>
                </div>
              )}

              {/* Only donors have a donation history to show */}
              {isDonor && (
                <div className="profile-row">
                  <div className="label">
                    <Calendar size={16} style={{ marginRight: "8px", display: "inline" }} />
                    Last Donation
                  </div>
                  <div className="value">
                    {user.lastDonationDate || user.last_donation_date
                      ? new Date(user.lastDonationDate || user.last_donation_date).toLocaleDateString()
                      : "Not recorded yet"}
                  </div>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary btn-block"
              onClick={handleEditClick}
              style={{ marginTop: "20px" }}
            >
              <Edit2 size={16} style={{ marginRight: "6px" }} />
              Edit Profile
            </button>
          </>
        ) : (
          <>
            <div className="profile-info">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className="form-control"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  className="form-control"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>District</label>
                <input
                  className="form-control"
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    className="form-control"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    className="form-control"
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
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
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Donor-only: they donate again and again, so this needs to stay editable */}
              {isDonor && (
                <div className="form-group">
                  <label>
                    <Calendar size={14} style={{ marginRight: "6px", display: "inline" }} />
                    Last Donation Date
                  </label>
                  <input
                    className="form-control"
                    type="date"
                    name="lastDonationDate"
                    value={
                      formData.lastDonationDate
                        ? String(formData.lastDonationDate).split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <small style={{ color: "var(--muted)" }}>
                    Update this every time you donate blood
                  </small>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                className="btn btn-outline btn-block"
                onClick={handleCancel}
                disabled={saving}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                className="btn btn-primary btn-block"
                onClick={handleSave}
                disabled={saving}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;