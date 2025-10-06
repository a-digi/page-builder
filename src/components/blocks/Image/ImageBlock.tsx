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
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ startX: number; startY: number; initialX: number; initialY: number; } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ width: number; height: number; x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = `image-upload-${id}`;

  const processImageResult = useCallback((result: string) => {
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
    img.onerror = () => {
      console.error("Error loading image from data URL.");
      setIsUploading(false);
      updateComponent(id, { url: '', externalImageUrl: '' });
    };
    img.src = result;
  }, [id, updateComponent]);

  useEffect(() => {
    if (!props.externalImageUrl || isFetchingUrl) {
      return;
    }

    const urlToFetch = props.externalImageUrl;

    const fetchAndConvertImage = async () => {
      setIsFetchingUrl(true);
      setIsUploading(true);

      const handleError = (error: any) => {
        console.error("Error processing image from URL:", error);
        updateComponent(id, { externalImageUrl: '' });
        setIsUploading(false);
        setIsFetchingUrl(false);
      };

      try {
        const response = await fetch(urlToFetch);
        if (!response.ok) {
          throw new Error(`Failed to fetch image. Status: ${response.status}`);
        }
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
          throw new Error('Fetched file is not an image');
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          processImageResult(result);
          setIsFetchingUrl(false);
        };
        reader.onerror = () => handleError('FileReader failed to read blob.');
        reader.readAsDataURL(blob);
      } catch (error) {
        handleError(error);
      }
    };

    fetchAndConvertImage();
  }, [props.externalImageUrl, isFetchingUrl, id, updateComponent, processImageResult]);

  const processFile = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    setIsUploading(true);
    if (onImageSelect) {
      try {
        const newUrl = await onImageSelect(file);
        updateComponent(id, { externalImageUrl: newUrl, url: '' });
      } catch (error) {
        console.error("External image upload failed:", error);
        setIsUploading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        processImageResult(result);
      };
      reader.onerror = () => {
        console.error('FileReader failed to read file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  }, [id, updateComponent, onImageSelect, processImageResult]);

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
    e.currentTarget.classList.remove('pb-bg-gray-100');
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

  const displayUrl = props.url;

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
      className={`pb-transition-colors pb-duration-200 ${displayUrl ? 'pb-group pb-cursor-grab pb-active:cursor-grabbing' : ''}`}
      style={!displayUrl ? { position: 'relative' } : containerStyles}
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('pb-bg-gray-100'); }}
      onDragLeave={(e) => e.currentTarget.classList.remove('pb-bg-gray-100')}
      onDrop={handleDrop}
      onMouseDown={displayUrl ? handleDragMouseDown : undefined}
    >
      {displayUrl ? (
        <>
          <img src={displayUrl} alt={props.alt || ''} style={imageStyles} />
          <div
            onMouseDown={handleResizeMouseDown}
            className={`pb-absolute pb-bottom-0 pb-right-0 pb-z-10 pb-cursor-nwse-resize pb-p-2 pb-opacity-0 pb-transition-opacity pb-group-hover:opacity-100 ${props.shape === 'circle' ? 'pb-hidden' : ''}`}
            title="Resize Image"
          >
            <div className="pb-flex pb-h-5 pb-w-5 pb-items-center pb-justify-center pb-rounded-full pb-bg-blue-500 pb-border-2 pb-border-white pb-shadow-md">
              <svg className="pb-h-3 pb-w-3 pb-text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m-6 0h6v6" />
              </svg>
            </div>
          </div>
        </>
      ) : (
        <div className="pb-text-center pb-text-gray-500 pb-p-4 pb-h-full pb-flex pb-flex-col pb-justify-center pb-items-center">
          {isUploading ? (<p>Uploading...</p>) : (
            <>
              <p className="pb-text-sm pb-font-semibold">Drag & drop an image here</p>
              <p className="pb-text-xs pb-my-1">or</p>
              <label className="pb-bg-blue-500 pb-text-white pb-rounded-md pb-px-3 pb-py-1.5 pb-text-sm pb-font-semibold pb-cursor-pointer pb-hover:bg-blue-600">
                Browse
                <input id={inputId} type="file" onChange={handleFileChange} accept="image/*" className="pb-hidden" />
              </label>
              <div className="pb-w-full pb-text-center pb-mt-4">
                <p className="pb-text-xs pb-text-gray-400 pb-mb-1">Or paste an image URL:</p>
                <div className="pb-flex pb-items-center">
                  <input
                    type="text"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSetManualUrl()}
                    placeholder="https://..."
                    className="pb-text-xs pb-p-1.5 pb-border pb-rounded-l-md pb-w-full pb-focus:ring-1 pb-focus:ring-blue-500 pb-focus:outline-none"
                  />
                  <button onClick={handleSetManualUrl} className="pb-bg-gray-200 pb-hover:bg-gray-300 pb-text-xs pb-font-semibold pb-p-[7px] pb-rounded-r-md pb-border pb-border-l-0">
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