// path: src/components/controls/AccordionItem.tsx
import React from 'react';

const AccordionItem: React.FC<{
  title: string;
  isOpen: boolean;
  onClick: () => void;
  summary?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, isOpen, onClick, summary, children }) => (
  <div className="pb-border-b pb-border-gray-200 pb-bg-white">
    <button
      onClick={onClick}
      className="pb-flex pb-items-center pb-cursor-pointer pb-justify-between pb-w-full pb-px-4 pb-py-3 pb-text-left pb-hover:bg-gray-50 pb-focus:outline-none"
    >
      <div className="pb-flex pb-flex-col">
        <span className="pb-text-sm pb-font-medium pb-text-gray-800">{title}</span>
        {!isOpen && summary && (
          <div className="pb-text-xs pb-text-gray-500 pb-mt-0.5">{summary}</div>
        )}
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`pb-h-5 pb-w-5 pb-text-gray-500 pb-transform pb-transition-transform pb-duration-200 ${isOpen ? 'pb-rotate-180' : 'pb-rotate-0'}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
    <div
      className={`pb-overflow-hidden pb-transition-all pb-duration-300 pb-ease-in-out ${isOpen ? 'pb-max-h-[30rem]' : 'pb-max-h-0'}`}
    >
      <div className="pb-px-4 pb-py-4 pb-bg-gray-50/50 pb-border-t pb-border-gray-200">{children}</div>
    </div>
  </div>
);

export default AccordionItem;
