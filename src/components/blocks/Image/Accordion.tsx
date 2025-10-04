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
    <div className="pb-border-b pb-border-gray-200">
      <button
        onClick={onClick}
        className="pb-flex pb-w-full pb-items-center pb-justify-between pb-p-4 pb-text-left pb-text-sm pb-font-medium pb-text-gray-700 pb-hover:bg-gray-50 pb-focus:outline-none"
      >
        <div className="pb-flex pb-items-center pb-space-x-3">
          {icon}
          <span className="pb-flex-1">{title}</span>
        </div>
        <div className="pb-flex pb-items-center pb-space-x-3">
          {summary && !isOpen && <span className="pb-text-sm pb-font-normal pb-text-gray-500 pb-truncate pb-max-w-[100px]">{summary}</span>}
          <svg
            className={`pb-h-5 pb-w-5 pb-flex-shrink-0 pb-text-gray-400 pb-transform pb-transition-transform pb-duration-200 ${isOpen ? 'pb-rotate-180' : ''}`}
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
      {isOpen && <div className="pb-p-4 pb-bg-gray-50/50">{children}</div>}
    </div>
  );
};
