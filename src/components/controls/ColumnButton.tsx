// path: src/components/page-builder/components/controls/ColumnButton.tsx
import React from 'react';

type Props = {
  onClick: () => void;
};

export const ColumnButton: React.FC<Props> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="pb-p-1.5 pb-text-gray-500 pb-hover:bg-gray-100 pb-hover:text-blue-600 pb-rounded-md"
    title="Column settings"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="pb-h-5 pb-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16v16H4V4zm6 0v16" />
    </svg>
  </button>
);
