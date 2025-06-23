
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
      {/* Briefcase */}
      <path
        d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Prohibition Sign - Red Circle with Diagonal Slash */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="#DC2626"
        strokeWidth="2"
        opacity="0.9"
      />
      <path
        d="M6 6l12 12"
        stroke="#DC2626"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
};

export default NotCorporateLogo;
