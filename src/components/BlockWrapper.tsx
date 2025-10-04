// path: src/components/BlockWrapper.tsx
import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { type PageComponent, type CustomButton } from '../types/components';
import { useComponentContext } from '../hooks/useComponentContext';
import { DragHandle } from './controls/DragHandle';
import { SettingsButton } from './controls/SettingsButton';
import { DeleteButton } from './controls/DeleteButton';
import { SettingsPanel } from './controls/SettingsPanel';
import { useComponentRegistry } from '../contexts/ComponentRegistry';

const parseStyles = (styleString: string): React.CSSProperties => {
  try {
    const style: React.CSSProperties = {};
    styleString.split(';').forEach(rule => {
      const [key, value] = rule.split(':');
      if (key && value) {
        const camelCaseKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        style[camelCaseKey as keyof React.CSSProperties] = value.trim() as any;
      }
    });
    return style;
  } catch (error) {
    return {};
  }
};

export const dataBlockIdAttr = 'data-block-id';

export interface BlockWrapperProps<C extends PageComponent<any, any>> {
  component: C;
  children: React.ReactNode;
  onDragStart: (e: React.DragEvent) => void;
  showSettings?: boolean;
  controlsPosition?: 'top' | 'side' | 'side-left' | 'top-right' | 'top-left' | 'side-left-top-vertical' | 'side-right-top-vertical';
  customToolbarButtons?: CustomButton<C>[];
  customSettingsButtons?: CustomButton<C>[];
  hideDragHandle?: boolean;
  forceHideControls?: boolean;
}

export function BlockWrapper<C extends PageComponent<any, any>>({
  component,
  children,
  onDragStart,
  showSettings = true,
  controlsPosition = 'side-left-top-vertical',
  customToolbarButtons,
  customSettingsButtons,
  hideDragHandle = false,
  forceHideControls = false,
}: BlockWrapperProps<C>) {
  const {
    updateComponent,
    deleteComponent,
    readOnly,
    setIsDragging,
    isPreviewing,
    activeSettingsComponentId,
    setActiveSettingsComponentId,
  } = useComponentContext();

  const isEditingDisabled = readOnly || isPreviewing;
  const registry = useComponentRegistry();

  const isSettingsOpen = activeSettingsComponentId === component.id;

  const settingsRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [toolbarStyle, setToolbarStyle] = useState<React.CSSProperties>({ opacity: 0, pointerEvents: 'none' });

  const definition = useMemo(() => registry.getDefinition(component.type), [registry, component.type]);
  const renderCustomControls = definition?.renderCustomControls;
  const renderSettings = definition?.renderSettings;

  const containerStyle = useMemo(() => {
    const newStyle: React.CSSProperties = parseStyles(component.props.containerStyles || '');
    const {
      paddingTop, paddingRight, paddingBottom, paddingLeft,
      marginTop, marginRight, marginBottom, marginLeft,
      containerBackgroundColor, textColor
    } = component.props;

    if (paddingTop) newStyle.paddingTop = `${paddingTop}rem`;
    if (paddingRight) newStyle.paddingRight = `${paddingRight}rem`;
    if (paddingBottom) newStyle.paddingBottom = `${paddingBottom}rem`;
    if (paddingLeft) newStyle.paddingLeft = `${paddingLeft}rem`;
    if (marginTop) newStyle.marginTop = `${marginTop}rem`;
    if (marginRight) newStyle.marginRight = `${marginRight}rem`;
    if (marginBottom) newStyle.marginBottom = `${marginBottom}rem`;
    if (marginLeft) newStyle.marginLeft = `${marginLeft}rem`;
    if (containerBackgroundColor) newStyle.backgroundColor = containerBackgroundColor;
    if (textColor) newStyle.color = textColor;

    return newStyle;
  }, [
    component.props.containerStyles,
    component.props.paddingTop, component.props.paddingRight, component.props.paddingBottom, component.props.paddingLeft,
    component.props.marginTop, component.props.marginRight, component.props.marginBottom, component.props.marginLeft,
    component.props.containerBackgroundColor, component.props.textColor
  ]);

  const updatePanelPosition = useCallback(() => {
    if (panelRef.current && settingsRef.current) {
      const panel = panelRef.current;
      const trigger = settingsRef.current;
      const panelRect = panel.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const margin = 8;
      let top: number;
      let left: number;


      if (controlsPosition === 'side-right-top-vertical') {
        top = triggerRect.top;
        if (top + panelRect.height + margin > vh) { top = vh - panelRect.height - margin; }
        top = Math.max(margin, top);
        left = triggerRect.left - panelRect.width - margin;
        left = Math.max(margin, left);
      } else if (controlsPosition === 'side-left-top-vertical') {
        top = triggerRect.top;
        if (top + panelRect.height + margin > vh) { top = vh - panelRect.height - margin; }
        top = Math.max(margin, top);
        left = triggerRect.right + margin;
        if (left + panelRect.width + margin > vw) { left = vw - panelRect.width - margin; }
        left = Math.max(margin, left);
      } else {
        if (triggerRect.bottom + panelRect.height + margin < vh) { top = triggerRect.bottom + 2; }
        else { top = triggerRect.top - panelRect.height - 2; }
        top = Math.max(margin, Math.min(top, vh - panelRect.height - margin));
        const idealLeft = triggerRect.right - panelRect.width;
        if (idealLeft < margin) { left = margin; }
        else if (idealLeft + panelRect.width > vw - margin) { left = vw - panelRect.width - margin; }
        else { left = idealLeft; }
      }
      setPanelStyle({ position: 'fixed', top: `${top}px`, left: `${left}px`, visibility: 'visible' });
    }
  }, [controlsPosition]);

  useLayoutEffect(() => {
    if (isSettingsOpen) updatePanelPosition();
    else setPanelStyle({ visibility: 'hidden' });
  }, [isSettingsOpen, updatePanelPosition]);

  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleScrollOrResize = () => window.requestAnimationFrame(updatePanelPosition);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isSettingsOpen, updatePanelPosition]);

  const updateToolbarPosition = useCallback(() => {
    if (wrapperRef.current) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const isInView = wrapperRect.bottom > 0 && wrapperRect.top < window.innerHeight;
      if (!isInView) {
        setToolbarStyle(s => ({ ...s, opacity: 0, pointerEvents: 'none' }));
        return;
      }
      let newStyle: React.CSSProperties = {
        position: 'fixed', opacity: 1, transition: 'opacity 150ms ease-in-out', zIndex: 998, pointerEvents: 'auto',
      };
      switch (controlsPosition) {
        case 'side-left-top-vertical': newStyle.top = `${wrapperRect.top}px`; newStyle.left = `${wrapperRect.left - 8}px`; newStyle.transform = 'translateX(-100%)'; break;
        case 'side-right-top-vertical': newStyle.top = `${wrapperRect.top}px`; newStyle.left = `${wrapperRect.right + 8}px`; break;
        case 'side-left': newStyle.top = `${wrapperRect.top + wrapperRect.height / 2}px`; newStyle.left = `${wrapperRect.left - 8}px`; newStyle.transform = `translate(-100%, -50%)`; break;
        case 'top-left': newStyle.top = `${wrapperRect.top}px`; newStyle.left = `${wrapperRect.left}px`; newStyle.transform = `translateY(-110%)`; break;
        case 'top-right': newStyle.top = `${wrapperRect.top}px`; newStyle.left = `${wrapperRect.right}px`; newStyle.transform = `translate(-100%, -110%)`; break;
        case 'side': newStyle.top = `${wrapperRect.top + wrapperRect.height / 2}px`; newStyle.left = `${wrapperRect.right + 8}px`; newStyle.transform = `translateY(-50%)`; break;
        default: newStyle.top = `${wrapperRect.top}px`; newStyle.left = `${wrapperRect.left}px`; newStyle.transform = `translateY(-50%)`; break;
      }
      setToolbarStyle(newStyle);
    }
  }, [controlsPosition]);

  useEffect(() => {
    const shouldBeVisible = !isEditingDisabled && !forceHideControls && (isSettingsOpen || (activeSettingsComponentId === null && isHovered));

    if (shouldBeVisible) {
      requestAnimationFrame(updateToolbarPosition);
      const listener = () => requestAnimationFrame(updateToolbarPosition);
      window.addEventListener('scroll', listener, true);
      window.addEventListener('resize', listener);
      return () => {
        window.removeEventListener('scroll', listener, true);
        window.removeEventListener('resize', listener);
      };
    } else {
      setToolbarStyle(s => ({ ...s, opacity: 0, pointerEvents: 'none' }));
    }
  }, [isHovered, isSettingsOpen, activeSettingsComponentId, updateToolbarPosition, forceHideControls, isEditingDisabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setActiveSettingsComponentId(null);
      }
    };
    if (isSettingsOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen, setActiveSettingsComponentId]);

  useEffect(() => {
    return () => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); };
  }, []);

  const handleMouseEnter = () => {
    if (isEditingDisabled) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isEditingDisabled) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const toggleSettings = () => {
    setActiveSettingsComponentId(isSettingsOpen ? null : component.id);
  };

  const isVerticalLayout = controlsPosition === 'side-left-top-vertical' || controlsPosition === 'side-right-top-vertical';

  const renderedCustomToolbarButtons = useMemo(() => {
    if (!customToolbarButtons || customToolbarButtons.length === 0) return null;
    const visibleButtons = customToolbarButtons.filter(button => !button.shouldShow || button.shouldShow(component));
    if (visibleButtons.length === 0) return null;

    const defaultButtonClass = isSettingsOpen
      ? 'pb-text-white pb-hover:bg-gray-700'
      : 'pb-text-gray-500 pb-hover:bg-gray-100 pb-hover:text-blue-600';

    return visibleButtons.map((button) => (
      <button key={button.id} onClick={() => button.onClick(component)} className={`pb-p-1.5 pb-rounded-md ${button.className || defaultButtonClass}`} title={button.tooltip}>
        {button.icon}
      </button>
    ));
  }, [customToolbarButtons, component, isSettingsOpen]);

  const combinedClasses = [
    'pb-w-full pb-h-full pb-relative',
    readOnly && 'pb-read-only-wrapper',
    component.props.containerClasses,
    component.props.fullHeight ? 'pb-h-full' : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  const activeToolbarButtonClasses = 'pb-text-white pb-hover:bg-gray-700';

  const dragHandleClasses = isSettingsOpen ? activeToolbarButtonClasses : 'pb-text-gray-400 pb-hover:bg-gray-100 pb-hover:text-gray-700';
  const settingsButtonClasses = isSettingsOpen ? activeToolbarButtonClasses : 'pb-text-gray-500 pb-hover:bg-gray-100 pb-hover:text-blue-600';
  const deleteButtonClasses = isSettingsOpen ? activeToolbarButtonClasses : 'pb-text-red-500 pb-hover:bg-red-100 pb-hover:text-red-600';

  const separatorClasses = isSettingsOpen ? 'pb-bg-gray-600' : 'pb-bg-gray-200';
  const Separator = isVerticalLayout
    ? <div className={`pb-h-px pb-w-full pb-my-1 ${separatorClasses}`}></div>
    : <div className={`pb-w-px pb-h-5 pb-mx-1 ${separatorClasses}`}></div>;

  const toolbarContainerClasses = [
    'pb-flex', 'pb-items-center', 'pb-rounded-lg', 'pb-shadow-md', 'pb-p-1', 'pb-transition-colors', 'pb-duration-200',
    isSettingsOpen ? 'pb-bg-gray-800' : 'pb-bg-white',
    isVerticalLayout ? 'pb-flex-col pb-space-y-0.5' : 'pb-space-x-0.5'
  ].join(' ');


  const ToolbarControls = (
    <div ref={settingsRef} className="pb-relative pb-w-max">
      <div className={toolbarContainerClasses}>
        {!hideDragHandle && <DragHandle onDragStart={onDragStart} onDragEnd={handleDragEnd} className={dragHandleClasses} />}

        {renderedCustomToolbarButtons && (
          <>
            {renderedCustomToolbarButtons}
            {!hideDragHandle && Separator}
          </>
        )}

        {showSettings && (
          definition?.settingsIcon ? (
            <button onClick={toggleSettings} className={`pb-p-1.5 pb-rounded-md pb-cursor-pointer ${settingsButtonClasses}`} title="Settings">
              {definition.settingsIcon}
            </button>
          ) : (<SettingsButton onClick={toggleSettings} className={settingsButtonClasses} />)
        )}

        {renderCustomControls && renderCustomControls(component as any)}

        {Separator}

        <DeleteButton onClick={() => deleteComponent(component.id)} className={deleteButtonClasses} />
      </div>
    </div>
  );

  const renderPanel = (
    <SettingsPanel ref={panelRef} component={component} style={panelStyle} customHeaderButtons={customSettingsButtons as CustomButton<PageComponent<any, any>>[] | undefined}>
      {renderSettings && renderSettings({ component: component, updateComponent })}
    </SettingsPanel>
  );

  return (
    <div
      ref={wrapperRef}
      data-block-id={component.id}
      className={combinedClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!isEditingDisabled && createPortal(
        <div style={toolbarStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {ToolbarControls}
        </div>,
        document.body
      )}

      <div className={`pb-w-full pb-h-full`} style={containerStyle}>
        {children}
      </div>
      {!isEditingDisabled && isSettingsOpen && renderPanel}
    </div>
  );
}
