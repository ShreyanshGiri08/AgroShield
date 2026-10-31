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
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title={`Farmarian — The AgroShield Guardian (${state})`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-all duration-300"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F6D4BA" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#F3B391" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F3B391" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="turbanGrad" x1="20" y1="20" x2="100" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F3B391" />
            <stop offset="50%" stopColor="#E89467" />
            <stop offset="100%" stopColor="#D97B49" />
          </linearGradient>

          <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>

          <linearGradient id="faceGrad" x1="60" y1="40" x2="60" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="100%" stopColor="#FEFADC" />
          </linearGradient>
          
          <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#241909" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Ambient Halo */}
        <circle cx="60" cy="60" r="54" fill="url(#haloGrad)" />

        {/* Outer Ring Accent */}
        <circle
          cx="60"
          cy="60"
          r="52"
          stroke="#F6D4BA"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.8"
        />

        {/* Sprouting AI Leaf Antenna on Turban */}
        <g filter="url(#shadowFilter)">
          {/* Main Stalk */}
          <path
            d="M60 26C60 16 68 10 74 12C74 20 66 24 60 26Z"
            fill="url(#leafGrad)"
            stroke="#241909"
            strokeWidth="2"
          />
          {/* Secondary Sprout */}
          <path
            d="M59 26C58 18 50 14 45 17C46 23 53 25 59 26Z"
            fill="#81C784"
            stroke="#241909"
            strokeWidth="1.5"
          />
          {/* Tiny Golden Pollen Glow */}
          <circle cx="74" cy="12" r="3" fill="#F3B391" stroke="#241909" strokeWidth="1.5" />
        </g>

        {/* Traditional Turban / Gamcha */}
        <g filter="url(#shadowFilter)">
          {/* Base Fold */}
          <path
            d="M30 46C30 28 44 18 60 18C76 18 90 28 90 46C90 52 86 54 80 55C68 57 52 57 40 55C34 54 30 52 30 46Z"
            fill="url(#turbanGrad)"
            stroke="#241909"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Turban Wrap Folds */}
          <path
            d="M36 36C46 31 74 31 84 36"
            stroke="#241909"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M32 44C44 40 76 40 88 44"
            stroke="#241909"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Turban Knot on Left */}
          <ellipse
            cx="32"
            cy="40"
            rx="6.5"
            ry="7.5"
            fill="#F3B391"
            stroke="#241909"
            strokeWidth="2.5"
          />
          {/* Turban Hanging Tail */}
          <path
            d="M28 44C27 54 29 62 31 68C33 66 35 56 34 46"
            fill="#E89467"
            stroke="#241909"
            strokeWidth="2"
          />
        </g>

        {/* Friendly Face */}
        <ellipse
          cx="60"
          cy="66"
          rx="27"
          ry="25"
          fill="url(#faceGrad)"
          stroke="#241909"
          strokeWidth="3.2"
        />

        {/* Rosy Cheeks */}
        <ellipse cx="43" cy="71" rx="5" ry="3" fill="#F3B391" opacity="0.65" />
        <ellipse cx="77" cy="71" rx="5" ry="3" fill="#F3B391" opacity="0.65" />

        {/* Eyes & Eyebrows based on state */}
        {state === 'thinking' ? (
          <g>
            {/* Thoughtful Eyes Looking Up */}
            <circle cx="51" cy="62" r="3.5" fill="#0F1108" />
            <circle cx="69" cy="62" r="3.5" fill="#0F1108" />
            <circle cx="52" cy="61" r="1.2" fill="#FFFFFF" />
            <circle cx="70" cy="61" r="1.2" fill="#FFFFFF" />
            {/* Inquisitive Eyebrows */}
            <path d="M47 56C49 53 54 54 56 56" stroke="#241909" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M64 56C66 53 71 54 73 56" stroke="#241909" strokeWidth="2.2" strokeLinecap="round" />
            {/* Thinking Mouth (small 'o') */}
            <ellipse cx="60" cy="74" rx="2.5" ry="3.5" fill="#241909" />
          </g>
        ) : state === 'alert' ? (
          <g>
            {/* Vigilant Wide Eyes */}
            <circle cx="50" cy="63" r="4.5" fill="#0F1108" />
            <circle cx="70" cy="63" r="4.5" fill="#0F1108" />
            <circle cx="51.5" cy="61.5" r="1.6" fill="#FFFFFF" />
            <circle cx="71.5" cy="61.5" r="1.6" fill="#FFFFFF" />
            {/* Protective Alert Eyebrows */}
            <path d="M46 56C50 58 54 58 56 57" stroke="#241909" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M64 57C66 58 70 58 74 56" stroke="#241909" strokeWidth="2.5" strokeLinecap="round" />
            {/* Serious straight mouth */}
            <path d="M54 74H66" stroke="#241909" strokeWidth="2.8" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            {/* Warm Smiling Eyes (Welcoming / Reassuring) */}
            <path
              d="M46 62C48 58 53 58 55 62"
              stroke="#0F1108"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M65 62C67 58 72 58 74 62"
              stroke="#0F1108"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Friendly Warm Smile */}
            <path
              d="M51 71C54 77 66 77 69 71"
              stroke="#0F1108"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Small tongue shine */}
            <path
              d="M57 75C59 76.5 61 76.5 63 75"
              stroke="#F3B391"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Iconic Tika / Tilak on Forehead */}
        <path
          d="M60 48V54"
          stroke="#D97B49"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="60" cy="56" r="1.5" fill="#2E7D32" />

        {/* State Badge Pill on Bottom Right */}
        {state === 'thinking' && (
          <g>
            <circle cx="96" cy="94" r="12" fill="#241909" stroke="#F3B391" strokeWidth="2" />
            <path d="M96 88V100M90 94H102" stroke="#F3B391" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
        {state === 'alert' && (
          <g>
            <circle cx="96" cy="94" r="12" fill="#E65100" stroke="#FFF" strokeWidth="2" />
            <path d="M96 90V96M96 99H96.01" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}
        {state === 'welcoming' && (
          <g>
            <circle cx="96" cy="94" r="12" fill="#2E7D32" stroke="#FFF" strokeWidth="2" />
            <path d="M92 94L95 97L101 91" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default FarmarianMascot;
