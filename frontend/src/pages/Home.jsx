import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  Users,
  Droplet,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Phone,
} from "lucide-react";
import { LoadingSpinner, ErrorState } from "../components/StateHelpers";
import HeroIllustration from "../components/HeroIllustration";

function Home() {
  const navigate = useNavigate();

  const [totalDonors, setTotalDonors] = useState(0);
  const [bloodRequests, setBloodRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availableGroups] = useState(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);

  const [previewDonors, setPreviewDonors] = useState([]);
  const [donorsLoading, setDonorsLoading] = useState(true);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // Role check — controls whether donor-search UI or patient/hospital UI shows
  const userType = (user?.user_type || "").toLowerCase();
  const isDonor = userType === "donor";

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("http://localhost:5000/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success && data.dashboard) {
          setTotalDonors(Number(data.dashboard.totalDonors) || 0);
          setBloodRequests(Number(data.dashboard.totalBloodRequests) || 0);
        }
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
        setError("Failed to load dashboard data");
      });
  }, []);

  // Pull a handful of real donors from the database to preview on the homepage.
  // Donors don't need to browse other donors, so skip this fetch for them.
  useEffect(() => {
    if (isDonor) {
      setDonorsLoading(false);
      return;
    }
    setDonorsLoading(true);
    fetch("http://localhost:5000/api/donors")
      .then((res) => res.json())
      .then((data) => {
        const donorList = Array.isArray(data) ? data : Array.isArray(data?.donors) ? data.donors : [];
        setPreviewDonors(donorList.slice(0, 3));
        setDonorsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching donor preview:", err);
        setDonorsLoading(false);
      });
  }, [isDonor]);

  const handleRetry = () => {
    setError("");
    window.location.reload();
  };

  return (
    <div className="lp-home">
      {/* ---------- Hero ---------- */}
      <section className="hero hero-split">
        <div className="hero-copy">
          <span className="hero-badge">
            <ShieldCheck size={15} style={{ marginRight: "6px" }} />
            Trusted by thousands. Saving lives every day.
          </span>

          <h1>
            {user ? `Welcome back, ${user.name || "friend"}.` : "Find Blood."}
            <br />
            <span>
              {user
                ? isDonor
                  ? "Ready to save a life today?"
                  : "Need a donor today?"
                : "Save Lives."}
            </span>
          </h1>

          <p>
            {isDonor
              ? "LifeDrop connects you with patients who need your blood group — check current requests and respond to save a life in your district."
              : "LifeDrop connects you with the right blood donor quickly and lets you request blood in emergencies — powered by AI matching and real-time availability across your district."}
          </p>

          <div className="hero-actions">
            {/* Donor accounts don't need to search for other donors */}
            {!isDonor && (
              <button className="btn btn-primary" onClick={() => navigate("/donor")}>
                <Search size={18} /> Find Donor
              </button>
            )}
            <button className="btn btn-outline" onClick={() => navigate("/request")}>
              <Heart size={18} /> {isDonor ? "View Blood Requests" : "Request Blood"}
            </button>
            {!user && (
              <button className="btn btn-ghost" onClick={() => navigate("/register")}>
                <Users size={18} /> Become a Donor
              </button>
            )}
          </div>
        </div>

        <div className="hero-visual">
          <HeroIllustration />
        </div>
      </section>

      <div className="page lp-page">
        {error && (
          <ErrorState error={error} onRetry={handleRetry} retryText="Reload Dashboard" />
        )}

        {loading ? (
          <LoadingSpinner text="Loading dashboard..." />
        ) : (
          <>
            {/* ---------- Real-time statistics (clickable to jump to the relevant page) ---------- */}
            <section className="stat-band">
              <div
                className="stat-band-card clickable"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/donor")}
                onKeyDown={(e) => e.key === "Enter" && navigate("/donor")}
              >
                <div className="stat-band-icon red">
                  <Users size={22} />
                </div>
                <div>
                  <div className="stat-band-value">{totalDonors}</div>
                  <div className="stat-band-label">Available Donors</div>
                </div>
              </div>

              <div
                className="stat-band-card clickable"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/request")}
                onKeyDown={(e) => e.key === "Enter" && navigate("/request")}
              >
                <div className="stat-band-icon purple">
                  <Heart size={22} />
                </div>
                <div>
                  <div className="stat-band-value">{bloodRequests}</div>
                  <div className="stat-band-label">Blood Requests</div>
                </div>
              </div>

              <div
                className="stat-band-card clickable"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/donor")}
                onKeyDown={(e) => e.key === "Enter" && navigate("/donor")}
              >
                <div className="stat-band-icon red">
                  <Droplet size={22} />
                </div>
                <div>
                  <div className="stat-band-value">{availableGroups.length}</div>
                  <div className="stat-band-label">Blood Groups Supported</div>
                </div>
              </div>
            </section>

            {/* ---------- Donor discovery (hidden for donor accounts) ---------- */}
            {!isDonor && (
              <section className="donor-discovery">
                <div className="section-header">
                  <h2>Meet Our Donors</h2>
                  <p>A few of the verified donors ready to help right now</p>
                </div>

                {donorsLoading ? (
                  <LoadingSpinner text="Loading donors..." />
                ) : previewDonors.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--muted)" }}>
                    No donors available right now — check back soon.
                  </p>
                ) : (
                  <div className="donor-preview-grid">
                    {previewDonors.map((donor, index) => (
                      <div className="donor-preview-card" key={index}>
                        <div className="donor-preview-top">
                          <div className="donor-preview-avatar">
                            {donor.name ? donor.name.charAt(0).toUpperCase() : "D"}
                          </div>
                          <span className="badge blood-group">
                            {donor.bloodGroup || donor.blood_group}
                          </span>
                        </div>
                        <h3>{donor.name}</h3>
                        <p className="donor-preview-location">
                          <MapPin size={14} style={{ marginRight: "6px" }} />
                          {donor.location || donor.district}
                        </p>
                        {donor.phone && (
                          <p className="donor-preview-phone">
                            <Phone size={14} style={{ marginRight: "6px" }} />
                            {donor.phone}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ textAlign: "center", marginTop: "28px" }}>
                  <button className="btn btn-outline" onClick={() => navigate("/donor")}>
                    View All Donors <ArrowRight size={16} />
                  </button>
                </div>
              </section>
            )}

            {/* ---------- Compact AI feature ---------- */}
            <section className="ai-banner" onClick={() => navigate("/ai")}>
              <div className="ai-banner-icon">
                <Sparkles size={26} />
              </div>
              <div className="ai-banner-copy">
                <h3>Let AI find your match</h3>
                <p>Describe what you need in plain language and our assistant matches you with the right donors instantly.</p>
              </div>
              <button className="btn btn-purple">
                Ask AI Assistant <ArrowRight size={16} />
              </button>
            </section>

            {/* ---------- Emergency CTA (text changes for donor) ---------- */}
            <section className="emergency-section">
              <div className="emergency-card">
                <div className="emergency-content">
                  <h2>{isDonor ? "Someone Needs Your Blood" : "Need Blood Urgently?"}</h2>
                  <p>
                    {isDonor
                      ? "Check the current urgent blood requests and see if you're a match — your donation could save a life today."
                      : "In an emergency, submit an urgent blood request and our AI will prioritize matching you with available donors instantly."}
                  </p>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => navigate("/request")}>
                  <Heart size={18} /> {isDonor ? "View Urgent Requests" : "Make Urgent Request"}
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;