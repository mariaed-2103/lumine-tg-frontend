type GlassFinanceWalletProps = {
  className?: string;
};

export function GlassFinanceWallet({ className }: GlassFinanceWalletProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{
        pointerEvents: "none",
        overflow: "visible",
        filter: "drop-shadow(0 8px 14px rgba(107,21,48,0.12))",
      }}
    >
      <defs>
        <linearGradient
          id="gfw-wallet-face"
          x1="52"
          y1="49"
          x2="186"
          y2="137"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF8F5" stopOpacity=".96" />
          <stop offset=".48" stopColor="#FCE1E8" stopOpacity=".88" />
          <stop offset="1" stopColor="#F5A8BC" stopOpacity=".78" />
        </linearGradient>
        <linearGradient
          id="gfw-wallet-side"
          x1="73"
          y1="121"
          x2="186"
          y2="147"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8698A" stopOpacity=".74" />
          <stop offset="1" stopColor="#6B1530" stopOpacity=".78" />
        </linearGradient>
        <linearGradient
          id="gfw-wallet-rim"
          x1="58"
          y1="44"
          x2="170"
          y2="92"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset=".55" stopColor="#F5A8BC" />
          <stop offset="1" stopColor="#FFD9C7" />
        </linearGradient>
        <linearGradient
          id="gfw-chart-line"
          x1="81"
          y1="98"
          x2="153"
          y2="57"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C5325A" />
          <stop offset="1" stopColor="#6B1530" />
        </linearGradient>
        <radialGradient
          id="gfw-coin"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(0 28 -28 0 176 114)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF8F5" />
          <stop offset=".55" stopColor="#FFD9C7" />
          <stop offset="1" stopColor="#E8698A" />
        </radialGradient>
      </defs>

      <g className="gfw-float">
        <path
          d="M47 64c0-8 6-14 14-14h102c10 0 18 8 18 18v59c0 8-6 14-14 14H63c-9 0-16-7-16-16V64Z"
          fill="url(#gfw-wallet-side)"
          opacity=".8"
        />
        <path
          d="m47 110 17 13c3 2 7 3 11 3h98l-8 11H63c-9 0-16-7-16-16v-11Z"
          fill="#6B1530"
          fillOpacity=".22"
        />
        <path
          d="M43 58c0-9 7-16 16-16h111c9 0 16 7 16 16v61c0 9-7 16-16 16H59c-9 0-16-7-16-16V58Z"
          fill="url(#gfw-wallet-face)"
          stroke="url(#gfw-wallet-rim)"
          strokeWidth="2.5"
        />
        <path d="M54 57c0-5 4-9 9-9h98c8 0 14 6 14 14v4H54v-9Z" fill="white" fillOpacity=".38" />
        <path
          d="M61 112h92"
          stroke="white"
          strokeOpacity=".75"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="m72 98 18-17 17 8 25-26 20 8"
          stroke="url(#gfw-chart-line)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m142 71 10 1-2-10"
          stroke="#6B1530"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="72" cy="98" r="4" fill="#FFF8F5" stroke="#C5325A" strokeWidth="2" />
        <circle cx="90" cy="81" r="4" fill="#FFF8F5" stroke="#C5325A" strokeWidth="2" />
        <circle cx="107" cy="89" r="4" fill="#FFF8F5" stroke="#C5325A" strokeWidth="2" />
        <circle cx="132" cy="63" r="4" fill="#FFF8F5" stroke="#C5325A" strokeWidth="2" />
      </g>

      <g className="gfw-coin">
        <ellipse cx="176" cy="123" rx="22" ry="25" fill="#C5325A" fillOpacity=".3" />
        <ellipse
          cx="173"
          cy="117"
          rx="22"
          ry="25"
          fill="url(#gfw-coin)"
          stroke="white"
          strokeOpacity=".9"
          strokeWidth="2"
        />
        <ellipse
          cx="173"
          cy="117"
          rx="16"
          ry="19"
          stroke="#C5325A"
          strokeOpacity=".35"
          strokeWidth="1.5"
        />
        <path
          d="M178 108c-1.6-2-3.6-3-6.2-3-3.7 0-6.1 1.8-6.1 4.5 0 2.8 2.7 3.8 6.1 5 3.4 1.2 6.2 2.3 6.2 5.2 0 2.8-2.5 4.7-6.4 4.7-2.8 0-5.3-1-7-3"
          stroke="#6B1530"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
        <path d="M172 101v32" stroke="#6B1530" strokeWidth="2" strokeLinecap="round" />
      </g>

      <path d="m198 45 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" fill="#FFD9C7" />
      <circle cx="37" cy="92" r="3" fill="#F5A8BC" />

      <style>{`
        .gfw-float { animation: lumine-gfw-float 7s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .gfw-coin { animation: lumine-gfw-coin 5.5s ease-in-out -2.5s infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes lumine-gfw-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        @keyframes lumine-gfw-coin { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
        @media (prefers-reduced-motion: reduce) {
          .gfw-float, .gfw-coin { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}
