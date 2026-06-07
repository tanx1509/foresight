import React from 'react';

interface ForesightLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export default function ForesightLogo({ className = "", size = 24, color = "currentColor" }: ForesightLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Shield representing Governance */}
      <path 
        d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Inner Signal Path representing Telemetry/Memory */}
      <path 
        d="M12 7V13" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Forward Vector representing Prediction/Simulation */}
      <path 
        d="M8 13L12 17L16 13" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="12" cy="7" r="1" fill={color} />
    </svg>
  );
}
