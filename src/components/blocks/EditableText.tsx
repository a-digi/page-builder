// path: src/components/blocks/EditableText.tsx
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import type { TextComponent, HeaderComponent, TextProps } from '../../types/components';
import { useComponentContext } from '../../hooks/useComponentContext';
import EditorToolbar from '../editor/toolbar/EditorToolbar';
import type { ComponentDefinition } from '../../contexts/ComponentRegistry';

export const TextIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 7h14M5 12h10M5 17h14"
    />
  </svg>
);

export const HeadingIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5v14" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 5v14" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
  </svg>
);

const effects: Record<string, { name: string; classes: string }> = {
  'none': { name: 'None', classes: '' },
  'fade-in': { name: 'Fade In', classes: 'pb-opacity-0' },
  'fade-in-up': { name: 'Fade In Up', classes: 'pb-opacity-0 pb-translate-y-5' },
  'fade-in-down': { name: 'Fade In Down', classes: 'pb-opacity-0 pb--translate-y-5' },
  'fade-in-left': { name: 'Fade In Left', classes: 'pb-opacity-0 pb--translate-x-5' },
  'fade-in-right': { name: 'Fade In Right', classes: 'pb-opacity-0 pb-translate-x-5' },
  'zoom-in': { name: 'Zoom In', classes: 'pb-opacity-0 pb-scale-90' },
  'zoom-out': { name: 'Zoom Out', classes: 'pb-opacity-0 pb-scale-110' },
};

const useIntersectionObserver = (
  elementRef: React.RefObject<Element | null>,
  { threshold = 0.1, root = null, rootMargin = '0px', triggerOnce = true }
): boolean => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    // The logic inside the hook already correctly handles the null case.
    if (!elementRef.current) return;

    observer.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        if (triggerOnce && observer.current) {
          observer.current.unobserve(entry.target);
        }
      }
    }, { threshold, root, rootMargin });

    observer.current.observe(elementRef.current);

    return () => {
      observer.current?.disconnect();
    };
  }, [elementRef, threshold, root, rootMargin, triggerOnce]);

  return isIntersecting;
};


const applyStyleToSelection = (styleCallback: (element: HTMLElement) => void) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);
  const documentFragment = range.extractContents();
  const wrapper = document.createElement('span');
  Array.from(documentFragment.childNodes).forEach(node => {
    const el = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : document.createElement('span').appendChild(node).parentNode!;
    styleCallback(el as HTMLElement);
    wrapper.appendChild(el);
  });
  range.insertNode(wrapper);
  while (wrapper.firstChild) {
    wrapper.parentNode?.insertBefore(wrapper.firstChild, wrapper);
  }
  wrapper.parentNode?.removeChild(wrapper);
  range.commonAncestorContainer.parentNode?.normalize();
  selection.removeAllRanges();
  selection.addRange(range);
};

interface EditableTextProps {
  component: TextComponent | HeaderComponent;
}

const EditableText = memo(({ component }: EditableTextProps) => {
  const { updateComponent, isPreviewing } = useComponentContext();
  const { id, props, type } = component;
  const contentRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [manualPosition, setManualPosition] = useState<{ top: number; left: number } | null>(null);

  const [selectionState, setSelectionState] = useState({
    isBold: false, isItalic: false, isUnderlined: false, isLink: false,
    textAlign: props.textAlign || 'left', textSize: props.textSize || 16,
    fontFamily: props.fontFamily || 'sans-serif', lineHeight: 1.5, color: '#000000',
  });

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [animationClasses, setAnimationClasses] = useState('');

  const isVisibleOnScroll = useIntersectionObserver(wrapperRef, { threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (isPreviewing) {
      const effect = props.textEffect;
      if (effect && effect !== 'none') {
        const initialClasses = effects[effect].classes;
        const finalClasses = 'pb-opacity-100 pb-translate-y-0 pb-translate-x-0 pb-scale-100';
        const transition = 'pb-transition-all pb-duration-1000 pb-ease-out';

        setAnimationClasses(isVisibleOnScroll ? `${transition} ${finalClasses}` : initialClasses);
      } else {
        setAnimationClasses('');
      }
    }
  }, [isPreviewing, props.textEffect, isVisibleOnScroll]);

  useEffect(() => {
    if (!isPreviewing) {
      const effect = props.textEffect;
      if (effect && effect !== 'none') {
        const initialClasses = effects[effect].classes;
        const finalClasses = 'pb-opacity-100 pb-translate-y-0 pb-translate-x-0 pb-scale-100';
        const transition = 'pb-transition-all pb-duration-1000 pb-ease-out';

        setAnimationClasses(initialClasses);

        const timer = setTimeout(() => {
          setAnimationClasses(`${transition} ${finalClasses}`);
        }, 50);

        return () => clearTimeout(timer);
      } else {
        setAnimationClasses('');
      }
    }
  }, [isPreviewing, props.textEffect, id]);

  const handleUpdate = useCallback((newProps: Partial<TextProps>) => { updateComponent(id, newProps); }, [id, updateComponent]);
  const handleInput = useCallback(() => { if (contentRef.current) { handleUpdate({ content: contentRef.current.innerHTML }); } }, [handleUpdate]);
  const updateToolbar = useCallback(() => { const selection = window.getSelection(); if (!selection || selection.rangeCount === 0 || !contentRef.current) { if (!showLinkInput) setShowToolbar(false); return; } const range = selection.getRangeAt(0); if (!contentRef.current.contains(range.commonAncestorContainer)) { if (!showLinkInput) setShowToolbar(false); return; } const shouldShow = showLinkInput || !selection.isCollapsed; setShowToolbar(shouldShow); if (!shouldShow) return; const parentElement = (range.startContainer.nodeType === Node.TEXT_NODE ? range.startContainer.parentElement : range.startContainer) as HTMLElement | null; const linkNode = parentElement?.closest('a'); const computedStyle = parentElement ? window.getComputedStyle(parentElement) : null; setSelectionState({ isBold: document.queryCommandState('bold'), isItalic: document.queryCommandState('italic'), isUnderlined: document.queryCommandState('underline'), isLink: !!linkNode, textAlign: computedStyle?.textAlign as any || 'left', textSize: Math.round(parseFloat(computedStyle?.fontSize || `${props.textSize || 16}`)), fontFamily: computedStyle?.fontFamily.split(',')[0].replace(/"/g, '').trim() || props.fontFamily || 'sans-serif', lineHeight: parseFloat(computedStyle?.lineHeight || '1.5'), color: computedStyle?.color || '#000000', }); setLinkUrl(linkNode?.href || ''); if (!manualPosition && !showLinkInput) { const rect = range.getBoundingClientRect(); if (rect.width === 0 && rect.height === 0 && rect.x === 0 && rect.y === 0) { setShowToolbar(false); return; } setToolbarPosition({ top: rect.top + window.scrollY - 45, left: rect.left + window.scrollX + (rect.width / 2) }); } }, [manualPosition, showLinkInput, props.textSize, props.fontFamily]);
  useEffect(() => { const handleSelectionChange = () => { if (document.activeElement === contentRef.current) { updateToolbar(); } }; document.addEventListener('selectionchange', handleSelectionChange); return () => { document.removeEventListener('selectionchange', handleSelectionChange); }; }, [updateToolbar]);
  const restoreSelection = () => { if (!savedRangeRef.current) return; const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(savedRangeRef.current); savedRangeRef.current = null; };
  const applyBasicStyle = (command: 'bold' | 'italic' | 'underline') => { document.execCommand(command, false); handleInput(); updateToolbar(); contentRef.current?.focus(); };
  const applyColor = (color: string) => { applyStyleToSelection(span => { span.style.color = color; }); handleInput(); updateToolbar(); contentRef.current?.focus(); };
  const applyAlignment = (align: 'left' | 'center' | 'right' | 'justify') => { const commandMap = { left: 'justifyLeft', center: 'justifyCenter', right: 'justifyRight', justify: 'justifyFull' }; document.execCommand(commandMap[align], false); handleUpdate({ textAlign: align }); updateToolbar(); contentRef.current?.focus(); };
  const applyFontSize = (size: number) => { applyStyleToSelection(span => { span.style.fontSize = `${size}px`; }); handleInput(); updateToolbar(); contentRef.current?.focus(); };
  const applyFontFamily = (font: string) => { applyStyleToSelection(span => { span.style.fontFamily = font; }); handleUpdate({ fontFamily: font }); handleInput(); updateToolbar(); contentRef.current?.focus(); };
  const applyLineHeight = (height: number) => { applyStyleToSelection(span => { span.style.lineHeight = String(height); }); handleInput(); updateToolbar(); contentRef.current?.focus(); };
  const handleToggleLink = () => { const selection = window.getSelection(); if (selection && selection.rangeCount > 0) savedRangeRef.current = selection.getRangeAt(0).cloneRange(); setShowLinkInput(true); };
  const handleConfirmLink = (url: string) => { restoreSelection(); contentRef.current?.focus(); if (url) document.execCommand('createLink', false, url); setShowLinkInput(false); handleInput(); updateToolbar(); };
  const handleUnlink = () => { restoreSelection(); contentRef.current?.focus(); document.execCommand('unlink', false); setShowLinkInput(false); handleInput(); updateToolbar(); };
  const handleCloseLinkInput = () => { setShowLinkInput(false); restoreSelection(); contentRef.current?.focus(); };
  const handleClearFormatting = () => { document.execCommand('removeFormat', false); document.execCommand('unlink', false); document.execCommand('justifyLeft', false); const selection = window.getSelection(); if (!selection || !selection.rangeCount || !contentRef.current) return; const range = selection.getRangeAt(0); const nodesToUnwrap = Array.from(contentRef.current.querySelectorAll('span, font, b, i, u, a')).filter(el => range.intersectsNode(el)); nodesToUnwrap.reverse().forEach(node => { const parent = node.parentNode; if (parent) { while (node.firstChild) { parent.insertBefore(node.firstChild, node); } parent.removeChild(node); } }); contentRef.current.normalize(); handleUpdate({ textAlign: 'left', fontFamily: type === 'heading' ? 'sans-serif' : 'sans-serif', textSize: type === 'heading' ? 16 : 12 }); handleInput(); updateToolbar(); contentRef.current?.focus(); };
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => { if ((e.target as HTMLElement).closest('button, select, input') || showLinkInput) return; e.preventDefault(); setIsDragging(true); const toolbarRect = e.currentTarget.getBoundingClientRect(); const syncedPosition = { top: toolbarRect.top + window.scrollY, left: toolbarRect.left + window.scrollX }; setToolbarPosition(syncedPosition); setManualPosition(syncedPosition); dragOffsetRef.current = { x: e.clientX - toolbarRect.left, y: e.clientY - toolbarRect.top }; };
  useEffect(() => { const handleDragMove = (e: MouseEvent) => { if (!isDragging) return; setManualPosition({ top: e.clientY - dragOffsetRef.current.y, left: e.clientX - dragOffsetRef.current.x }); }; const handleDragEnd = () => setIsDragging(false); if (isDragging) { window.addEventListener('mousemove', handleDragMove); window.addEventListener('mouseup', handleDragEnd); } return () => { window.removeEventListener('mousemove', handleDragMove); window.removeEventListener('mouseup', handleDragEnd); }; }, [isDragging]);
  useEffect(() => { if (manualPosition) setToolbarPosition(manualPosition); }, [manualPosition]);
  const handleDoubleClick = () => { setManualPosition(null); setTimeout(updateToolbar, 1); };
  const handleMouseUp = () => setTimeout(updateToolbar, 1);
  const handleFocus = () => { if (manualPosition) setShowToolbar(true); };
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => { if (!e.relatedTarget || !(e.relatedTarget as HTMLElement).closest('.editor-toolbar-portal')) { setShowToolbar(false); setShowLinkInput(false); } if (contentRef.current && contentRef.current.innerHTML !== props.content) { handleInput(); } };
  useEffect(() => { if (contentRef.current && contentRef.current.innerHTML !== props.content) { contentRef.current.innerHTML = props.content as string; } }, [props.content]);

  const Element = type === 'heading' ? 'h2' : 'div';
  const defaultSize = type === 'heading' ? 16 : 12;

  const style: React.CSSProperties = {
    fontSize: `${props.textSize || defaultSize}px`,
    fontFamily: props.fontFamily || 'sans-serif',
    textAlign: props.textAlign as any || 'left',
  };

  return (
    <div ref={wrapperRef} className={`pb-relative ${animationClasses}`}>
      {showToolbar && createPortal(
        <div className="editor-toolbar-portal" style={{ position: 'absolute', top: `${toolbarPosition.top}px`, left: `${toolbarPosition.left}px`, transform: manualPosition || showLinkInput ? '' : 'translateX(-50%)', zIndex: 1000 }} onMouseDown={(e) => { if (!(e.target as HTMLElement).closest('select, input')) e.preventDefault(); }}>
          <EditorToolbar
            isBold={selectionState.isBold} isItalic={selectionState.isItalic} isUnderlined={selectionState.isUnderlined} isLink={selectionState.isLink}
            textAlign={selectionState.textAlign as any} textSize={selectionState.textSize} fontFamily={selectionState.fontFamily} lineHeight={selectionState.lineHeight}
            color={selectionState.color} isDragging={isDragging} onToggleBold={() => applyBasicStyle('bold')} onToggleItalic={() => applyBasicStyle('italic')}
            onToggleUnderline={() => applyBasicStyle('underline')} onColorChange={applyColor} onTextAlign={applyAlignment} onTextSizeChange={applyFontSize}
            onFontFamilyChange={applyFontFamily} onLineHeightChange={applyLineHeight} onClearFormatting={handleClearFormatting} onDragStart={handleDragStart}
            onDoubleClick={handleDoubleClick} showLinkInput={showLinkInput} linkUrl={linkUrl} onToggleLink={handleToggleLink} onConfirmLink={handleConfirmLink}
            onUnlink={handleUnlink} onCloseLinkInput={handleCloseLinkInput}
          />
        </div>, document.body)}

      <Element
        ref={contentRef} contentEditable suppressContentEditableWarning onInput={handleInput} onFocus={handleFocus}
        onBlur={handleBlur} onMouseUp={handleMouseUp} style={style}
        className="pb-min-h-[1.5rem] pb-w-full pb-border pb-border-dashed pb-border-transparent pb-focus:border-gray-300 pb-focus:outline-none"
      />
    </div>
  );
});

const renderSettings = ({ component, updateComponent }: { component: TextComponent | HeaderComponent, updateComponent: (id: number, props: Partial<TextProps>) => void }) => {
  const { id, props } = component;
  const handleUpdate = <K extends keyof TextProps>(prop: K, value: TextProps[K]) => {
    updateComponent(id, { [prop]: value });
  };

  return (
    <div className="pb-p-4">
      <label htmlFor={`text-effect-${id}`} className="pb-block pb-text-sm pb-font-medium pb-text-gray-700 pb-mb-1">
        Entrance Effect
      </label>
      <select
        id={`text-effect-${id}`}
        value={props.textEffect || 'none'}
        onChange={e => handleUpdate('textEffect', e.target.value)}
        className="pb-w-full pb-p-2 pb-border pb-rounded-md pb-text-sm"
      >
        {Object.entries(effects).map(([key, { name }]) => (
          <option key={key} value={key}>{name}</option>
        ))}
      </select>
    </div>
  );
};

const nowId = () => Date.now();

export const textBlockDefinition: ComponentDefinition = {
  type: 'text',
  label: 'Text',
  icon: TextIcon,
  create: (): TextComponent => ({
    id: nowId(),
    type: 'text',
    props: { content: 'Your text...', textAlign: 'left', textSize: 12, fontFamily: 'sans-serif', textEffect: 'none' },
  }),
  Renderer: EditableText as any,
  renderSettings: renderSettings as any,
};

export const headingBlockDefinition: ComponentDefinition = {
  type: 'heading',
  label: 'Heading',
  icon: HeadingIcon,
  create: (): HeaderComponent => ({
    id: nowId(),
    type: 'heading',
    props: { content: '<b>Your heading...</b>', textAlign: 'left', textSize: 16, fontFamily: 'sans-serif', textEffect: 'none' },
  }),
  Renderer: EditableText as any,
  renderSettings: renderSettings as any,
};
