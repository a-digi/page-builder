// path: src/components/controls/DragHandle.tsx
import React from 'react';

type Props = {
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  className?: string;
};

export const DragHandle = ({ onDragStart, onDragEnd, className }: Props) => {
  const baseClasses = 'pb-p-1.5 pb-rounded-md pb-cursor-grab pb-active:cursor-grabbing';
  const defaultColorClasses = 'pb-text-gray-400 pb-hover:bg-gray-100 pb-hover:text-gray-700';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`${baseClasses} ${className || defaultColorClasses}`}
      title="Drag to move"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className='pb-h-5 pb-w-5'>
        <circle cx="2.5" cy="2.5" r="1.5" fill="currentColor" />
        <circle cx="9.5" cy="2.5" r="1.5" fill="currentColor" />
        <circle cx="2.5" cy="9.5" r="1.5" fill="currentColor" />
        <circle cx="9.5" cy="9.5" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
};
