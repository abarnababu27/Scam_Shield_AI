/**
 * ScamShield AI Logo — Custom SVG symbol
 * Shield with connected nodes representing pattern detection
 */

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ScamShield AI logo"
    >
      {/* Shield outline */}
      <path
        d="M20 3L6 10v10c0 9.55 5.97 18.48 14 20 8.03-1.52 14-10.45 14-20V10L20 3z"
        stroke="#3ecfcf"
        strokeWidth="1.8"
        fill="rgba(62, 207, 207, 0.06)"
        strokeLinejoin="round"
      />
      {/* Central node */}
      <circle cx="20" cy="18" r="3" fill="#3ecfcf" />
      {/* Top node */}
      <circle cx="20" cy="10" r="2" fill="#3ecfcf" opacity="0.7" />
      {/* Left node */}
      <circle cx="13" cy="21" r="2" fill="#3ecfcf" opacity="0.7" />
      {/* Right node */}
      <circle cx="27" cy="21" r="2" fill="#3ecfcf" opacity="0.7" />
      {/* Bottom node */}
      <circle cx="20" cy="28" r="2" fill="#3ecfcf" opacity="0.7" />
      {/* Connections */}
      <line x1="20" y1="12" x2="20" y2="15" stroke="#3ecfcf" strokeWidth="1.2" opacity="0.5" />
      <line x1="15" y1="20" x2="17.5" y2="18.5" stroke="#3ecfcf" strokeWidth="1.2" opacity="0.5" />
      <line x1="25" y1="20" x2="22.5" y2="18.5" stroke="#3ecfcf" strokeWidth="1.2" opacity="0.5" />
      <line x1="20" y1="21" x2="20" y2="26" stroke="#3ecfcf" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}
