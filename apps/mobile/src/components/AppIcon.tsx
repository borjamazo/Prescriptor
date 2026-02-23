interface AppIconProps {
  className?: string;
  size?: number;
}

export function AppIcon({ className = "", size = 120 }: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Main Gradient */}
        <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        
        {/* Light Gradient */}
        <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        
        {/* Accent Gradient */}
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Border Gradient */}
        <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
          <stop offset="100%" stopColor="rgba(37, 99, 235, 0.8)" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Shadow */}
        <filter id="shadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
          <feOffset dx="0" dy="4" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background Circle */}
      <circle cx="60" cy="60" r="58" fill="url(#mainGradient)" />

      {/* PRESCRIPTION SHIELD - Main Element */}
      <g filter="url(#shadow)">
        {/* Shield Shape - Wider, more rectangular like a prescription */}
        <path
          d="M 60 22
             L 88 28
             L 88 70
             Q 88 78 84 85
             Q 76 94 60 98
             Q 44 94 36 85
             Q 32 78 32 70
             L 32 28
             Z"
          fill="white"
          opacity="0.98"
        />
      </g>

      {/* Double Border - Outer */}
      <path
        d="M 60 22
           L 88 28
           L 88 70
           Q 88 78 84 85
           Q 76 94 60 98
           Q 44 94 36 85
           Q 32 78 32 70
           L 32 28
           Z"
        fill="none"
        stroke="url(#borderGradient)"
        strokeWidth="2.5"
        opacity="0.7"
      />

      {/* Double Border - Inner */}
      <path
        d="M 60 25
           L 85 30
           L 85 70
           Q 85 77 82 83
           Q 75 91 60 95
           Q 45 91 38 83
           Q 35 77 35 70
           L 35 30
           Z"
        fill="none"
        stroke="url(#borderGradient)"
        strokeWidth="1.5"
        opacity="0.5"
      />

      {/* Medical Cross - TOP, Separated from Rx */}
      <g transform="translate(60, 38)">
        {/* Vertical bar */}
        <rect
          x="-3"
          y="-8"
          width="6"
          height="16"
          rx="2"
          fill="url(#mainGradient)"
          filter="url(#glow)"
        />
        {/* Horizontal bar */}
        <rect
          x="-8"
          y="-3"
          width="16"
          height="6"
          rx="2"
          fill="url(#mainGradient)"
          filter="url(#glow)"
        />
      </g>

      {/* Large Rx Symbol - BELOW Cross, No Overlap */}
      <g transform="translate(44, 68)">
        <text
          x="0"
          y="0"
          fontSize="32"
          fontWeight="900"
          fontFamily="serif, Georgia"
          fill="url(#mainGradient)"
          style={{ fontStyle: 'italic' }}
        >
          Rx
        </text>
      </g>

      {/* Prescription Lines - Inside Shield */}
      <g>
        <line x1="42" y1="74" x2="78" y2="74" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="42" y1="80" x2="74" y2="80" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="42" y1="86" x2="70" y2="86" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Speed/Digital Lines - Thicker and More Visible */}
      <g>
        {/* Left side - incoming data */}
        <path
          d="M 15 50 L 28 50"
          stroke="rgba(16, 185, 129, 0.9)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 18 57 L 28 57"
          stroke="rgba(16, 185, 129, 0.7)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 21 64 L 28 64"
          stroke="rgba(16, 185, 129, 0.5)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Right side - outgoing processing */}
        <path
          d="M 92 50 L 105 50"
          stroke="rgba(96, 165, 250, 0.9)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 92 57 L 102 57"
          stroke="rgba(96, 165, 250, 0.7)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 92 64 L 99 64"
          stroke="rgba(96, 165, 250, 0.5)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      {/* Verified Checkmark - Bottom Right */}
      <g transform="translate(76, 82)">
        <circle cx="0" cy="0" r="8" fill="url(#accentGradient)" filter="url(#glow)" />
        <path
          d="M -3 0 L -1 3 L 4 -3"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Digital Signature Flourish */}
      <path
        d="M 40 82 Q 50 78 60 82 Q 70 86 76 82"
        stroke="url(#mainGradient)"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* Health Pulse - Bottom */}
      <g opacity="0.6">
        <path
          d="M 30 105 L 42 105 L 46 98 L 50 112 L 54 105 L 60 105"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 60 105 L 66 105 L 70 98 L 74 112 L 78 105 L 90 105"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}