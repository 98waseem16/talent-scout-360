
import React from 'react';
import { cn } from '@/lib/utils';

interface NotCorporateLogoProps {
  className?: string;
  size?: number;
}

const NotCorporateLogo: React.FC<NotCorporateLogoProps> = ({ 
  className, 
  size = 16 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("inline-block", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simple Briefcase */}
      <rect
        x="6"
        y="8"
        width="12"
        height="8"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Briefcase Handle */}
      <path
        d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Briefcase Lock/Detail */}
      <rect
        x="11"
        y="11"
        width="2"
        height="2"
        fill="currentColor"
      />
      
      {/* Prohibition Sign - Smaller and positioned bottom-right */}
      <circle
        cx="17"
        cy="17"
        r="4.5"
        fill="#DC2626"
        opacity="0.95"
      />
      
      {/* Diagonal Slash */}
      <path
        d="M14.5 14.5l5 5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default NotCorporateLogo;
