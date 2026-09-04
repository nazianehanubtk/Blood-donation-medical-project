import React from "react";

/**
 * Custom hero illustration for LifeDrop.
 * A soft blush halo behind a crimson blood drop with an embedded
 * heartbeat pulse, connected to a donation bag by a curved tube —
 * built as plain inline SVG so it stays crisp at any size and needs
 * no external image asset.
 */
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 560 560"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a blood drop with a heartbeat line connected to a donation bag"
      style={{ width: "100%", height: "auto", maxWidth: 480 }}
    >
      <defs>
        <radialGradient id="haloGrad" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#FDEFF3" />
          <stop offset="55%" stopColor="#F7E3EC" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#F4EFFC" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0355C" />
          <stop offset="55%" stopColor="#D91E4A" />
          <stop offset="100%" stopColor="#9A1338" />
        </linearGradient>
        <linearGradient id="bagGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FBEEF1" />
        </linearGradient>
        <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#9A1338" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* ambient halo */}
      <circle cx="280" cy="255" r="230" fill="url(#haloGrad)" />

      {/* decorative accents */}
      <g opacity="0.55">
        <path d="M118 150c8-16 30-16 38 0 8 16-19 34-19 34s-27-18-19-34Z" fill="#F0A9BC" />
        <path d="M452 330c6-12 22-12 28 0 6 12-14 25-14 25s-20-13-14-25Z" fill="#C9A9F5" />
        <g stroke="#E9A6BC" strokeWidth="6" strokeLinecap="round">
          <path d="M96 330h26M109 317v26" />
          <path d="M430 150h22M441 139v22" />
        </g>
        <circle cx="150" cy="410" r="5" fill="#D9A9E8" />
        <circle cx="405" cy="120" r="5" fill="#F0A9BC" />
      </g>

      {/* donation bag, tucked behind/right of the drop */}
      <g filter="url(#softShadow)">
        <rect x="352" y="150" width="112" height="130" rx="18" fill="url(#bagGrad)" stroke="#F0C7D3" strokeWidth="2" />
        <rect x="384" y="132" width="48" height="24" rx="8" fill="#FBEEF1" stroke="#F0C7D3" strokeWidth="2" />
        <rect x="368" y="182" width="84" height="10" rx="5" fill="#D91E4A" opacity="0.85" />
        <rect x="368" y="200" width="60" height="8" rx="4" fill="#F0A9BC" opacity="0.7" />
        {/* tube connecting bag to drop */}
        <path
          d="M356 250C300 260 300 300 300 300"
          fill="none"
          stroke="#D91E4A"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>

      {/* main blood drop */}
      <g filter="url(#softShadow)">
        <path
          d="M270 90C270 90 168 232 168 312C168 372.75 213.25 418 270 418C326.75 418 372 372.75 372 312C372 232 270 90 270 90Z"
          fill="url(#dropGrad)"
        />
        {/* glossy highlight */}
        <ellipse cx="228" cy="250" rx="20" ry="34" fill="#FFFFFF" opacity="0.22" />

        {/* heartbeat pulse line */}
        <path
          d="M188 316h44l14-34 20 60 16-92 18 66h72"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* small heart accents near the drop */}
      <path
        d="M300 108c3-7 13-7 16 0 3 7-8 15-8 15s-11-8-8-15Z"
        fill="#F0355C"
        opacity="0.85"
      />
      <path
        d="M198 138c4-9 17-9 21 0 4 9-10.5 19-10.5 19S194 147 198 138Z"
        fill="#C9A9F5"
        opacity="0.8"
      />
    </svg>
  );
}

export default HeroIllustration;