type GlassCoinProps = {
  className?: string;
  size?: number; // largura em px
};

// Gomos da borda lateral da moeda (ângulos de -82° a +82° na lateral visível)
const RIM_NOTCH_ANGLES = [
  -76, -62, -48, -34, -20, -6, 8, 22, 36, 50, 64, 78,
];

const RX = 55;
const RY = 73;
const DEPTH = 17;

function notchQuad(deg: number, halfSpanDeg = 5.2) {
  const a1 = ((deg - halfSpanDeg) * Math.PI) / 180;
  const a2 = ((deg + halfSpanDeg) * Math.PI) / 180;
  const x1 = RX * Math.cos(a1);
  const y1 = RY * Math.sin(a1);
  const x2 = RX * Math.cos(a2);
  const y2 = RY * Math.sin(a2);
  const pad = 2.2;
  const x1f = (x1 + pad).toFixed(1);
  const y1f = y1.toFixed(1);
  const x1b = (x1 + DEPTH - pad).toFixed(1);
  const x2b = (x2 + DEPTH - pad).toFixed(1);
  const y2f = y2.toFixed(1);
  const x2f = (x2 + pad).toFixed(1);
  return `M${x1f} ${y1f} L${x1b} ${y1f} L${x2b} ${y2f} L${x2f} ${y2f} Z`;
}

// Curva central do S do cifrão + hastes superior e inferior
const DOLLAR_S_PATH =
  "M 15 -18 C 11.5 -25.5 5 -28.5 -2 -28.5 C -11 -28.5 -16.5 -23 -16.5 -15.5 C -16.5 -6.5 -7.5 -3.5 0.5 -0.5 C 8.5 2.5 17 5.8 17 15.5 C 17 24 10 29 -0.5 29 C -8.5 29 -14.5 25 -17.5 18.5";
const DOLLAR_BARS_PATH = "M 0 -40 V -26.5 M 0 26.5 V 40";

export function GlassCoin({ className, size = 190 }: GlassCoinProps) {
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
        filter: "drop-shadow(0 6px 14px rgba(107,21,48,0.11))",
      }}
    >
      <defs>
        {/* Corpo lateral (espessura 3D da moeda) */}
        <linearGradient id="gco-side" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#FCE1E8" stopOpacity="0.92" />
          <stop offset="0.28" stopColor="#F5A8BC" stopOpacity="0.88" />
          <stop offset="0.55" stopColor="#FFD9C7" stopOpacity="0.85" />
          <stop offset="0.8" stopColor="#E8698A" stopOpacity="0.88" />
          <stop offset="1" stopColor="#C5325A" stopOpacity="0.82" />
        </linearGradient>

        {/* Gomos de vidro na lateral */}
        <linearGradient id="gco-notch" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#FCE1E8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFD9C7" stopOpacity="0.65" />
        </linearGradient>

        {/* Face externa de vidro translúcido */}
        <linearGradient id="gco-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.92" />
          <stop offset="0.45" stopColor="#FCE1E8" stopOpacity="0.72" />
          <stop offset="0.8" stopColor="#F5A8BC" stopOpacity="0.58" />
          <stop offset="1" stopColor="#FFD9C7" stopOpacity="0.52" />
        </linearGradient>

        {/* Borda iridescente do anel externo */}
        <linearGradient id="gco-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.98" />
          <stop offset="0.45" stopColor="#F5A8BC" stopOpacity="0.75" />
          <stop offset="0.75" stopColor="#FFD9C7" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.88" />
        </linearGradient>

        {/* Cavidade interna (bacia em vidro rose/berry como na referência) */}
        <radialGradient id="gco-well" cx="0.38" cy="0.32" r="0.82">
          <stop offset="0" stopColor="#F5A8BC" stopOpacity="0.75" />
          <stop offset="0.48" stopColor="#E8698A" stopOpacity="0.72" />
          <stop offset="0.85" stopColor="#C5325A" stopOpacity="0.76" />
          <stop offset="1" stopColor="#6B1530" stopOpacity="0.68" />
        </radialGradient>

        {/* Parede interna da cavidade (relevo côncavo) */}
        <linearGradient id="gco-well-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6B1530" stopOpacity="0.42" />
          <stop offset="0.5" stopColor="#C5325A" stopOpacity="0.28" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.85" />
        </linearGradient>

        {/* Extrusão 3D do cifrão */}
        <linearGradient id="gco-sym-extrude" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFD9C7" />
          <stop offset="0.45" stopColor="#F5A8BC" />
          <stop offset="1" stopColor="#6B1530" stopOpacity="0.75" />
        </linearGradient>

        {/* Face de cristal do cifrão */}
        <linearGradient id="gco-sym-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.98" />
          <stop offset="0.5" stopColor="#FFF8F5" stopOpacity="0.9" />
          <stop offset="0.85" stopColor="#FCE1E8" stopOpacity="0.86" />
          <stop offset="1" stopColor="#FFD9C7" stopOpacity="0.82" />
        </linearGradient>

        {/* Bolinha decorativa */}
        <radialGradient id="gco-dot" cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#FFF8F5" />
          <stop offset="0.5" stopColor="#F5A8BC" />
          <stop offset="1" stopColor="#E8698A" />
        </radialGradient>

        <clipPath id="gco-well-clip">
          <ellipse cx="0" cy="0" rx="42" ry="56" />
        </clipPath>

        <filter id="gco-blur" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="gco-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style>{`
        .gco-float { animation: lumine-gco-float 7s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .gco-dot   { animation: lumine-gco-float-xs 5s ease-in-out -3.5s infinite; transform-box: fill-box; transform-origin: center; }
        .gco-spark { animation: lumine-gco-twinkle 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes lumine-gco-float    { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes lumine-gco-float-xs { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
        @keyframes lumine-gco-twinkle  { 0%,100% { opacity: .55; transform: scale(.85) } 50% { opacity: 1; transform: scale(1.1) } }
        @media (prefers-reduced-motion: reduce) {
          .gco-float, .gco-dot, .gco-spark { animation: none !important; }
        }
      `}</style>

      {/* Sombra projetada */}
      <ellipse
        cx="112"
        cy="194"
        rx="62"
        ry="8"
        fill="#6B1530"
        opacity="0.08"
        filter="url(#gco-blur)"
      />

      {/* MOEDA 3D EM VIDRO LUMINE */}
      <g className="gco-float">
        <g transform="translate(103 101) rotate(-22)">
          {/* 1. Parede cilindrica da espessura (entre a elipse frontal e a traseira) */}
          <path
            d={`M 0 ${-RY} L ${DEPTH} ${-RY} A ${RX} ${RY} 0 0 1 ${DEPTH} ${RY} L 0 ${RY} A ${RX} ${RY} 0 0 0 0 ${-RY} Z`}
            fill="url(#gco-side)"
          />

          {/* 2. Gomos de vidro na borda da moeda (como na imagem 1 de referência) */}
          {RIM_NOTCH_ANGLES.map((deg) => (
            <path
              key={deg}
              d={notchQuad(deg)}
              fill="url(#gco-notch)"
              stroke="#FFFFFF"
              strokeOpacity="0.65"
              strokeWidth="0.9"
              strokeLinejoin="round"
            />
          ))}

          {/* Contorno traseiro da moeda */}
          <path
            d={`M ${DEPTH} ${-RY} A ${RX} ${RY} 0 0 1 ${DEPTH} ${RY}`}
            stroke="#FFFFFF"
            strokeOpacity="0.82"
            strokeWidth="1.5"
          />

          {/* 3. Face frontal de vidro */}
          <ellipse cx="0" cy="0" rx={RX} ry={RY} fill="url(#gco-face)" />
          <ellipse
            cx="0"
            cy="0"
            rx={RX}
            ry={RY}
            stroke="url(#gco-rim)"
            strokeWidth="2"
          />

          {/* 4. Cavidade central em vidro berry/rose (como na imagem 2 de referência) */}
          <ellipse cx="0" cy="0" rx="42" ry="56" fill="url(#gco-well)" />

          {/* Parede interna da cavidade dando efeito de profundidade côncava */}
          <g clipPath="url(#gco-well-clip)">
            <ellipse
              cx="5.5"
              cy="1.5"
              rx="42"
              ry="56"
              stroke="url(#gco-well-wall)"
              strokeWidth="7"
            />
            {/* Brilho quente interno (peach/rose) no fundo da cavidade */}
            <ellipse
              cx="-10"
              cy="-16"
              rx="26"
              ry="34"
              fill="#FFD9C7"
              fillOpacity="0.22"
            />
          </g>

          {/* Anel de borda da cavidade interna */}
          <ellipse
            cx="0"
            cy="0"
            rx="42"
            ry="56"
            stroke="#FFFFFF"
            strokeOpacity="0.88"
            strokeWidth="1.6"
          />

          {/* 5. Cifrão ($) 3D em vidro translúcido com chanfro lateral */}
          <g transform="translate(-1.5 0) scale(0.84 0.94)">
            {/* Sombra projetada pelo cifrão no fundo da cavidade */}
            <g transform="translate(7.5 4.5)" opacity="0.28">
              <path
                d={DOLLAR_BARS_PATH}
                stroke="#6B1530"
                strokeWidth="9.5"
                strokeLinecap="round"
              />
              <path
                d={DOLLAR_S_PATH}
                stroke="#6B1530"
                strokeWidth="11.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Extrusão 3D lateral do cifrão (chanfro rose/peach) */}
            <g transform="translate(4.2 2.2)">
              <path
                d={DOLLAR_BARS_PATH}
                stroke="url(#gco-sym-extrude)"
                strokeWidth="9.5"
                strokeLinecap="round"
              />
              <path
                d={DOLLAR_S_PATH}
                stroke="url(#gco-sym-extrude)"
                strokeWidth="11.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Face frontal de vidro do cifrão */}
            <path
              d={DOLLAR_BARS_PATH}
              stroke="url(#gco-sym-face)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d={DOLLAR_S_PATH}
              stroke="url(#gco-sym-face)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Reflexo de vidro interno rosa/pêssego no cifrão */}
            <path
              d={DOLLAR_S_PATH}
              transform="translate(1 0.8)"
              stroke="#E8698A"
              strokeOpacity="0.35"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Brilho especular branco na quina superior/esquerda do cifrão */}
            <path
              d={DOLLAR_S_PATH}
              transform="translate(-1.8 -1.4)"
              stroke="#FFFFFF"
              strokeOpacity="0.95"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={DOLLAR_BARS_PATH}
              transform="translate(-1.6 -1)"
              stroke="#FFFFFF"
              strokeOpacity="0.9"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* 6. Reflexos especulares no anel externo de vidro */}
          <path
            d="M -47 -18 C -49 -40 -37 -59 -18 -66"
            stroke="#FFFFFF"
            strokeOpacity="0.9"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d="M -50 4 C -50 11 -49 17 -46 23"
            stroke="#FFFFFF"
            strokeOpacity="0.72"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M 46 32 C 40 52 26 65 9 69"
            stroke="#FFD9C7"
            strokeOpacity="0.7"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* BOLINHA DE VIDRO */}
      <g className="gco-dot">
        <circle
          cx="188"
          cy="60"
          r="8"
          fill="url(#gco-dot)"
          stroke="#fff"
          strokeOpacity="0.85"
          strokeWidth="1.1"
        />
        <path
          d="M184 58 C184 55 186 53 189 53"
          stroke="#fff"
          strokeOpacity="0.9"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>

      {/* FAÍSCA (estrela de 4 pontas do Lumine) */}
      <g transform="translate(26 52)">
        <g className="gco-spark" filter="url(#gco-glow)">
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
