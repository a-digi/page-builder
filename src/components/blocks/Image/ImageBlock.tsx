// path: src/components/blocks/Image/ImageBlock.tsx
import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
import { useComponentContext } from '../../../hooks/useComponentContext';
import { type ComponentDefinition, type ImageComponent, type ImageComponentProps } from '../../../types/components';
import { ImageSettings, settingsIcon } from './ImageSettings';
import { filterStyles, customFilterOptions, defaultCustomFilters } from './model/settings';
import { useImageUploadContext } from './ImageUploadContext';

export const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="4" y="5" width="16" height="14" rx="2" ry="2" strokeWidth="2" />
    <circle cx="9" cy="10" r="1.5" strokeWidth="2" />
    <path d="M6 17l4.5-4.5a2 2 0 012.828 0L18 17" strokeWidth="2" />
  </svg>
);

const generateCustomFilterString = (filters: ImageComponentProps['customFilters']) => {
  if (!filters) return 'none';
  return customFilterOptions
    .map(option => {
      const value = filters[option.prop];
      if (value !== option.defaultValue) {
        return `${option.prop}(${value}${option.unit})`;
      }
      return null;
    })
    .filter(Boolean)
    .join(' ') || 'none';
};


const ImageBlock = memo(({ component }: { component: ImageComponent }) => {
  const { updateComponent, isNested } = useComponentContext();
  const { onImageSelect } = useImageUploadContext();
  const { id, props } = component;

  const [manualUrl, setManualUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ startX: number; startY: number; initialX: number; initialY: number; } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ width: number; height: number; x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = `image-upload-${id}`;

  const processFile = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    setIsUploading(true);
    if (onImageSelect) {
      try {
        const newUrl = await onImageSelect(file);
        updateComponent(id, { externalImageUrl: newUrl, url: '' });
      } catch (error) {
        console.error("External image upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const MAX_DIMENSION = 500;
          let initialWidth = img.width;
          let initialHeight = img.height;

          if (initialWidth > MAX_DIMENSION || initialHeight > MAX_DIMENSION) {
            if (img.width > img.height) {
              initialWidth = MAX_DIMENSION;
              initialHeight = (img.height / img.width) * MAX_DIMENSION;
            } else {
              initialHeight = MAX_DIMENSION;
              initialWidth = (img.width / img.height) * MAX_DIMENSION;
            }
          }

          updateComponent(id, { url: result, width: initialWidth, height: initialHeight, x: 0, y: 0, externalImageUrl: '' });
          setIsUploading(false);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  }, [id, updateComponent, onImageSelect]);

  const handleSetManualUrl = () => {
    if (manualUrl.trim() && (manualUrl.startsWith('http') || manualUrl.startsWith('/'))) {
      updateComponent(id, { externalImageUrl: manualUrl.trim(), url: '' });
      setManualUrl('');
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-gray-100');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setResizeStart({ width: props.width ?? 0, height: props.height ?? 0, x: e.clientX, y: e.clientY });
    setIsResizing(true);
  }, [props.width, props.height]);

  const handleDragMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.group')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setDragStart({ startX: e.clientX, startY: e.clientY, initialX: props.x || 0, initialY: props.y || 0 });
    setIsDragging(true);
  }, [props.x, props.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing && resizeStart) {
      const dx = e.clientX - resizeStart.x;
      const newWidth = Math.max(resizeStart.width + dx, 50);
      const aspectRatio = resizeStart.height / resizeStart.width;
      updateComponent(id, { width: newWidth, height: Math.round(newWidth * aspectRatio) });
    }

    if (isDragging && dragStart && containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (!parent) return;

      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight;
      const imageWidth = props.width ?? 0;
      const imageHeight = props.height ?? 0;

      const dx = e.clientX - dragStart.startX;
      const dy = e.clientY - dragStart.startY;

      let newX = dragStart.initialX + dx;
      let newY = dragStart.initialY + dy;

      if (isNested) {
        const maxX = parentWidth - imageWidth;
        const maxY = parentHeight - imageHeight;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
      }

      updateComponent(id, { x: newX, y: newY });
    }
  }, [isResizing, resizeStart, isDragging, dragStart, updateComponent, id, props.width, props.height, isNested]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setIsDragging(false);
    setDragStart(null);
  }, []);

  useEffect(() => {
    if (isResizing || isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isDragging, handleMouseMove, handleMouseUp]);

  const displayUrl = props.externalImageUrl || props.url;

  const containerStyles: React.CSSProperties = isNested
    ? {
      position: 'relative',
      width: props.width,
      height: props.height,
      transform: `translate(${props.x || 0}px, ${props.y || 0}px)`,
      borderRadius: props.shape === 'circle' ? '50%' : '0',
      overflow: 'hidden',
    }
    : {
      position: 'absolute',
      left: props.x || 0,
      top: props.y || 0,
      width: props.width,
      height: props.height,
      borderRadius: props.shape === 'circle' ? '50%' : '0',
      overflow: 'hidden',
    };

  const imageStyles: React.CSSProperties = {
    filter: props.filter === 'custom'
      ? generateCustomFilterString(props.customFilters)
      : (filterStyles[props.filter || 'none'] || 'none'),
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none',
  };

  return (
    <div
      ref={containerRef}
      className={`transition-colors duration-200 ${displayUrl ? 'group cursor-grab active:cursor-grabbing' : ''}`}
      style={!displayUrl ? { position: 'relative' } : containerStyles}
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-gray-100'); }}
      onDragLeave={(e) => e.currentTarget.classList.remove('bg-gray-100')}
      onDrop={handleDrop}
      onMouseDown={displayUrl ? handleDragMouseDown : undefined}
    >
      {displayUrl ? (
        <>
          <img src={displayUrl} alt={props.alt || ''} style={imageStyles} />
          <div
            onMouseDown={handleResizeMouseDown}
            className={`absolute bottom-0 right-0 z-10 cursor-nwse-resize p-2 opacity-0 transition-opacity group-hover:opacity-100 ${props.shape === 'circle' ? 'hidden' : ''}`}
            title="Resize Image"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 border-2 border-white shadow-md">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m-6 0h6v6" />
              </svg>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 p-4 h-full flex flex-col justify-center items-center">
          {isUploading ? (<p>Uploading...</p>) : (
            <>
              <p className="text-sm font-semibold">Drag & drop an image here</p>
              <p className="text-xs my-1">or</p>
              <label className="bg-blue-500 text-white rounded-md px-3 py-1.5 text-sm font-semibold cursor-pointer hover:bg-blue-600">
                Browse
                <input id={inputId} type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
              </label>
              <div className="w-full text-center mt-4">
                <p className="text-xs text-gray-400 mb-1">Or paste an image URL:</p>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSetManualUrl()}
                    placeholder="https://..."
                    className="text-xs p-1.5 border rounded-l-md w-full focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button onClick={handleSetManualUrl} className="bg-gray-200 hover:bg-gray-300 text-xs font-semibold p-[7px] rounded-r-md border border-l-0">
                    Set
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default ImageBlock;

export const imageBlockDefinition: ComponentDefinition<ImageComponent> = {
  type: 'image',
  label: 'Image',
  icon: icon,
  settingsIcon: settingsIcon,
  create: (): ImageComponent => ({
    id: Date.now(),
    type: 'image',
    props: {
      url: '',
      externalImageUrl: '',
      width: 250,
      height: 180,
      alt: '',
      x: 0,
      y: 0,
      filter: 'none',
      shape: 'rect',
      customFilters: { ...defaultCustomFilters },
    },
  }),
  Renderer: ImageBlock,
  renderSettings: ImageSettings,
};
