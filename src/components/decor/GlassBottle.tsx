type GlassBottleProps = {
  className?: string;
  size?: number;
};

export function GlassBottle({ className, size = 190 }: GlassBottleProps) {
  return (
    <svg
      className={className}
      width={size}
      height={Math.round((size * 210) / 220)}
      viewBox="0 0 220 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{
        pointerEvents: "none",
        overflow: "visible",
        filter: "drop-shadow(0 14px 22px rgba(107,21,48,0.18))",
      }}
    >
      <defs>
        <linearGradient id="gb-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.78" />
          <stop offset="0.55" stopColor="#FCE1E8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#F5A8BC" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id="gb-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#F5A8BC" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="gb-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F5A8BC" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#E8698A" stopOpacity="0.92" />
          <stop offset="1" stopColor="#C5325A" stopOpacity="0.88" />
        </linearGradient>
        <linearGradient id="gb-cap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E8698A" />
          <stop offset="1" stopColor="#C5325A" />
        </linearGradient>
        <radialGradient id="gb-drop" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFF8F5" />
          <stop offset="0.5" stopColor="#F5A8BC" />
          <stop offset="1" stopColor="#E8698A" />
        </radialGradient>
        <linearGradient id="gb-holo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F5A8BC" />
          <stop offset="0.35" stopColor="#FFD9C7" />
          <stop offset="0.7" stopColor="#E8698A" />
          <stop offset="1" stopColor="#FCE1E8" />
        </linearGradient>
        <linearGradient id="gb-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id="gb-holo-mask">
          <rect x="0" y="160" width="220" height="26" fill="url(#gb-fade)" />
        </mask>
        <clipPath id="gb-body">
          <path d="M82 62 C82 70 52 74 52 104 L52 156 C52 172 64 182 80 182 L112 182 C128 182 140 172 140 156 L140 104 C140 74 110 70 110 62 Z" />
        </clipPath>
        <filter id="gb-blur" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="gb-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style>{`
        .gb-float { animation: lumine-gb-float 7s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .gb-drop { animation: lumine-gb-float-s 6s ease-in-out -2s infinite; transform-box: fill-box; transform-origin: center; }
        .gb-drop2 { animation: lumine-gb-float-xs 5s ease-in-out -3.5s infinite; transform-box: fill-box; transform-origin: center; }
        .gb-wave { animation: lumine-gb-wave 5s ease-in-out infinite alternate; }
        .gb-spark { animation: lumine-gb-twinkle 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes lumine-gb-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes lumine-gb-float-s { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        @keyframes lumine-gb-float-xs { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
        @keyframes lumine-gb-wave { from { transform: translateX(-8px) } to { transform: translateX(8px) } }
        @keyframes lumine-gb-twinkle { 0%,100% { opacity: .55; transform: scale(.85) } 50% { opacity: 1; transform: scale(1.1) } }
        @media (prefers-reduced-motion: reduce) {
          .gb-float, .gb-drop, .gb-drop2, .gb-wave, .gb-spark { animation: none !important; }
        }
      `}</style>

      <ellipse cx="100" cy="194" rx="62" ry="8" fill="#6B1530" opacity="0.14" filter="url(#gb-blur)" />
      <ellipse cx="170" cy="176" rx="18" ry="4" fill="#6B1530" opacity="0.08" filter="url(#gb-blur)" />

      <g className="gb-float">
        <rect x="82" y="38" width="28" height="28" rx="5" fill="url(#gb-glass)" stroke="url(#gb-rim)" strokeWidth="1.4" />
        <path
          d="M82 62 C82 70 52 74 52 104 L52 156 C52 172 64 182 80 182 L112 182 C128 182 140 172 140 156 L140 104 C140 74 110 70 110 62 Z"
          fill="url(#gb-glass)"
        />
        <g clipPath="url(#gb-body)">
          <g className="gb-wave">
            <path d="M20 114 C44 104 66 124 96 114 C126 104 148 124 172 114 L172 190 L20 190 Z" fill="url(#gb-liquid)" />
            <path d="M20 114 C44 104 66 124 96 114 C126 104 148 124 172 114" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1.6" strokeLinecap="round" />
          </g>
          <circle cx="62" cy="150" r="2.5" fill="#fff" opacity="0.5" />
          <circle cx="132" cy="140" r="2" fill="#fff" opacity="0.45" />
          <circle cx="128" cy="166" r="3" fill="#fff" opacity="0.4" />
          <circle cx="63" cy="170" r="1.8" fill="#fff" opacity="0.5" />
        </g>
        <g clipPath="url(#gb-body)" mask="url(#gb-holo-mask)">
          <rect x="40" y="160" width="110" height="26" fill="url(#gb-holo)" opacity="0.38" />
        </g>
        <rect x="70" y="130" width="52" height="32" rx="10" fill="#fff" fillOpacity="0.5" stroke="#fff" strokeOpacity="0.85" strokeWidth="1" />
        <rect x="78" y="139" width="32" height="5" rx="2.5" fill="#6B1530" opacity="0.22" />
        <rect x="78" y="149" width="22" height="5" rx="2.5" fill="#6B1530" opacity="0.16" />
        <path
          d="M82 62 C82 70 52 74 52 104 L52 156 C52 172 64 182 80 182 L112 182 C128 182 140 172 140 156 L140 104 C140 74 110 70 110 62 Z"
          stroke="url(#gb-rim)"
          strokeWidth="1.6"
        />
        <path d="M62 100 C59 120 59 142 63 162" stroke="#fff" strokeOpacity="0.8" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M66 88 C68 82 74 78 80 76" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
        <path d="M133 112 C135 132 135 150 131 164" stroke="#C5325A" strokeOpacity="0.2" strokeWidth="3.2" strokeLinecap="round" />
        <rect x="80" y="40" width="32" height="5" rx="2.5" fill="#fff" opacity="0.5" />
        <rect x="76" y="14" width="40" height="30" rx="10" fill="url(#gb-cap)" />
        <path d="M84 21 C90 18 102 18 108 21" stroke="#fff" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
        <path d="M86 24 V37 M96 24 V37 M106 24 V37" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      <g className="gb-drop">
        <path
          d="M170 84 C170 84 150 108 150 124 C150 136 159 144 170 144 C181 144 190 136 190 124 C190 108 170 84 170 84 Z"
          fill="url(#gb-drop)"
          stroke="#fff"
          strokeOpacity="0.8"
          strokeWidth="1.2"
        />
        <path d="M160 116 C158 125 160 132 164 137" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="164" cy="106" rx="3" ry="6" transform="rotate(20 164 106)" fill="#fff" opacity="0.6" />
        <path d="M184 122 C184 132 178 140 170 141" stroke="#C5325A" strokeOpacity="0.22" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      <g className="gb-drop2">
        <path
          d="M184 58 C184 58 178 65 178 69 C178 73 181 75 184 75 C187 75 190 73 190 69 C190 65 184 58 184 58 Z"
          fill="url(#gb-drop)"
          stroke="#fff"
          strokeOpacity="0.8"
          strokeWidth="1"
        />
        <path d="M181 68 C180 71 181 73 183 74" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.6" strokeLinecap="round" />
      </g>

      <g transform="translate(46 40)">
        <g className="gb-spark" filter="url(#gb-glow)">
          <path
            d="M0 -8 C1 -2.5 2.5 -1 8 0 C2.5 1 1 2.5 0 8 C-1 2.5 -2.5 1 -8 0 C-2.5 -1 -1 -2.5 0 -8 Z"
            fill="#fff"
            fillOpacity="0.95"
            stroke="#F5A8BC"
            strokeOpacity="0.7"
            strokeWidth="0.8"
          />
        </g>
      </g>
    </svg>
  );
}
