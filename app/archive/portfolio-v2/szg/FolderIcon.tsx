"use client";

/**
 * macOS-style folder icon SVG, tinted by `accentColor`.
 * Used as the thumbnail for folder-type entries in the SZG carousel.
 */
export default function FolderIcon({
  accentColor = "#4ade80",
  className,
}: {
  accentColor?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Back panel gradient — darker shade */}
        <linearGradient id="fBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.7" />
        </linearGradient>

        {/* Front panel gradient — lighter with shine */}
        <linearGradient id="fFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="40%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="black" stopOpacity="0.1" />
        </linearGradient>

        {/* Tab gradient */}
        <linearGradient id="fTab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentColor} stopOpacity="1" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="128" cy="240" rx="90" ry="10" fill="rgba(0,0,0,0.18)" />

      {/* Back panel */}
      <rect
        x="18" y="52" width="220" height="168" rx="14"
        fill="url(#fBack)"
      />
      {/* Back panel darkener */}
      <rect
        x="18" y="52" width="220" height="168" rx="14"
        fill="black" opacity="0.2"
      />

      {/* Tab on back */}
      <path
        d="M18,52 C18,44 26,36 34,36 L96,36 C104,36 108,40 116,48 L124,56 L18,56 Z"
        fill="url(#fTab)"
      />
      {/* Tab darkener */}
      <path
        d="M18,52 C18,44 26,36 34,36 L96,36 C104,36 108,40 116,48 L124,56 L18,56 Z"
        fill="black" opacity="0.15"
      />

      {/* Front panel */}
      <path
        d={`
          M18,90 C18,82 26,74 34,74 L222,74 C230,74 238,82 238,90
          L238,206 C238,214 230,222 222,222 L34,222 C26,222 18,214 18,206 Z
        `}
        fill={accentColor}
      />

      {/* Front panel shine overlay */}
      <path
        d={`
          M18,90 C18,82 26,74 34,74 L222,74 C230,74 238,82 238,90
          L238,206 C238,214 230,222 222,222 L34,222 C26,222 18,214 18,206 Z
        `}
        fill="url(#fFront)"
      />

      {/* Top highlight line */}
      <path
        d="M34,76 L222,76 C229,76 236,83 236,90"
        fill="none"
        stroke="white"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
    </svg>
  );
}
