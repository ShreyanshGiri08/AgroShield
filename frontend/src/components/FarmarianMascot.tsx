import React from 'react';

export type MascotState = 'welcoming' | 'thinking' | 'alert' | 'reassuring';

interface FarmarianMascotProps {
  state?: MascotState;
  className?: string;
  size?: number;
}

export const FarmarianMascot: React.FC<FarmarianMascotProps> = ({
  state = 'welcoming',
  className = '',
  size = 64,
}) => {
  // Brand color tokens
  const cPitch = '#0F1108';
  const cCoffee = '#241909';
  const cPeach = '#F3B391';
  const cSand = '#F6D4BA';
  const cCornsilk = '#FEFADC';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title={`Farmarian (${state})`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Soft Background Halo */}
        <circle cx="50" cy="50" r="46" fill={cSand} opacity="0.35" />

        {/* Traditional Headwrap / Gamcha in warm Peach Glow */}
        <path
          d="M26 38C26 24 36 14 50 14C64 14 74 24 74 38C74 41 72 43 68 44C60 46 40 46 32 44C28 43 26 41 26 38Z"
          fill={cPeach}
          stroke={cCoffee}
          strokeWidth="3"
        />
        {/* Headwrap knot & fold */}
        <path
          d="M32 30C36 28 48 26 68 30"
          stroke={cCoffee}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="28" cy="34" r="5" fill={cPeach} stroke={cCoffee} strokeWidth="2.5" />

        {/* Agricultural Seedling / Sprout motif on headwrap */}
        <path
          d="M50 15C50 9 55 6 60 7C60 12 55 14 50 15Z"
          fill="#2E7D32"
          stroke={cCoffee}
          strokeWidth="1.5"
        />
        <path
          d="M49 15C49 10 44 8 40 10C41 14 46 15 49 15Z"
          fill="#4CAF50"
          stroke={cCoffee}
          strokeWidth="1.5"
        />

        {/* Friendly Face Oval */}
        <ellipse
          cx="50"
          cy="52"
          rx="22"
          ry="20"
          fill={cCornsilk}
          stroke={cCoffee}
          strokeWidth="3"
        />

        {/* Eyes based on state */}
        {state === 'thinking' ? (
          // Concentrating / Looking up
          <g fill={cPitch}>
            <circle cx="43" cy="47" r="2.8" />
            <circle cx="57" cy="47" r="2.8" />
            <path d="M40 43C42 41 46 41 47 43" stroke={cCoffee} strokeWidth="2" strokeLinecap="round" />
            <path d="M53 43C54 41 58 41 60 43" stroke={cCoffee} strokeWidth="2" strokeLinecap="round" />
          </g>
        ) : state === 'alert' ? (
          // Wide watchful eyes
          <g fill={cPitch}>
            <circle cx="42" cy="49" r="3.6" />
            <circle cx="58" cy="49" r="3.6" />
            <circle cx="43" cy="48" r="1.2" fill="white" />
            <circle cx="59" cy="48" r="1.2" fill="white" />
          </g>
        ) : (
          // Welcoming & Reassuring warm curved smile eyes
          <g stroke={cPitch} strokeWidth="2.8" strokeLinecap="round" fill="none">
            <path d="M40 49C42 46 45 46 47 49" />
            <path d="M53 49C55 46 58 46 60 49" />
          </g>
        )}

        {/* Rosy Cheeks in Peach Glow */}
        <circle cx="37" cy="54" r="3.5" fill={cPeach} opacity="0.6" />
        <circle cx="63" cy="54" r="3.5" fill={cPeach} opacity="0.6" />

        {/* Friendly Mustache & Smile */}
        <path
          d="M44 57C47 55 50 56 50 57C50 56 53 55 56 57C58 59 55 61 50 60C45 61 42 59 44 57Z"
          fill={cCoffee}
        />
        {state === 'welcoming' || state === 'reassuring' ? (
          <path
            d="M46 62C48 64 52 64 54 62"
            stroke={cPitch}
            strokeWidth="2"
            strokeLinecap="round"
          />
        ) : null}

        {/* Protective Collar / Jacket in Dark Coffee */}
        <path
          d="M30 68C36 65 44 65 50 67C56 65 64 65 70 68L74 86C66 88 34 88 26 86L30 68Z"
          fill={cCoffee}
          stroke={cPitch}
          strokeWidth="3"
        />
        {/* Inner Shirt in Desert Sand */}
        <polygon points="46,67 54,67 52,78 48,78" fill={cSand} />

        {/* State Badge Overlays */}
        {state === 'thinking' && (
          <g transform="translate(68, 12)">
            <circle cx="8" cy="8" r="8" fill={cCornsilk} stroke={cCoffee} strokeWidth="1.5" />
            <circle cx="5" cy="8" r="1.5" fill={cPitch} className="animate-pulse" />
            <circle cx="8" cy="8" r="1.5" fill={cPitch} className="animate-pulse delay-100" />
            <circle cx="11" cy="8" r="1.5" fill={cPitch} className="animate-pulse delay-200" />
          </g>
        )}
        {state === 'alert' && (
          <g transform="translate(68, 12)">
            <circle cx="8" cy="8" r="9" fill="#D32F2F" stroke={cCornsilk} strokeWidth="2" />
            <path d="M8 4V9" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="8" cy="12" r="1" fill="white" />
          </g>
        )}
        {state === 'reassuring' && (
          <g transform="translate(68, 12)">
            <circle cx="8" cy="8" r="9" fill="#2E7D32" stroke={cCornsilk} strokeWidth="2" />
            <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
