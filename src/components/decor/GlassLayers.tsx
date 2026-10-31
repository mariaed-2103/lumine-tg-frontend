import React from "react";

type GlassLayersProps = {
  className?: string;
  size?: number;
};

export const GlassLayers: React.FC<GlassLayersProps> = ({ className, size }) => {
  const widthStyle = size ? { width: size, height: Math.round((size * 210) / 220) } : undefined;

  return (
    <svg
      viewBox="0 0 220 210"
      style={widthStyle}
      className={
        className ??
        "hidden lg:block pointer-events-none select-none w-[190px] h-[180px] 2xl:w-[220px] 2xl:h-[210px]"
      }
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Preenchimento 135° de cada placa: branco 70% -> Luz Pálida 55% -> Petal 35% */}
        <linearGradient id="gl-plate-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
          <stop offset="52%" stopColor="#FCE1E8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F5A8BC" stopOpacity="0.36" />
        </linearGradient>

        {/* Borda 1.5px em gradiente: branco 95% -> Petal 60% -> branco 70% */}
        <linearGradient id="gl-plate-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#F5A8BC" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.7" />
        </linearGradient>

        {/* Faixa holográfica horizontal: Petal -> pêssego #FFD9C7 -> Rosa Aceso -> Luz Pálida */}
        <linearGradient id="gl-holo-horiz" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5A8BC" stopOpacity="0.38" />
          <stop offset="35%" stopColor="#FFD9C7" stopOpacity="0.4" />
          <stop offset="70%" stopColor="#E8698A" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#FCE1E8" stopOpacity="0.36" />
        </linearGradient>

        {/* Fade vertical para cima na faixa holográfica */}
        <linearGradient id="gl-holo-fade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
        </linearGradient>

        {/* Sombra interna Berry ~15% na borda inferior */}
        <linearGradient id="gl-berry-inner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C5325A" stopOpacity="0" />
          <stop offset="100%" stopColor="#C5325A" stopOpacity="0.16" />
        </linearGradient>

        {/* Máscaras para fade vertical da faixa holográfica */}
        <mask id="gl-mask-back">
          <rect x="70" y="74" width="118" height="14" fill="url(#gl-holo-fade)" />
        </mask>
        <mask id="gl-mask-mid">
          <rect x="44" y="132" width="128" height="14" fill="url(#gl-holo-fade)" />
        </mask>
        <mask id="gl-mask-front">
          <rect x="76" y="182" width="116" height="14" fill="url(#gl-holo-fade)" />
        </mask>

        {/* ClipPaths das 3 placas arredondadas */}
        <clipPath id="gl-clip-back">
          <rect x="70" y="14" width="118" height="74" rx="20" />
        </clipPath>
        <clipPath id="gl-clip-mid">
          <rect x="44" y="66" width="128" height="80" rx="22" />
        </clipPath>
        <clipPath id="gl-clip-front">
          <rect x="76" y="124" width="116" height="72" rx="20" />
        </clipPath>

        {/* Sombra de chão desfocada em Vinho a 12% */}
        <filter id="gl-floor-blur" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="8" />
        </filter>

        {/* Glow sutil para a estrela de 4 pontas */}
        <filter id="gl-spark-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sombra de chão: elipse desfocada em Vinho a 12% */}
      <ellipse
        cx="124"
        cy="198"
        rx="68"
        ry="8"
        fill="#6B1530"
        fillOpacity="0.06"
        filter="url(#gl-floor-blur)"
      />

      {/* PLACA 1 (Trás): x70, y14, 118x74, rx20, rotação -7°, opacidade 0.8 */}
      <g
        className="glass-plate-float-1"
        style={{ filter: "drop-shadow(0 4px 10px rgba(107, 21, 48, 0.09))" }}
      >
        <g transform="rotate(-7 129 51)" opacity="0.82">
          <g clipPath="url(#gl-clip-back)">
            <rect x="70" y="14" width="118" height="74" rx="20" fill="url(#gl-plate-fill)" />
            <rect
              x="70"
              y="74"
              width="118"
              height="14"
              fill="url(#gl-holo-horiz)"
              mask="url(#gl-mask-back)"
            />
            <rect x="70" y="80" width="118" height="8" fill="url(#gl-berry-inner)" />
          </g>
          <rect
            x="70"
            y="14"
            width="118"
            height="74"
            rx="20"
            fill="none"
            stroke="url(#gl-plate-stroke)"
            strokeWidth="1.5"
          />
          {/* Highlight branco curvo de 1.5px a 70% ao longo da borda superior */}
          <path
            d="M 88 15.5 H 170 A 18 18 0 0 1 184 23"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.72"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Barras de texto arredondadas em branco a 75% */}
          <rect x="86" y="32" width="54" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.75" />
          <rect x="86" y="45" width="36" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.75" />
          <rect x="86" y="58" width="44" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.68" />
          {/* Anel pequeno no canto superior direito */}
          <circle
            cx="166"
            cy="35"
            r="8"
            fill="#FFFFFF"
            fillOpacity="0.16"
            stroke="#FFFFFF"
            strokeOpacity="0.8"
            strokeWidth="2"
          />
        </g>
      </g>

      {/* PLACA 2 (Meio): x44, y66, 128x80, rx22, rotação 3° */}
      <g
        className="glass-plate-float-2"
        style={{ filter: "drop-shadow(0 4px 10px rgba(107, 21, 48, 0.09))" }}
      >
        <g transform="rotate(3 108 106)">
          <g clipPath="url(#gl-clip-mid)">
            <rect x="44" y="66" width="128" height="80" rx="22" fill="url(#gl-plate-fill)" />
            <rect
              x="44"
              y="132"
              width="128"
              height="14"
              fill="url(#gl-holo-horiz)"
              mask="url(#gl-mask-mid)"
            />
            <rect x="44" y="138" width="128" height="8" fill="url(#gl-berry-inner)" />
          </g>
          <rect
            x="44"
            y="66"
            width="128"
            height="80"
            rx="22"
            fill="none"
            stroke="url(#gl-plate-stroke)"
            strokeWidth="1.5"
          />
          {/* Highlight branco curvo de 1.5px a 70% ao longo da borda superior */}
          <path
            d="M 64 67.5 H 152 A 20 20 0 0 1 167 76"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.75"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Barras de texto arredondadas em branco a 75% */}
          <rect x="62" y="86" width="58" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.78" />
          <rect x="62" y="100" width="40" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.75" />
          <rect x="62" y="114" width="48" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.7" />
          {/* Anel pequeno no canto superior direito */}
          <circle
            cx="150"
            cy="89"
            r="8"
            fill="#FFFFFF"
            fillOpacity="0.18"
            stroke="#FFFFFF"
            strokeOpacity="0.82"
            strokeWidth="2"
          />
        </g>
      </g>

      {/* PLACA 3 (Frente): x76, y124, 116x72, rx20, rotação -4° */}
      <g
        className="glass-plate-float-3"
        style={{ filter: "drop-shadow(0 4px 10px rgba(107, 21, 48, 0.09))" }}
      >
        <g transform="rotate(-4 134 160)">
          <g clipPath="url(#gl-clip-front)">
            <rect x="76" y="124" width="116" height="72" rx="20" fill="url(#gl-plate-fill)" />
            <rect
              x="76"
              y="182"
              width="116"
              height="14"
              fill="url(#gl-holo-horiz)"
              mask="url(#gl-mask-front)"
            />
            <rect x="76" y="188" width="116" height="8" fill="url(#gl-berry-inner)" />
          </g>
          <rect
            x="76"
            y="124"
            width="116"
            height="72"
            rx="20"
            fill="none"
            stroke="url(#gl-plate-stroke)"
            strokeWidth="1.5"
          />
          {/* Highlight branco curvo de 1.5px a 70% ao longo da borda superior */}
          <path
            d="M 94 125.5 H 174 A 18 18 0 0 1 188 133"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.78"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Barras de texto arredondadas em branco a 75% */}
          <rect x="92" y="142" width="56" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.8" />
          <rect x="92" y="155" width="38" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.75" />
          <rect x="92" y="168" width="46" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.72" />
          {/* Anel pequeno no canto superior direito */}
          <circle
            cx="171"
            cy="145"
            r="8"
            fill="#FFFFFF"
            fillOpacity="0.2"
            stroke="#FFFFFF"
            strokeOpacity="0.85"
            strokeWidth="2"
          />
        </g>
      </g>

      {/* Faísca: estrela de 4 pontas côncavas (~14px) no canto superior direito */}
      <g transform="translate(192, 16)" filter="url(#gl-spark-glow)">
        <path
          d="M7 0 C7.6 4.2 9.8 6.4 14 7 C9.8 7.6 7.6 9.8 7 14 C6.4 9.8 4.2 7.6 0 7 C4.2 6.4 6.4 4.2 7 0 Z"
          fill="#FFFFFF"
          fillOpacity="0.92"
          stroke="#F5A8BC"
          strokeOpacity="0.6"
          strokeWidth="0.6"
        />
      </g>
    </svg>
  );
};
