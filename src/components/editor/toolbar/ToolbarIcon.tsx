// path: src/components/editor/toolbar/ToolbarIcon.tsx
import React from 'react';

type IconName = 'text-left' | 'text-center' | 'text-right' | 'text-justify';

const ICONS: Record<IconName, React.ReactNode> = {
  'text-left': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M3 10h12M3 14h18M3 18h8" />,
  'text-center': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M6 10h12M3 14h18M6 18h12" />,
  'text-right': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M9 10h12M3 14h18M13 18h8" />,
  'text-justify': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M3 10h18M3 14h18M3 18h18" />,
};

interface ToolbarIconProps {
  icon: IconName;
  className?: string;
}

export const ToolbarIcon: React.FC<ToolbarIconProps> = ({ icon, className = 'pb-w-5 pb-h-5' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {ICONS[icon]}
    </svg>
  );
};
