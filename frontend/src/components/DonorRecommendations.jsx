// src/components/DonorRecommendations.jsx
// Displays AI-recommended donor matches for a given blood request.
// Drop this into a Blood Request Detail page, passing the request's id as `requestId`.

import { useState } from "react";
import { getDonorRecommendations } from "../services/aiService";

export default function DonorRecommendations({ requestId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState(null);
  const [note, setNote] = useState("");
  const [aiUsed, setAiUsed] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleFindDonors() {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    const result = await getDonorRecommendations(requestId);

    setLoading(false);

    if (!result.success) {
      setError(result.message || "Something went wrong. Please try again.");
      setMatches(null);
      return;
    }

    setMatches(result.matches || []);
    setNote(result.note || "");
    setAiUsed(result.aiUsed !== false);
  }

  return (
    <div className="donor-recommendations">
      <button
        onClick={handleFindDonors}
        disabled={loading}
        className="find-donors-btn"
      >
        {loading ? "Finding donors..." : "Find Matching Donors"}
      </button>

      {/* Loading state */}
      {loading && (
        <div className="dr-loading" role="status">
          <span className="spinner" aria-hidden="true" />
          <p>Analyzing available donors with AI...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="dr-error" role="alert">
          <p>{error}</p>
          <button onClick={handleFindDonors} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {/* Empty state — searched but no matches */}
      {!loading && !error && hasSearched && matches && matches.length === 0 && (
        <div className="dr-empty">
          <p>{note || "No matching donors were found for this request."}</p>
        </div>
      )}

      {/* Success state — matches found */}
      {!loading && !error && matches && matches.length > 0 && (
        <div className="dr-results">
          {!aiUsed && (
            <p className="dr-fallback-note">
              ⚠ {note}
            </p>
          )}

          <ul className="dr-match-list">
            {matches.map((m) => (
              <li key={m.donorId} className="dr-match-card">
                <div className="dr-match-header">
                  <span className="dr-match-name">{m.name}</span>
                  <span className="dr-match-bloodgroup">{m.bloodGroup}</span>
                </div>
                <p className="dr-match-district">{m.district}</p>
                {m.reason && <p className="dr-match-reason">{m.reason}</p>}
              </li>
            ))}
          </ul>

          {aiUsed && note && <p className="dr-ai-note">{note}</p>}
        </div>
      )}
    </div>
  );
}