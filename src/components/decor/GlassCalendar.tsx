type GlassCalendarProps = {
  className?: string;
  size?: number; // largura em px
};

export function GlassCalendar({ className, size = 190 }: GlassCalendarProps) {
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
        filter: "drop-shadow(0 4px 10px rgba(107,21,48,0.09))",
      }}
    >
      <defs>
        {/* Vidro do calendário */}
        <linearGradient id="gc-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="0.55" stopColor="#FCE1E8" stopOpacity="0.52" />
          <stop offset="1" stopColor="#F5A8BC" stopOpacity="0.34" />
        </linearGradient>
        {/* Borda do vidro */}
        <linearGradient id="gc-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#F5A8BC" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.7" />
        </linearGradient>
        {/* Faixa superior (cabeçalho do calendário) */}
        <linearGradient id="gc-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E8698A" stopOpacity="0.78" />
          <stop offset="1" stopColor="#C5325A" stopOpacity="0.68" />
        </linearGradient>
        {/* Argolas */}
        <linearGradient id="gc-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#F5A8BC" stopOpacity="0.85" />
        </linearGradient>
        {/* Círculo do check */}
        <radialGradient id="gc-check" cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#F5A8BC" />
          <stop offset="0.5" stopColor="#E8698A" />
          <stop offset="1" stopColor="#C5325A" />
        </radialGradient>
        {/* Dia destacado */}
        <radialGradient id="gc-day" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#F5A8BC" />
          <stop offset="1" stopColor="#E8698A" />
        </radialGradient>
        {/* Faixa iridescente sutil */}
        <linearGradient id="gc-holo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F5A8BC" />
          <stop offset="0.35" stopColor="#FFD9C7" />
          <stop offset="0.7" stopColor="#E8698A" />
          <stop offset="1" stopColor="#FCE1E8" />
        </linearGradient>
        <linearGradient id="gc-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id="gc-holo-mask">
          <rect x="30" y="150" width="130" height="34" fill="url(#gc-fade)" />
        </mask>
        {/* Recorte do corpo do calendário */}
        <clipPath id="gc-body">
          <rect x="30" y="44" width="130" height="140" rx="20" />
        </clipPath>
        <filter id="gc-blur" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="gc-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style>{`
        .gc-float { animation: lumine-gc-float 7s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .gc-check { animation: lumine-gc-float-s 6s ease-in-out -2s infinite; transform-box: fill-box; transform-origin: center; }
        .gc-dot   { animation: lumine-gc-float-xs 5s ease-in-out -3.5s infinite; transform-box: fill-box; transform-origin: center; }
        .gc-spark { animation: lumine-gc-twinkle 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes lumine-gc-float   { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes lumine-gc-float-s { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
        @keyframes lumine-gc-float-xs{ 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
        @keyframes lumine-gc-twinkle { 0%,100% { opacity: .55; transform: scale(.85) } 50% { opacity: 1; transform: scale(1.1) } }
        @media (prefers-reduced-motion: reduce) {
          .gc-float, .gc-check, .gc-dot, .gc-spark { animation: none !important; }
        }
      `}</style>

      {/* Sombra no chão */}
      <ellipse
        cx="96"
        cy="196"
        rx="64"
        ry="8"
        fill="#6B1530"
        opacity="0.06"
        filter="url(#gc-blur)"
      />
      <ellipse
        cx="170"
        cy="182"
        rx="18"
        ry="4"
        fill="#6B1530"
        opacity="0.04"
        filter="url(#gc-blur)"
      />

      {/* CALENDÁRIO */}
      <g className="gc-float">
        {/* Corpo de vidro */}
        <rect x="30" y="44" width="130" height="140" rx="20" fill="url(#gc-glass)" />

        {/* Faixa superior + grade (recortadas pelo corpo) */}
        <g clipPath="url(#gc-body)">
          <rect x="30" y="44" width="130" height="38" fill="url(#gc-top)" />
          <rect x="30" y="44" width="130" height="14" fill="#fff" opacity="0.16" />

          {/* Dias: 3 linhas x 4 colunas */}
          <g fill="#6B1530" opacity="0.2">
            <rect x="44" y="96" width="16" height="12" rx="4" />
            <rect x="68" y="96" width="16" height="12" rx="4" />
            <rect x="92" y="96" width="16" height="12" rx="4" />
            <rect x="116" y="96" width="16" height="12" rx="4" />
            <rect x="44" y="118" width="16" height="12" rx="4" />
            <rect x="92" y="118" width="16" height="12" rx="4" />
            <rect x="116" y="118" width="16" height="12" rx="4" />
            <rect x="44" y="140" width="16" height="12" rx="4" />
            <rect x="68" y="140" width="16" height="12" rx="4" />
            <rect x="92" y="140" width="16" height="12" rx="4" />
          </g>
          {/* Dia destacado */}
          <rect x="66" y="116" width="20" height="16" rx="5" fill="url(#gc-day)" />
          <rect x="68" y="118" width="8" height="3" rx="1.5" fill="#fff" opacity="0.6" />

          {/* Faixa iridescente na base, com fade para cima */}
          <g mask="url(#gc-holo-mask)">
            <rect x="30" y="150" width="130" height="34" fill="url(#gc-holo)" opacity="0.38" />
          </g>
        </g>

        {/* Contorno do corpo */}
        <rect
          x="30"
          y="44"
          width="130"
          height="140"
          rx="20"
          stroke="url(#gc-rim)"
          strokeWidth="1.6"
        />
        {/* Highlights */}
        <path
          d="M38 98 C36 120 36 146 40 168"
          stroke="#fff"
          strokeOpacity="0.8"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M40 70 C42 62 48 58 56 56"
          stroke="#fff"
          strokeOpacity="0.6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M153 100 C155 124 155 148 151 168"
          stroke="#C5325A"
          strokeOpacity="0.2"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Argolas de vidro */}
        <rect
          x="58"
          y="30"
          width="12"
          height="28"
          rx="6"
          fill="url(#gc-ring)"
          stroke="url(#gc-rim)"
          strokeWidth="1.2"
        />
        <rect
          x="120"
          y="30"
          width="12"
          height="28"
          rx="6"
          fill="url(#gc-ring)"
          stroke="url(#gc-rim)"
          strokeWidth="1.2"
        />
        <path
          d="M62 36 V46"
          stroke="#fff"
          strokeOpacity="0.8"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M124 36 V46"
          stroke="#fff"
          strokeOpacity="0.8"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>

      {/* CÍRCULO COM CHECK */}
      <g className="gc-check">
        <circle
          cx="160"
          cy="132"
          r="28"
          fill="url(#gc-check)"
          fillOpacity="0.82"
          stroke="#fff"
          strokeOpacity="0.8"
          strokeWidth="1.4"
        />
        <path
          d="M143 126 C146 114 156 108 168 109"
          stroke="#fff"
          strokeOpacity="0.55"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M148 134 L157 143 L174 124"
          stroke="#fff"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M182 140 C180 150 172 158 162 159"
          stroke="#6B1530"
          strokeOpacity="0.22"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* BOLINHA DE VIDRO */}
      <g className="gc-dot">
        <circle
          cx="190"
          cy="78"
          r="8"
          fill="url(#gc-check)"
          stroke="#fff"
          strokeOpacity="0.8"
          strokeWidth="1"
        />
        <path
          d="M186 76 C186 73 188 71 191 71"
          stroke="#fff"
          strokeOpacity="0.85"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>

      {/* FAÍSCA (a mesma estrela de 4 pontas côncavas do logo) */}
      <g transform="translate(16 54)">
        <g className="gc-spark" filter="url(#gc-glow)">
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
