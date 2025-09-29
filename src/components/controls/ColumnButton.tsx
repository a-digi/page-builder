// path: src/components/controls/ColumnButton.tsx
import React from 'react';

type Props = {
  onClick: () => void;
};

export const ColumnButton: React.FC<Props> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-md"
    title="Column settings"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16v16H4V4zm6 0v16" />
    </svg>
  </button>
);
