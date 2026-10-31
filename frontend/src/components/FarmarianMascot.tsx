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
  size = 36,
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={`Farmarian — AgroShield Assistant (${state})`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Clean geometric badge container */}
        <rect width="40" height="40" rx="8" fill="#1E472D" />

        {/* Headwrap silhouette */}
        <path
          d="M12 18C12 13 15.5 10 20 10C24.5 10 28 13 28 18C28 19.5 27 20.5 25 21C22 21.5 18 21.5 15 21C13 20.5 12 19.5 12 18Z"
          fill="#C27847"
        />
        {/* Botanical sprout */}
        <path
          d="M20 10C20 6.5 22.5 5 25 5.5C25 8 22.5 9.5 20 10Z"
          fill="#86B390"
        />

        {/* Face contour */}
        <circle cx="20" cy="24" r="8" fill="#F8F7F4" />

        {/* Eyes based on state */}
        {state === 'alert' ? (
          <g fill="#1A211B">
            <circle cx="17.5" cy="23.5" r="1.3" />
            <circle cx="22.5" cy="23.5" r="1.3" />
            <path d="M16 21H19M21 21H24" stroke="#1A211B" strokeWidth="1" strokeLinecap="round" />
            <circle cx="33" cy="7" r="3" fill="#9E2A2B" />
          </g>
        ) : state === 'thinking' ? (
          <g fill="#1A211B">
            <circle cx="17.5" cy="22.5" r="1.1" />
            <circle cx="22.5" cy="22.5" r="1.1" />
            <circle cx="33" cy="7" r="3" fill="#C27847" />
          </g>
        ) : (
          <g stroke="#1A211B" strokeWidth="1.2" strokeLinecap="round">
            <path d="M16.5 23.5C17 22.5 18 22.5 18.5 23.5" />
            <path d="M21.5 23.5C22 22.5 23 22.5 23.5 23.5" />
            <path d="M18 27C19 28 21 28 22 27" />
            <circle cx="33" cy="7" r="3" fill="#276738" stroke="none" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default FarmarianMascot;
