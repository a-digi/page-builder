// path: src/components/blocks/Image/CropModal.tsx
import React, { useState, useRef, useEffect, useCallback, useReducer } from 'react';

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
  const [isShapeDropdownOpen, setIsShapeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [zoom, setZoom] = useState(1);

  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0 });
  const [resizeStart, setResizeStart] = useState<{ x: number, y: number, crop: CropArea, handle: ResizeHandle } | null>(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);


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
    window.addEventListener('resize', forceUpdate);
    return () => {
      window.removeEventListener('resize', forceUpdate);
    };
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShapeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleApplyCrop = () => {
    if (!imageRef.current || !canvasRef.current) return;

    const image = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / (image.width / zoom);
    const scaleY = image.naturalHeight / (image.height / zoom);

    const cropX = (crop.x / 100) * (image.width / zoom) * scaleX;
    const cropY = (crop.y / 100) * (image.height / zoom) * scaleY;
    const cropWidth = (crop.width / 100) * (image.width / zoom) * scaleX;
    const cropHeight = (crop.height / 100) * (image.height / zoom) * scaleY;

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

  const handleShapeChange = (shape: 'rect' | 'circle') => {
    setCropShape(shape);
    setIsShapeDropdownOpen(false);
  };

  const ResizeHandle = ({ handle, cursor }: { handle: ResizeHandle; cursor: string; }) => (
    <div
      data-resize-handle={handle}
      onMouseDown={(e) => handleResizeMouseDown(e, handle)}
      className={`pb-absolute pb-w-4 pb-h-4 pb-bg-white pb-border-2 pb-border-blue-500 pb-rounded-full ${cursor}`}
      style={{
        ...handle.includes('top') && { top: '-8px' },
        ...handle.includes('bottom') && { bottom: '-8px' },
        ...handle.includes('left') && { left: '-8px' },
        ...handle.includes('right') && { right: '-8px' },
      }}
    />
  );

  return (
    <div
      className="pb-fixed pb-z-[1000] pb-left-0 pb-top-0 pb-right-0 pb-bottom-0 pb-flex"
      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="pb-flex-grow pb-p-4 pb-flex pb-justify-center pb-items-center pb-overflow-auto pb-bg-gray-100">
        <div className="pb-relative pb-inline-flex pb-justify-center pb-items-center pb-max-w-lg" style={{ zoom: zoom }}>
          <img ref={imageRef} src={imageUrl} alt="Crop preview" className="pb-max-w-full pb-max-h-full pb-block pb-select-none" />
          <div
            className="pb-absolute pb-border-2 pb-border-dashed pb-border-white pb-cursor-move"
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.width}%`,
              height: `${crop.height}%`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              borderRadius: cropShape === 'circle' ? '50%' : '0%',
            }}
            onMouseDown={handleDragMouseDown}
          >
            <ResizeHandle handle="topLeft" cursor="pb-cursor-nwse-resize" />
            <ResizeHandle handle="topRight" cursor="pb-cursor-nesw-resize" />
            <ResizeHandle handle="bottomLeft" cursor="pb-cursor-nesw-resize" />
            <ResizeHandle handle="bottomRight" cursor="pb-cursor-nwse-resize" />
          </div>
        </div>
      </div>

      <div className="pb-w-80 pb-flex-shrink-0 pb-flex pb-flex-col pb-p-6 pb-bg-white pb-border-l pb-border-gray-200">
        <h2 className="pb-text-xl pb-font-semibold pb-text-gray-800 pb-mb-8">Crop Image</h2>

        <div className="pb-mb-6">
          <label htmlFor="options-menu" className="pb-block pb-text-sm pb-font-medium pb-text-gray-700 pb-mb-2">Crop Shape:</label>
          <div ref={dropdownRef} className="pb-relative pb-inline-block pb-text-left pb-w-full">
            <div>
              <span className="pb-rounded-md pb-shadow-sm">
                <button
                  type="button"
                  onClick={() => setIsShapeDropdownOpen(!isShapeDropdownOpen)}
                  className="pb-inline-flex pb-justify-between pb-items-center pb-w-full pb-rounded-md pb-px-4 pb-py-2 pb-bg-white pb-border pb-border-gray-300 pb-text-sm pb-font-medium pb-text-gray-700 pb-hover:bg-gray-50 focus:pb-outline-none focus:pb-ring-2 focus:pb-ring-offset-2 focus:pb-ring-offset-gray-100 focus:pb-ring-blue-500"
                  id="options-menu"
                  aria-haspopup="true"
                  aria-expanded="true"
                >
                  {cropShape.charAt(0).toUpperCase() + cropShape.slice(1)}
                  <svg className="pb-h-5 pb-w-5 pb-text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            </div>
            {isShapeDropdownOpen && (
              <div className="pb-origin-top-right pb-absolute pb-right-0 pb-mt-2 pb-w-full pb-rounded-md pb-shadow-lg pb-bg-white pb-ring-1 pb-ring-black pb-ring-opacity-5 z-10">
                <div className="pb-py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleShapeChange('rect'); }}
                    className="pb-block pb-px-4 pb-py-2 pb-text-sm pb-text-gray-700 pb-hover:bg-gray-100 pb-hover:text-gray-900"
                    role="menuitem"
                  >
                    Rectangle
                  </a>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleShapeChange('circle'); }}
                    className="pb-block pb-px-4 pb-py-2 pb-text-sm pb-text-gray-700 pb-hover:bg-gray-100 pb-hover:text-gray-900"
                    role="menuitem"
                  >
                    Circle
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pb-mb-6">
          <label className="pb-block pb-text-sm pb-font-medium pb-text-gray-700 pb-mb-2">Zoom</label>
          <div className="pb-flex pb-items-center pb-space-x-2">
            <button onClick={handleZoomOut} className="pb-p-2 pb-rounded-md pb-bg-gray-200 pb-hover:bg-gray-300">
              <svg className="pb-w-5 pb-h-5 pb-text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
            </button>
            <button onClick={handleZoomIn} className="pb-p-2 pb-rounded-md pb-bg-gray-200 pb-hover:bg-gray-300">
              <svg className="pb-w-5 pb-h-5 pb-text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
        </div>

        <div className="pb-mt-auto">
          <div className="pb-flex pb-flex-col pb-space-y-3">
            <button onClick={handleApplyCrop} className="pb-w-full pb-px-5 pb-py-2 pb-rounded-md pb-bg-blue-500 pb-text-white pb-font-semibold pb-hover:bg-blue-600">
              Apply Crop
            </button>
            <button onClick={onClose} className="pb-w-full pb-px-5 pb-py-2 pb-rounded-md pb-bg-gray-200 pb-text-gray-800 pb-font-semibold pb-hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="pb-hidden" />
    </div>
  );
};