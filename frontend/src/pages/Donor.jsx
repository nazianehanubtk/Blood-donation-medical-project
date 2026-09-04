import React, { useState, useEffect } from "react";
import { MapPin, Droplet, MessageSquare, Filter, X, Search } from "lucide-react";
import { LoadingSpinner, ErrorState, EmptyState } from "../components/StateHelpers";
import { notify } from "../components/Toast";

function Donor() {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");
  // Show all donors as soon as they load — no need to force a manual search first
  const [hasSearched, setHasSearched] = useState(true);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const availabilityOptions = ["Available"];

  // Fetch all donors on mount
  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("http://localhost:5000/api/donors")
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);

        const donorList = Array.isArray(data)
          ? data
          : Array.isArray(data?.donors)
          ? data.donors
          : [];

        setDonors(donorList);
        setFilteredDonors(donorList);
      })
      .catch((err) => {
        console.error("Error fetching donors data:", err);
        setLoading(false);
        setError("Failed to load donors. Please try again.");
      });
  }, []);

  const handleSearch = () => {
    setSearching(true);

    setTimeout(() => {
      let filtered = [...donors];

      // Blood group filter
      if (filterBloodGroup) {
        filtered = filtered.filter(
          (donor) =>
            (donor.bloodGroup || donor.blood_group || "").toUpperCase() ===
            filterBloodGroup.toUpperCase()
        );
      }

      // District filter
      if (filterDistrict.trim()) {
        const district = filterDistrict.trim().toLowerCase();

        filtered = filtered.filter((donor) =>
          (donor.district || donor.location || "")
            .toLowerCase()
            .includes(district)
        );
      }

      // Availability filter
      if (filterAvailability) {
        filtered = filtered.filter((donor) => {
          const isAvailable =
            donor.isAvailable ??
            donor.is_available ??
            donor.available ??
            false;

          return filterAvailability === "Available"
            ? isAvailable === true
            : isAvailable === false;
        });
      }

      setFilteredDonors(filtered);
      setHasSearched(true);
      setSearching(false);
    }, 300);
  };

  const handleClearFilters = () => {
    setFilterBloodGroup("");
    setFilterDistrict("");
    setFilterAvailability("");

    // Clear করলে আবার সব donor দেখাবে
    setFilteredDonors(donors);
    setHasSearched(true);
  };

  const handleContact = (donorName) => {
    notify.success(`Contact request sent to ${donorName}`);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Find a Donor</h1>
          <p>Browse and connect with available blood donors in your area</p>
        </div>
        <LoadingSpinner text="Loading available donors..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Find a Donor</h1>
          <p>Browse and connect with available blood donors in your area</p>
        </div>
        <ErrorState error={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Find a Donor</h1>
        <p>Browse and connect with available blood donors in your area</p>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-card">
          <div className="search-header">
            <h2>Search Donors</h2>
            <p>Filter by blood group, location, and availability</p>
          </div>

          <div className="search-filters">
            <div className="filter-group">
              <label htmlFor="blood-group">Blood Group</label>
              <select
                id="blood-group"
                className="form-control"
                value={filterBloodGroup}
                onChange={(e) => setFilterBloodGroup(e.target.value)}
              >
                <option value="">All Blood Groups</option>
                {bloodGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="district">District / Location</label>
              <input
                id="district"
                type="text"
                className="form-control"
                placeholder="Enter district or location..."
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="availability">Availability</label>
              <select
                id="availability"
                className="form-control"
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
              >
                <option value="">Any Status</option>
                {availabilityOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-actions">
            <button
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={searching}
              style={{ flex: 1 }}
            >
              {searching ? (
                <>Loading...</>
              ) : (
                <>
                  <Search size={18} /> Search Donors
                </>
              )}
            </button>
            <button className="btn btn-outline" onClick={handleClearFilters}>
              <X size={18} /> Clear
            </button>
          </div>

          {hasSearched && (
            <div className="search-results-info">
              Found <strong>{filteredDonors.length}</strong> donor{filteredDonors.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {searching ? (
        <LoadingSpinner text="Searching for donors..." />
      ) : filteredDonors.length === 0 ? (
        <EmptyState
          title="No donors found"
          description="Try adjusting your filters or check back later for more donors"
        />
      ) : (
        <div className="results-section">
          <div className="results-header">
            <h2>Available Donors</h2>
            <span className="results-count">{filteredDonors.length} result{filteredDonors.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="grid">
            {filteredDonors.map((donor, index) => (
              <div className="donor-card" key={index}>
                <div className="donor-card-head">
                  <div>
                    <h3>{donor.name}</h3>
                    <p style={{ fontSize: "13px", color: "var(--muted)", margin: "4px 0 0 0" }}>
                      {donor.user_type || "Donor"}
                    </p>
                  </div>
                </div>

                <div className="donor-badges">
                  <span className="badge blood-group">
                    <Droplet size={14} style={{ marginRight: "4px" }} />
                    {donor.bloodGroup || donor.blood_group}
                  </span>
                  <span className={`badge ${donor.available !== false && donor.is_available !== false ? 'status-available' : 'status-unavailable'}`}>
                    ● {donor.available !== false && donor.is_available !== false ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="donor-meta">
                  <p>
                    <MapPin size={16} style={{ marginRight: "6px", display: "inline" }} />
                    <strong>{donor.location || donor.district}</strong>
                  </p>
                  {donor.phone && (
                    <p style={{ marginTop: "6px", fontSize: "13px", color: "var(--muted)" }}>
                      {donor.phone}
                    </p>
                  )}
                </div>

                <button
                  className="btn btn-outline btn-block"
                  onClick={() => handleContact(donor.name)}
                >
                  <MessageSquare size={16} /> Contact Donor
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Donor;