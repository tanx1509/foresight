import React from "react";

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
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="26" height="24" rx="5" fill={color} opacity="0.12" />
      <path
        d="M16 5.5L25.5 9.8V15.2C25.5 21.35 21.46 26.1 16 27.5C10.54 26.1 6.5 21.35 6.5 15.2V9.8L16 5.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 16C12.1 12.8 14 11.2 16 11.2C18 11.2 19.9 12.8 21.5 16C19.9 19.2 18 20.8 16 20.8C14 20.8 12.1 19.2 10.5 16Z"
        fill="white"
        stroke={color}
        strokeWidth="1.5"
      />
      <circle cx="16" cy="16" r="2.2" fill={color} />
      <path d="M16 9V6.8M22.3 16H25M16 23V25.2M7 16H9.7" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
