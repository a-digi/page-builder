// path: src/components/controls/SettingsPanel.tsx
import React, { useState, useRef, useMemo, useLayoutEffect, useCallback, useEffect } from 'react';
import { useComponentContext } from '../../hooks/useComponentContext';
import { type PageComponent, type CustomButton, type BaseComponentProps } from '../../types/components';
import AccordionItem from './AccordionItem';
import { useSettingsPanelContext } from '../../contexts/SettingsPanelContext';

interface SettingsPanelProps {
  component: PageComponent<any, any>;
  children?: React.ReactNode;
  style: React.CSSProperties;
  customHeaderButtons?: CustomButton<PageComponent<any, any>>[];
  showContainerSettings?: boolean;
  title?: string;
  settingsOnly?: boolean;
  onUpdate?: (props: Partial<BaseComponentProps>) => void;
  width?: number;
  height?: number;
}

const MIN_WIDTH = 250;
const MIN_HEIGHT = 400;

const DockLeftIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className || "w-4 h-4"}>
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </g>
  </svg>
);

const DockRightIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className || "w-4 h-4"}>
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </g>
  </svg>
);

const FloatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className || "w-4 h-4"}>
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M4 16V4h12" />
    </g>
  </svg>
);

const IndividualSpacingInput: React.FC<{
  label: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center space-x-2">
    <label htmlFor={`spacing-${label.toLowerCase()}`} className="w-12 text-xs text-gray-600">{label}</label>
    <input
      id={`spacing-${label.toLowerCase()}`}
      type="number"
      min="0"
      step="0.25"
      placeholder="-"
      value={value ?? ''}
      onChange={onChange}
      className="w-full p-2 border rounded text-xs"
    />
  </div>
);

export const SettingsPanel = (props: SettingsPanelProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const {
    component,
    children,
    style,
    settingsOnly,
    customHeaderButtons,
    showContainerSettings = true,
    title = 'Settings',
    onUpdate,
    width: initialWidth = 300,
    height: initialHeight = 400,
    ref,
  } = props;

  const contextUpdateComponent = useComponentContext().updateComponent;
  const { dockedPosition, setDockedPosition } = useSettingsPanelContext();

  const bgColorInputRef = useRef<HTMLInputElement>(null);
  const textColorInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizingEdge = useRef<'bottom-right' | 'left' | 'right' | null>(null);

  const floatingStateRef = useRef({ size, offset });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number; } | null>(null);

  const handleToggleSection = (section: string) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  const hasComponentTab = !!children;
  const hasContainerTab = showContainerSettings;
  const showTabs = hasComponentTab && hasContainerTab;

  const initialTab = hasComponentTab ? 'component' : 'container';
  const [activeTab, setActiveTab] = useState<'component' | 'container'>(initialTab);

  const handleDock = (position: 'left' | 'right' | null) => {
    if (position !== null && dockedPosition === null) {
      floatingStateRef.current = { size, offset };
    }
    setDockedPosition(position);

    if (position === null && dockedPosition !== null) {
      setSize(floatingStateRef.current.size);
      setOffset(floatingStateRef.current.offset);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dockedPosition !== null) return;
    if ((e.target as HTMLElement).closest('button, [data-resizer="true"]')) {
      return;
    }
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    e.preventDefault();
  }, [offset, dockedPosition]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizingEdge.current = e.currentTarget.dataset.resizeEdge as typeof resizingEdge.current;
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };
  }, [size]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && dockedPosition === null) {
      const initialTop = parseFloat(style.top as string) || 0;
      const initialLeft = parseFloat(style.left as string) || 0;
      let finalX = (e.clientX - dragStartPos.current.x) + initialLeft;
      let finalY = (e.clientY - dragStartPos.current.y) + initialTop;

      if (finalX < 0) finalX = 0;
      if (finalX + size.width > window.innerWidth) finalX = window.innerWidth - size.width;
      if (finalY < 0) finalY = 0;
      if (finalY + size.height > window.innerHeight) finalY = window.innerHeight - size.height;

      setOffset({ x: finalX - initialLeft, y: finalY - initialTop });

    } else if (isResizing && resizeStartRef.current) {
      const dx = e.clientX - resizeStartRef.current.startX;
      const dy = e.clientY - resizeStartRef.current.startY;
      let newWidth = size.width;
      let newHeight = size.height;

      if (resizingEdge.current === 'bottom-right') {
        newWidth = Math.max(MIN_WIDTH, resizeStartRef.current.startWidth + dx);
        newHeight = Math.max(MIN_HEIGHT, resizeStartRef.current.startHeight + dy);
      } else if (resizingEdge.current === 'right') {
        newWidth = Math.max(MIN_WIDTH, resizeStartRef.current.startWidth + dx);
      } else if (resizingEdge.current === 'left') {
        newWidth = Math.max(MIN_WIDTH, resizeStartRef.current.startWidth - dx);
        setOffset(prev => ({ ...prev, x: prev.x + (size.width - newWidth) }));
      }
      setSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, size, style, dockedPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    resizingEdge.current = null;
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
    setSize({ width: initialWidth, height: initialHeight });
  }, [component.id, initialWidth, initialHeight]);

  const finalStyle = useMemo<React.CSSProperties>(() => {
    if (dockedPosition !== null) {
      return {
        position: 'fixed',
        top: 0,
        left: dockedPosition === 'left' ? 0 : 'auto',
        right: dockedPosition === 'right' ? 0 : 'auto',
        width: `${size.width}px`,
        height: '100vh',
        transform: 'none',
        userSelect: isResizing ? 'none' : 'auto',
      };
    }

    const initialTop = parseFloat(style.top as string) || 0;
    const initialLeft = parseFloat(style.left as string) || 0;
    return {
      ...style,
      width: `${size.width}px`,
      height: `${size.height}px`,
      top: `${initialTop + offset.y}px`,
      left: `${initialLeft + offset.x}px`,
      userSelect: isDragging || isResizing ? 'none' : 'auto',
    };
  }, [style, offset, size, isDragging, isResizing, dockedPosition]);

  const allPaddingValue = useMemo(() => {
    const { paddingTop, paddingRight, paddingBottom, paddingLeft, containerPadding } = component.props;
    if (containerPadding !== undefined && containerPadding !== null) {
      if (paddingTop === undefined && paddingRight === undefined && paddingBottom === undefined && paddingLeft === undefined) {
        return containerPadding;
      }
    }
    const paddings = [paddingTop, paddingRight, paddingBottom, paddingLeft];
    const firstDefinedPadding = paddings.find(p => p !== undefined && p !== null);
    if (firstDefinedPadding === undefined) return '';
    if (firstDefinedPadding !== 0 && paddings.every(p => p === firstDefinedPadding)) return firstDefinedPadding;

    return '';
  }, [component.props]);

  const allMarginValue = useMemo(() => {
    const { marginTop, marginRight, marginBottom, marginLeft, containerMargin } = component.props;
    if (containerMargin !== undefined && containerMargin !== null) {
      if (marginTop === undefined && marginRight === undefined && marginBottom === undefined && marginLeft === undefined) {
        return containerMargin;
      }
    }
    const margins = [marginTop, marginRight, marginBottom, marginLeft];
    const firstDefinedMargin = margins.find(m => m !== undefined && m !== null);
    if (firstDefinedMargin === undefined) return '';
    if (firstDefinedMargin !== 0 && margins.every(m => m === firstDefinedMargin)) return firstDefinedMargin;
    return '';
  }, [component.props]);

  const showIndividualPaddings = allPaddingValue === '';
  const showIndividualMargins = allMarginValue === '';

  const handleUpdate = (newProps: Partial<BaseComponentProps>) => {
    const newPropsWithoutOld = { ...newProps };
    if (Object.keys(newProps).some(k => k.startsWith('padding'))) {
      newPropsWithoutOld.containerPadding = undefined;
    }
    if (Object.keys(newProps).some(k => k.startsWith('margin'))) {
      newPropsWithoutOld.containerMargin = undefined;
    }
    if (onUpdate) {
      onUpdate(newPropsWithoutOld);
    } else {
      contextUpdateComponent(component.id, newPropsWithoutOld);
    }
  };

  const renderedCustomButtons = useMemo(() => customHeaderButtons
    ?.filter((button) => !button.shouldShow || button.shouldShow(component))
    .map((button) => (
      <button
        key={button.id}
        onClick={() => button.onClick(component)}
        className={`p-1 rounded-md ${button.className || 'text-gray-500 hover:text-blue-600'}`}
        title={button.tooltip}
      >
        {button.icon}
      </button>
    )), [customHeaderButtons, component]);

  const getTabClass = (tabName: 'component' | 'container') => {
    return activeTab === tabName
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  };

  const isBgColorSet = !!component.props.containerBackgroundColor;
  const isTextColorSet = !!component.props.textColor;

  const legacyPadding = component.props.containerPadding;
  const legacyMargin = component.props.containerMargin;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1;
    setIsScrolledToBottom(atBottom);
  }, []);

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const overflowing = el.scrollHeight > el.clientHeight;
      setIsOverflowing(overflowing);
      const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1;
      setIsScrolledToBottom(atBottom);
    }
  }, [children, activeTab, showIndividualPaddings, showIndividualMargins, openSection, size, dockedPosition]);

  const containerSettingsNode = (
    <div className="text-sm">
      <AccordionItem
        title="Spacing" isOpen={openSection === 'spacing'} onClick={() => handleToggleSection('spacing')}
        summary={<span className="truncate max-w-[200px]">{`P: ${allPaddingValue !== '' ? allPaddingValue : 'Mixed'} / M: ${allMarginValue !== '' ? allMarginValue : 'Mixed'}`}</span>}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Padding (rem)</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <label htmlFor="padding-all" className="w-12 text-xs text-gray-600">All</label>
                <input id="padding-all" type="number" min="0" step="0.25" placeholder="Mixed" value={allPaddingValue} onChange={e => { const v = parseFloat(e.target.value); const fv = isNaN(v) ? undefined : v; handleUpdate({ paddingTop: fv, paddingRight: fv, paddingBottom: fv, paddingLeft: fv }); }} className="w-full p-2 border rounded text-xs" />
              </div>
              {showIndividualPaddings && <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                <IndividualSpacingInput label="Top" value={component.props.paddingTop ?? legacyPadding} onChange={(e) => handleUpdate({ paddingTop: parseFloat(e.target.value) || 0 })} />
                <IndividualSpacingInput label="Bottom" value={component.props.paddingBottom ?? legacyPadding} onChange={(e) => handleUpdate({ paddingBottom: parseFloat(e.target.value) || 0 })} />
                <IndividualSpacingInput label="Left" value={component.props.paddingLeft ?? legacyPadding} onChange={(e) => handleUpdate({ paddingLeft: parseFloat(e.target.value) || 0 })} />
                <IndividualSpacingInput label="Right" value={component.props.paddingRight ?? legacyPadding} onChange={(e) => handleUpdate({ marginRight: parseFloat(e.target.value) || 0 })} />
              </div>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Margin (rem)</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <label htmlFor="margin-all" className="w-12 text-xs text-gray-600">All</label>
                <input id="margin-all" type="number" min="0" step="0.25" placeholder="Mixed" value={allMarginValue} onChange={e => { const v = parseFloat(e.target.value); const fv = isNaN(v) ? undefined : v; handleUpdate({ marginTop: fv, marginRight: fv, marginBottom: fv, marginLeft: fv }); }} className="w-full p-2 border rounded text-xs" />
              </div>
              {showIndividualMargins && <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                <IndividualSpacingInput label="Top" value={component.props.marginTop ?? legacyMargin} onChange={(e) => handleUpdate({ marginTop: parseFloat(e.target.value) || 0 })} />
                <IndividualSpacingInput label="Bottom" value={component.props.marginBottom ?? legacyMargin} onChange={(e) => handleUpdate({ marginBottom: parseFloat(e.target.value) || 0 })} />
                <IndividualSpacingInput label="Left" value={component.props.marginLeft ?? legacyMargin} onChange={(e) => handleUpdate({ marginLeft: parseFloat(e.target.value) || 0 })} />
                <IndividualSpacingInput label="Right" value={component.props.marginRight ?? legacyMargin} onChange={(e) => handleUpdate({ marginRight: parseFloat(e.target.value) || 0 })} />
              </div>}
            </div>
          </div>
        </div>
      </AccordionItem>
      <AccordionItem
        title="Appearance" isOpen={openSection === 'appearance'} onClick={() => handleToggleSection('appearance')}
        summary={<div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-sm border border-gray-300" style={{ backgroundColor: component.props.containerBackgroundColor || 'transparent' }}></div>
          <div className="text-gray-900 font-bold" style={{ color: component.props.textColor || 'inherit' }}>Aa</div>
        </div>}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
            <div className="flex items-center space-x-2">
              <input ref={bgColorInputRef} type="color" value={component.props.containerBackgroundColor || '#ffffff'} onChange={(e) => handleUpdate({ containerBackgroundColor: e.target.value })} className="sr-only" />
              <button type="button" onClick={() => bgColorInputRef.current?.click()} className="relative w-8 h-8 border border-gray-300 rounded-sm cursor-pointer" style={{ backgroundColor: isBgColorSet ? component.props.containerBackgroundColor : '#fff' }} title="Select background color">
                {!isBgColorSet && (<svg className="absolute inset-0 w-full h-full text-red-500" fill="none" viewBox="0 0 100 100"><line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="10" /></svg>)}
              </button>
              <span className="text-xs text-gray-500">{component.props.containerBackgroundColor || 'None'}</span>
              {isBgColorSet && (<button onClick={() => handleUpdate({ containerBackgroundColor: undefined })} className="text-xs text-blue-600 hover:underline">Clear</button>)}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
            <div className="flex items-center space-x-2">
              <input ref={textColorInputRef} type="color" value={component.props.textColor || '#000000'} onChange={(e) => handleUpdate({ textColor: e.target.value })} className="sr-only" />
              <button type="button" onClick={() => textColorInputRef.current?.click()} className="relative w-8 h-8 border border-gray-300 rounded-sm cursor-pointer" style={{ backgroundColor: isTextColorSet ? component.props.textColor : '#fff' }} title="Select text color">
                {!isTextColorSet && (<svg className="absolute inset-0 w-full h-full text-red-500" fill="none" viewBox="0 0 100 100"><line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="10" /></svg>)}
              </button>
              <span className="text-xs text-gray-500">{component.props.textColor || 'Inherit'}</span>
              {isTextColorSet && (<button onClick={() => handleUpdate({ textColor: undefined })} className="text-xs text-blue-600 hover:underline">Clear</button>)}
            </div>
          </div>
        </div>
      </AccordionItem>
      <AccordionItem title="Layout" isOpen={openSection === 'layout'} onClick={() => handleToggleSection('layout')} summary={`Full Height: ${component.props.fullHeight ? 'On' : 'Off'}`}>
        <div className="relative flex items-start">
          <div className="flex items-center h-5">
            <input id="full-height" aria-describedby="full-height-description" name="full-height" type="checkbox" checked={!!component.props.fullHeight} onChange={(e) => handleUpdate({ fullHeight: e.target.checked })} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
          </div>
          <div className="ml-3 text-sm"><label htmlFor="full-height" className="font-medium text-gray-700">Full Height</label></div>
        </div>
      </AccordionItem>
      <AccordionItem
        title="Advanced" isOpen={openSection === 'advanced'} onClick={() => handleToggleSection('advanced')}
        summary={<span className="truncate max-w-[200px]">{component.props.containerClasses || component.props.containerStyles ? 'Custom styles applied' : 'None'}</span>}
      >
        <div className="space-y-4"><div><label className="block text-xs font-medium text-gray-500 mb-1">Custom Classes</label><input type="text" placeholder="e.g., p-4 shadow-lg" value={component.props.containerClasses || ''} onChange={(e) => handleUpdate({ containerClasses: e.target.value })} className="w-full p-2 border rounded text-xs" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Custom Styles</label><textarea placeholder={'e.g., background-color: #f0f0f0;'} value={component.props.containerStyles || ''} onChange={(e) => handleUpdate({ containerStyles: e.target.value })} className="w-full p-2 border rounded text-xs font-mono" rows={3} /></div>
        </div>
      </AccordionItem>
    </div>
  );

  if (settingsOnly) {
    return <>{containerSettingsNode}</>
  };

  return (
    <div
      ref={ref}
      className={`fixed z-[999] bg-white shadow-2xl border border-gray-200 flex flex-col ${dockedPosition === null ? 'rounded-lg' : ''}`}
      style={finalStyle}
    >
      <div
        onMouseDown={handleMouseDown}
        className={`px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0 ${dockedPosition === null ? 'cursor-move' : ''}`}
      >
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center space-x-1">
          {renderedCustomButtons}
          {renderedCustomButtons && renderedCustomButtons.length > 0 &&
            <div className="w-px h-5 bg-gray-300 mx-2" />
          }
          <button title="Dock to left" onClick={() => handleDock('left')} className={`p-1 rounded ${dockedPosition === 'left' ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-700'}`}>
            <DockLeftIcon />
          </button>
          <button title="Dock to right" onClick={() => handleDock('right')} className={`p-1 rounded ${dockedPosition === 'right' ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-700'}`}>
            <DockRightIcon />
          </button>
          <button title="Float panel" onClick={() => handleDock(null)} className={`p-1 rounded ${dockedPosition === null ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-700'}`}>
            <FloatIcon />
          </button>
        </div>
      </div>

      <div className='relative flex-grow flex flex-col overflow-hidden'>
        {showTabs && (
          <div className="border-b border-gray-200 flex-shrink-0">
            <nav className="-mb-px flex space-x-4 px-4" aria-label="Tabs">
              {hasComponentTab && (<button onClick={() => setActiveTab('component')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${getTabClass('component')}`}>{component.type.charAt(0).toUpperCase() + component.type.slice(1)}</button>)}
              <button onClick={() => setActiveTab('container')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${getTabClass('container')}`}>Container</button>
            </nav>
          </div>
        )}
        <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-grow overflow-y-auto">
          {hasComponentTab && (!showTabs || activeTab === 'component') && (<div className="space-y-4 text-sm p-4">{children}</div>)}
          {hasContainerTab && (!showTabs || activeTab === 'container') && (<div className="p-4">{containerSettingsNode}</div>)}
        </div>
        {isOverflowing && !isScrolledToBottom && (
          <div className="absolute bottom-2 right-8 box-border pointer-events-none h-7 w-7 rounded-[50%] bg-white/50 backdrop-blur-sm shadow-sm flex items-center justify-center animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" /></svg>
          </div>
        )}
      </div>

      {dockedPosition === null && (
        <div data-resizer="true" data-resize-edge="bottom-right" onMouseDown={handleResizeMouseDown} className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize" title="Resize">
          <svg className="w-full h-full text-gray-400" fill="none" viewBox="0 0 10 10"><path stroke="currentColor" strokeWidth="1.5" d="M 0 10 L 10 0 M 4 10 L 10 4 M 7 10 L 10 7"></path></svg>
        </div>
      )}
      {dockedPosition === 'left' && (
        <div data-resizer="true" data-resize-edge="right" onMouseDown={handleResizeMouseDown} className="absolute top-0 bottom-0 right-0 w-2 cursor-col-resize" title="Resize"></div>
      )}
      {dockedPosition === 'right' && (
        <div data-resizer="true" data-resize-edge="left" onMouseDown={handleResizeMouseDown} className="absolute top-0 bottom-0 left-0 w-2 cursor-col-resize" title="Resize"></div>
      )}
    </div>
  );
};