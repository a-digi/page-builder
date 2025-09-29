// path: src/components/blocks/Image/Accordion.tsx
import React from 'react';

interface AccordionProps {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
  summary?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Accordion = ({ title, isOpen, onClick, children, summary, icon }: AccordionProps) => {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        <div className="flex items-center space-x-3">
          {icon}
          <span className="flex-1">{title}</span>
        </div>
        <div className="flex items-center space-x-3">
          {summary && !isOpen && <span className="text-sm font-normal text-gray-500 truncate max-w-[100px]">{summary}</span>}
          <svg
            className={`h-5 w-5 flex-shrink-0 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>
      {isOpen && <div className="p-4 bg-gray-50/50">{children}</div>}
    </div>
  );
};
