// path: src/components/controls/AccordionItem.tsx
import React from 'react';

const AccordionItem: React.FC<{
  title: string;
  isOpen: boolean;
  onClick: () => void;
  summary?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, isOpen, onClick, summary, children }) => (
  <div className="border-b border-gray-200 bg-white">
    <button
      onClick={onClick}
      className="flex items-center cursor-pointer justify-between w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none"
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-800">{title}</span>
        {!isOpen && summary && (
          <div className="text-xs text-gray-500 mt-0.5">{summary}</div>
        )}
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
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
      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[30rem]' : 'max-h-0'}`}
    >
      <div className="px-4 py-4 bg-gray-50/50 border-t border-gray-200">{children}</div>
    </div>
  </div>
);

export default AccordionItem;
