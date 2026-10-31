import { useId } from "react";

type GlassRingsProps = {
  className?: string;
  size?: number;
};

const ring = (rx: number, ry: number) =>
  `M${110 + rx} 100 A${rx} ${ry} 0 1 1 ${110 - rx} 100 A${rx} ${ry} 0 1 1 ${110 + rx} 100 Z`;

export function GlassRings({ className, size = 190 }: GlassRingsProps) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `gr-${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  const layers = (rx: number, ry: number, rotation: number, body: string) => (
    <g transform={`rotate(${rotation} 110 100)`} fill="none" strokeLinejoin="round">
      <path d={ring(rx, ry)} pathLength={100} stroke={url(body)} strokeWidth={16} />
      <path d={ring(rx, ry)} pathLength={100} stroke={url("face")} strokeWidth={8} />
      <path
        d={ring(rx - 3.5, ry - 3.5)}
        pathLength={100}
        stroke="#C5325A"
        strokeOpacity={0.28}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray="22 78"
        strokeDashoffset={-4}
      />
      <path
        d={ring(rx + 3.5, ry + 3.5)}
        pathLength={100}
        stroke="#FFFFFF"
        strokeOpacity={0.92}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="22 78"
        strokeDashoffset={-53}
      />
      <path
        d={ring(rx, ry)}
        pathLength={100}
        stroke={url("iri")}
        strokeOpacity={0.15}
        strokeWidth={16}
        strokeDasharray="30 70"
        strokeDashoffset={-3}
      />
    </g>
  );

  return (
    <svg
      className={className}
      width={size}
      height={Math.round((size * 200) / 220)}
      viewBox="0 0 220 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{
        pointerEvents: "none",
        overflow: "visible",
        filter: "drop-shadow(0 16px 24px rgba(107,21,48,0.2))",
      }}
    >
      <defs>
        <linearGradient id={id("ringA")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5A8BC" />
          <stop offset="0.55" stopColor="#E8698A" />
          <stop offset="1" stopColor="#C5325A" />
        </linearGradient>
        <linearGradient id={id("ringB")} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FCE1E8" />
          <stop offset="0.5" stopColor="#F5A8BC" />
          <stop offset="1" stopColor="#E8698A" />
        </linearGradient>
        <linearGradient id={id("face")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.92" />
          <stop offset="1" stopColor="#FCE1E8" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={id("iri")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F5A8BC" />
          <stop offset="0.4" stopColor="#FFD9C7" />
          <stop offset="0.75" stopColor="#E8698A" />
          <stop offset="1" stopColor="#FCE1E8" />
        </linearGradient>
        <radialGradient id={id("pearl")} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFF8F5" />
          <stop offset="0.5" stopColor="#F5A8BC" />
          <stop offset="1" stopColor="#E8698A" />
        </radialGradient>
        <clipPath id={id("over")}>
          <circle cx="108" cy="64" r="18" />
          <circle cx="112" cy="136" r="18" />
        </clipPath>
        <filter id={id("blur")} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id={id("glow")} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <g id={id("A")}>{layers(74, 34, -28, "ringA")}</g>
      </defs>

      <style>{`
        .gr-float { animation: lumine-gr-float 7s ease-in-out infinite; }
        .gr-tilt { animation: lumine-gr-tilt 12s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
        .gr-pearl { animation: lumine-gr-bob 5s ease-in-out -2s infinite; }
        .gr-spark { animation: lumine-gr-twinkle 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes lumine-gr-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes lumine-gr-tilt { from { transform: rotate(-2.5deg) } to { transform: rotate(2.5deg) } }
        @keyframes lumine-gr-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        @keyframes lumine-gr-twinkle { 0%,100% { opacity: .55; transform: scale(.85) } 50% { opacity: 1; transform: scale(1.1) } }
        @media (prefers-reduced-motion: reduce) {
          .gr-float, .gr-tilt, .gr-pearl, .gr-spark { animation: none !important; }
        }
      `}</style>

      <ellipse
        cx="110"
        cy="186"
        rx="64"
        ry="8"
        fill="#6B1530"
        opacity="0.14"
        filter={url("blur")}
      />

      <g className="gr-float">
        <g className="gr-tilt">
          <use href={`#${id("A")}`} />
          {layers(70, 32, 30, "ringB")}
          <use href={`#${id("A")}`} clipPath={url("over")} />
        </g>
        <g className="gr-pearl">
          <circle
            cx="192"
            cy="150"
            r="11.5"
            fill={url("pearl")}
            stroke="#fff"
            strokeOpacity="0.8"
            strokeWidth="1"
          />
          <ellipse
            cx="188.2"
            cy="145"
            rx="3.6"
            ry="2.4"
            transform="rotate(-30 188.2 145)"
            fill="#fff"
            opacity="0.7"
          />
          <path
            d="M200.5 154.9 A9.8 9.8 0 0 1 190.3 159.6"
            stroke="#C5325A"
            strokeOpacity="0.22"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </g>

      <g transform="translate(70 36)">
        <g className="gr-spark" filter={url("glow")}>
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
      <g transform="translate(176 42) scale(0.55)">
        <g className="gr-spark" style={{ animationDelay: "-2s" }} filter={url("glow")}>
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
