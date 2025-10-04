// path: src/components/blocks/Parallax/PositionedItem.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useComponentContext } from '../../../hooks/useComponentContext';
import type { PageComponent } from '../../../types/components';
import { ComponentRenderer } from '../../editor/ComponentRenderer';
import { BlockWrapper } from '../../BlockWrapper';

interface PositionedItemProps {
  component: PageComponent<any, any>;
  onPositionChange: (newPosition: { x: number; y: number }) => void;
  onSizeChange: (newSize: { width: number; height: number }) => void;
  onLayerChange: (direction: 'front' | 'back') => void;
  isInteractive: boolean;
}

const MIN_SIZE = 50;

export const PositionedItem: React.FC<PositionedItemProps> = ({ component, onPositionChange, onSizeChange, onLayerChange, isInteractive }) => {
  const { readOnly, isPreviewing } = useComponentContext();
  const isEditingDisabled = readOnly || isPreviewing;

  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const resizeStartRef = useRef<{ width: number; height: number; x: number; y: number } | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number; } | null>(null);
  const { x = 0, y = 0, width = 250, height = 150, zIndex = 1 } = component.props;
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing && resizeStartRef.current) { const dx = e.clientX - resizeStartRef.current.x, dy = e.clientY - resizeStartRef.current.y, newWidth = Math.max(MIN_SIZE, resizeStartRef.current.width + dx), newHeight = Math.max(MIN_SIZE, resizeStartRef.current.height + dy); onSizeChange({ width: newWidth, height: newHeight }); }
    if (isDragging && dragStartRef.current) { const dx = e.clientX - dragStartRef.current.startX, dy = e.clientY - dragStartRef.current.startY, newX = dragStartRef.current.initialX + dx, newY = dragStartRef.current.initialY + dy; onPositionChange({ x: newX, y: newY }); }
  }, [isResizing, isDragging, onPositionChange, onSizeChange]);
  const handleMouseUp = useCallback(() => { setIsResizing(false); setIsDragging(false); document.body.style.cursor = ''; document.body.style.userSelect = ''; }, []);
  useEffect(() => {
    if (isDragging || isResizing) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);
  const handleResizeMouseDown = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); document.body.style.cursor = 'nwse-resize'; setIsResizing(true); resizeStartRef.current = { width, height, x: e.clientX, y: e.clientY }; };
  const handleDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); document.body.style.cursor = 'grabbing'; document.body.style.userSelect = 'none'; setIsDragging(true); dragStartRef.current = { startX: e.clientX, startY: e.clientY, initialX: x, initialY: y }; };

  const isInteracting = isDragging || isResizing;
  const showBorder = !isEditingDisabled && isInteractive && (isHovered || isInteracting);

  return (
    <div
      style={{ top: y, left: x, width, height, position: 'absolute', zIndex }}
      onMouseEnter={() => !isEditingDisabled && isInteractive && setIsHovered(true)}
      onMouseLeave={() => !isEditingDisabled && isInteractive && setIsHovered(false)}
      className="pb-group/item"
    >
      <div className={`pb-relative pb-w-full pb-h-full pb-border-2 pb-transition-shadow pb-duration-200 ${showBorder ? 'pb-border-blue-500 pb-shadow-lg' : 'pb-border-transparent'}`} >
        <BlockWrapper
          component={component}
          onDragStart={() => { }}
          hideDragHandle={true}
          controlsPosition="top-right"
          forceHideControls={isInteracting}
        >
          <ComponentRenderer component={component} />
        </BlockWrapper>
      </div>
      {!isEditingDisabled && isInteractive && (isHovered || isInteracting) && (
        <>
          <div onMouseDown={handleDragMouseDown} className="pb-absolute pb--top-2 pb--left-2 pb-z-30 pb-p-1.5 pb-rounded-full pb-bg-blue-500 pb-border-2 pb-border-white pb-shadow-md pb-cursor-grab pb-active:cursor-grabbing pb-text-white" title="Move">
            <svg className="pb-w-3 pb-h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 4a1 1 0 011 1v1.586l1.707-1.707a1 1 0 011.414 1.414L12.414 8h1.586a1 1 0 110 2h-1.586l1.707 1.707a1 1 0 01-1.414 1.414L11 11.586V13a1 1 0 11-2 0v-1.414l-1.707 1.707a1 1 0 01-1.414-1.414L7.586 10H6a1 1 0 110-2h1.586L5.879 6.293a1 1 0 011.414-1.414L9 6.586V5a1 1 0 011-1z" /></svg>
          </div>

          <div onMouseDown={handleResizeMouseDown} className="pb-absolute pb--bottom-2 pb--right-2 pb-z-30 pb-w-5 pb-h-5 pb-rounded-full pb-bg-blue-500 pb-border-2 pb-border-white pb-shadow-md pb-cursor-nwse-resize" title="Resize" />

          {isHovered && !isInteracting && (
            <div className="pb-absolute pb--bottom-2 pb--left-2 pb-z-30 pb-flex pb-bg-white pb-rounded-full pb-shadow-md">
              <button onClick={() => onLayerChange('back')} title="Send to Back" className="pb-p-1.5 pb-hover:bg-gray-100 pb-rounded-l-full pb-text-gray-600"><svg className="pb-w-4 pb-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
              <button onClick={() => onLayerChange('front')} title="Bring to Front" className="pb-p-1.5 pb-hover:bg-gray-100 pb-rounded-r-full pb-text-gray-600"><svg className="pb-w-4 pb-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg></button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
