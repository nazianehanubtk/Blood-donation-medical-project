import React, { useState, useEffect } from 'react';
import { getDonorRecommendations } from '../services/aiService';

function Dashboard() {
  // ডাটাবেজ থেকে ডাটা আসার আগে এগুলো ডিফল্ট হিসেবে থাকবে
  const [totalDonors, setTotalDonors] = useState(0);
  const [bloodRequests, setBloodRequests] = useState(0);
  const [availableGroups, setAvailableGroups] = useState(["A+", "B+", "O+", "AB+"]);

  // --- AI Donor Recommendation state ---
  const [requestId, setRequestId] = useState('');
  const [matches, setMatches] = useState([]);
  const [aiNote, setAiNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.dashboard) {
          setTotalDonors(Number(data.dashboard.totalDonors) || 0);
          setBloodRequests(Number(data.dashboard.totalBloodRequests) || 0);
        }
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
      });
  }, []);

  // Called when the "Get AI Recommendations" button is clicked
  const handleGetRecommendations = async () => {
    setError('');
    setMatches([]);
    setAiNote('');

    if (!requestId) {
      setError('Please enter a request ID.');
      return;
    }

    setLoading(true);
    const result = await getDonorRecommendations(Number(requestId));
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Something went wrong.');
      return;
    }

    setMatches(result.matches || []);
    setAiNote(result.note || '');
  };

  return (
    <div style={{
      padding: '40px 20px',
      backgroundColor: '#f8f9fa',
      minHeight: '80vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#2c3e50', margin: '0 0 10px 0', fontSize: '32px', fontWeight: 'bold' }}>
          Dashboard
        </h1>
        <p style={{ color: '#7f8c8d', margin: 0, fontSize: '16px' }}>
          Welcome to AI Blood Donation Management System
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '25px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '25px',
          width: '280px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          borderLeft: '5px solid #e74c3c',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#7f8c8d', margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
            Total Donors
          </h3>
          <p style={{ color: '#2c3e50', margin: 0, fontSize: '36px', fontWeight: 'bold' }}>
            {totalDonors}
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '25px',
          width: '280px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          borderLeft: '5px solid #34495e',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#7f8c8d', margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
            Blood Requests
          </h3>
          <p style={{ color: '#e74c3c', margin: 0, fontSize: '36px', fontWeight: 'bold' }}>
            {bloodRequests}
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '25px',
          width: '280px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          borderLeft: '5px solid #2ecc71',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#7f8c8d', margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
            Available Blood Groups
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '10px'
          }}>
            {availableGroups.map((group, index) => (
              <span key={index} style={{
                backgroundColor: '#fde9e7',
                color: '#e74c3c',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '1px solid #fbc4be'
              }}>
                {group}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* --- AI Donor Recommendation Section --- */}
      <div style={{
        maxWidth: '700px',
        margin: '40px auto 0',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        borderLeft: '5px solid #aa3bff',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#2c3e50', margin: '0 0 15px 0', fontSize: '20px', fontWeight: '600' }}>
          AI Donor Recommendation
        </h3>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
          <input
            type="number"
            placeholder="Enter Request ID (e.g. 2)"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '15px',
              width: '220px'
            }}
          />
          <button
            onClick={handleGetRecommendations}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: loading ? '#c9a3f0' : '#aa3bff',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Get AI Recommendations'}
          </button>
        </div>

        {error && (
          <p style={{ color: '#e74c3c', fontSize: '14px', margin: '10px 0' }}>{error}</p>
        )}

        {aiNote && (
          <p style={{ color: '#7f8c8d', fontSize: '14px', margin: '10px 0' }}>{aiNote}</p>
        )}

        {matches.length > 0 && (
          <div style={{ marginTop: '15px', textAlign: 'left' }}>
            {matches.map((m, index) => (
              <div key={index} style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '10px',
                border: '1px solid #eee'
              }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#2c3e50' }}>
                  {m.name} — {m.bloodGroup} ({m.district})
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#7f8c8d' }}>
                  {m.reason}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;