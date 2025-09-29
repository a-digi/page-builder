// path: src/components/blocks/Image/CropModal.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface CropModalProps {
  imageUrl: string;
  onClose: () => void;
  onCrop: (croppedImageUrl: string) => void;
  initialShape?: 'rect' | 'circle';
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type ResizeHandle = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export const CropModal = ({ imageUrl, onClose, onCrop, initialShape = 'rect' }: CropModalProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<CropArea>({ x: 10, y: 10, width: 80, height: 80 });
  const [cropShape, setCropShape] = useState<'rect' | 'circle'>(initialShape);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0 });
  const [resizeStart, setResizeStart] = useState<{ x: number, y: number, crop: CropArea, handle: ResizeHandle } | null>(null);

  const handleDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent dragging when a resize handle is clicked
    if ((e.target as HTMLElement).dataset.resizeHandle) {
      return;
    }
    e.preventDefault();
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDragStart({ x, y, cropX: crop.x, cropY: crop.y });
    setIsDragging(true);
  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, handle: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, crop, handle });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();

    if (isDragging) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      setCrop(prev => ({
        ...prev,
        x: Math.max(0, Math.min(dragStart.cropX + dx, 100 - prev.width)),
        y: Math.max(0, Math.min(dragStart.cropY + dy, 100 - prev.height)),
      }));
    } else if (isResizing && resizeStart) {
      const dx = ((e.clientX - resizeStart.x) / rect.width) * 100;
      const dy = ((e.clientY - resizeStart.y) / rect.height) * 100;

      let { x, y, width, height } = resizeStart.crop;
      const minSize = 10;

      switch (resizeStart.handle) {
        case 'topLeft':
          width -= dx;
          height -= dy;
          x += dx;
          y += dy;
          break;
        case 'topRight':
          width += dx;
          height -= dy;
          y += dy;
          break;
        case 'bottomLeft':
          width -= dx;
          height += dy;
          x += dx;
          break;
        case 'bottomRight':
          width += dx;
          height += dy;
          break;
      }

      if (width < minSize) { width = minSize; x = resizeStart.crop.x; }
      if (height < minSize) { height = minSize; y = resizeStart.crop.y; }

      if (x < 0) { width += x; x = 0; }
      if (y < 0) { height += y; y = 0; }

      if (x + width > 100) { width = 100 - x; }
      if (y + height > 100) { height = 100 - y; }

      setCrop({ x, y, width, height });
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp, { once: true });
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleApplyCrop = () => {
    if (!imageRef.current || !canvasRef.current) return;

    const image = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = (crop.x / 100) * image.width * scaleX;
    const cropY = (crop.y / 100) * image.height * scaleY;
    const cropWidth = (crop.width / 100) * image.width * scaleX;
    const cropHeight = (crop.height / 100) * image.height * scaleY;

    if (cropShape === 'circle') {
      const size = Math.min(cropWidth, cropHeight);
      canvas.width = size;
      canvas.height = size;
      const sourceX = cropX + (cropWidth - size) / 2;
      const sourceY = cropY + (cropHeight - size) / 2;

      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.clip();
      ctx.drawImage(image, sourceX, sourceY, size, size, 0, 0, size, size);
    } else {
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    }

    onCrop(canvas.toDataURL('image/png'));
  };

  const ResizeHandle = ({ handle, cursor }: { handle: ResizeHandle; cursor: string; }) => (
    <div
      data-resize-handle={handle}
      onMouseDown={(e) => handleResizeMouseDown(e, handle)}
      className={`absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full ${cursor}`}
      style={{
        ...handle.includes('top') && { top: '-8px' },
        ...handle.includes('bottom') && { bottom: '-8px' },
        ...handle.includes('left') && { left: '-8px' },
        ...handle.includes('right') && { right: '-8px' },
      }}
    />
  );

  const modalContent = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-75" onMouseDown={onClose}>
      <div
        className="bg-white rounded-lg flex flex-col max-w-4xl w-full max-h-[90vh] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold p-4 border-b">Crop Image</h2>
        <div className="flex-grow p-4 flex justify-center items-center overflow-auto">
          <div className="relative inline-block">
            <img ref={imageRef} src={imageUrl} alt="Crop preview" className="max-w-full max-h-[65vh] block select-none" />
            <div
              className="absolute border-2 border-dashed border-white cursor-move"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                borderRadius: cropShape === 'circle' ? '50%' : '0%',
              }}
              onMouseDown={handleDragMouseDown}
            >
              <ResizeHandle handle="topLeft" cursor="cursor-nwse-resize" />
              <ResizeHandle handle="topRight" cursor="cursor-nesw-resize" />
              <ResizeHandle handle="bottomLeft" cursor="cursor-nesw-resize" />
              <ResizeHandle handle="bottomRight" cursor="cursor-nwse-resize" />
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="p-4 flex justify-between items-center space-x-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex items-center p-1 bg-gray-200 rounded-lg">
            <button
              onClick={() => setCropShape('rect')}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${cropShape === 'rect'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'bg-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Rectangle
            </button>
            <button
              onClick={() => setCropShape('circle')}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${cropShape === 'circle'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'bg-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Circle
            </button>
          </div>
          <div className="flex space-x-4">
            <button onClick={onClose} className="px-5 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300">
              Cancel
            </button>
            <button onClick={handleApplyCrop} className="px-5 py-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600">
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
