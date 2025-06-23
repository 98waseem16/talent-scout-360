
import React from 'react';

interface NotCorporateLogoProps {
  size?: number;
  className?: string;
}

const NotCorporateLogo: React.FC<NotCorporateLogoProps> = ({ 
  size = 24, 
  className = "" 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24"
      className={className}
    >
      {/* Briefcase - Uses currentColor for theme compatibility */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <rect x="4" y="8" width="16" height="9" rx="2" ry="2"/>
        <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <path d="M12 13h.01"/>
        <path d="M4 12.5c2.5 1.5 13.5 1.5 16 0"/>
      </g>
      
      {/* Prohibition Sign - Always red for brand consistency */}
      <circle cx="12" cy="12" r="10" fill="none" stroke="#DC2626" strokeWidth="2"/>
      <line x1="7" y1="7" x2="17" y2="17" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
};

export default NotCorporateLogo;
