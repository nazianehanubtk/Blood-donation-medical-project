import React from "react";

/**
 * Compact trust illustration for the auth screens (login / register).
 * A rounded shield holding a heart and a small blood-drop accent —
 * a distinct signature from the homepage hero, but drawn in the
 * same crimson/blush/lavender language.
 */
function AuthIllustration() {
  return (
    <svg
      viewBox="0 0 360 360"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a shield holding a heart, representing account security"
      style={{ width: "100%", height: "auto", maxWidth: 260 }}
    >
      <defs>
        <radialGradient id="authHalo" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FDEEF3" />
        </linearGradient>
        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0355C" />
          <stop offset="100%" stopColor="#B31640" />
        </linearGradient>
        <filter id="authShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#5B1130" floodOpacity="0.22" />
        </filter>
      </defs>

      <circle cx="180" cy="175" r="150" fill="url(#authHalo)" />

      {/* decorative accents */}
      <g opacity="0.8">
        <path d="M64 100c5-10 19-10 24 0 5 10-12 21-12 21s-17-11-12-21Z" fill="#F3B9C9" />
        <path d="M292 220c4-8 15-8 19 0 4 8-9.5 17-9.5 17S288 228 292 220Z" fill="#D8BEF2" />
        <circle cx="70" cy="250" r="4.5" fill="#E6AFC4" />
        <circle cx="298" cy="110" r="4.5" fill="#CBB0EE" />
      </g>

      {/* shield */}
      <g filter="url(#authShadow)">
        <path
          d="M180 56 264 88v70c0 62-38 104-84 128-46-24-84-66-84-128V88l84-32Z"
          fill="url(#shieldGrad)"
          stroke="#F3D3DC"
          strokeWidth="2"
        />
      </g>

      {/* heart inside shield */}
      <path
        d="M180 236c-30-20-52-38-52-64 0-16 12-28 28-28 12 0 20 7 24 15 4-8 12-15 24-15 16 0 28 12 28 28 0 26-22 44-52 64Z"
        fill="url(#heartGrad)"
      />

      {/* small blood-drop accent, bottom right of shield */}
      <path
        d="M244 262c0 0-16 18-16 30 0 9 7 16 16 16s16-7 16-16c0-12-16-30-16-30Z"
        fill="#D91E4A"
      />
      <ellipse cx="238" cy="286" rx="3.5" ry="6" fill="#FFFFFF" opacity="0.35" />
    </svg>
  );
}

export default AuthIllustration;