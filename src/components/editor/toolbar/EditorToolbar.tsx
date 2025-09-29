// path: src/components/editor/toolbar/EditorToolbar.tsx
import React, { memo, useState, useEffect } from 'react';
import TextColorPicker from './TextColorPicker';

const ICONS: Record<string, React.ReactNode> = {
  left: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
  center: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM5 15a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
  right: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
  justify: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
  link: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.72" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.72-1.72" /></svg>,
  unlink: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  'clear-formatting': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14" /><path d="M12 4v16" /><path d="M17 7L7 17" /></svg>,
  confirm: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  cancel: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
};

const EditorIcon: React.FC<{ icon: string }> = ({ icon }) => ICONS[icon] ?? null;

const FONT_SIZE_OPTIONS = Array.from({ length: 65 }, (_, i) => i + 8); // 8px to 72px
const FONT_FAMILIES = ['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New', 'sans-serif', 'serif', 'monospace'];
const LINE_HEIGHTS = ['1', '1.15', '1.25', '1.5', '1.75', '2'];
const ALIGNMENT_MAP = { left: 'justifyLeft', center: 'justifyCenter', right: 'justifyRight', justify: 'justifyFull' };
type Alignment = keyof typeof ALIGNMENT_MAP;


interface EditorToolbarProps {
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
  isLink: boolean;
  textAlign: Alignment;
  textSize: number;
  fontFamily: string;
  lineHeight: number;
  color: string;
  isDragging: boolean;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onTextAlign: (alignment: Alignment) => void;
  onTextSizeChange: (value: number) => void;
  onFontFamilyChange: (value: string) => void;
  onLineHeightChange: (value: number) => void;
  onColorChange: (color: string) => void;
  onDragStart: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onDoubleClick: () => void;
  onClearFormatting: () => void;
  showLinkInput: boolean;
  linkUrl: string;
  onToggleLink: () => void;
  onConfirmLink: (url: string) => void;
  onUnlink: () => void;
  onCloseLinkInput: () => void;
}

const ToolbarButton: React.FC<{ onClick?: () => void; isActive?: boolean; title: string; children: React.ReactNode; }> =
  ({ onClick, isActive, title, children }) => (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-2 rounded-md transition-colors duration-150 ${isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-600 hover:text-white'
        }`}
      title={title}
    >
      {children}
    </button>
  );

const EditorToolbar = memo(({
  isBold, isItalic, isUnderlined, isLink, textAlign, textSize, fontFamily, lineHeight, color, isDragging,
  onToggleBold, onToggleItalic, onToggleUnderline, onTextAlign, onTextSizeChange, onFontFamilyChange, onLineHeightChange, onColorChange,
  onDragStart, onDoubleClick, onClearFormatting,
  showLinkInput, linkUrl, onToggleLink, onConfirmLink, onUnlink, onCloseLinkInput
}: EditorToolbarProps) => {

  const [linkInputValue, setLinkInputValue] = useState('');

  useEffect(() => {
    if (showLinkInput) setLinkInputValue(linkUrl);
  }, [showLinkInput, linkUrl]);

  const handleConfirmLink = () => onConfirmLink(linkInputValue);
  const handleLinkKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleConfirmLink(); }
    if (e.key === 'Escape') { e.preventDefault(); onCloseLinkInput(); }
  };

  return (
    <div
      className={`flex items-center space-x-1 p-1 bg-gray-800 text-white rounded-md shadow-lg z-10 select-none ${isDragging && !showLinkInput ? 'cursor-grabbing' : showLinkInput ? '' : 'cursor-grab'
        }`}
      onMouseDown={onDragStart}
      onDoubleClick={onDoubleClick}
      title={showLinkInput ? "" : "Double-click to reset position"}
    >
      {showLinkInput ? (
        <div className="flex items-center space-x-1 p-1">
          <ToolbarButton onClick={onUnlink} title="Remove link">
            <EditorIcon icon="unlink" />
          </ToolbarButton>
          <input
            type="text" value={linkInputValue} onChange={(e) => setLinkInputValue(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            className="bg-white text-black placeholder-gray-500 text-sm rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 w-72"
            placeholder="https://example.com" autoFocus
          />
          <ToolbarButton onClick={handleConfirmLink} title="Confirm"><EditorIcon icon="confirm" /></ToolbarButton>
          <ToolbarButton onClick={onCloseLinkInput} title="Cancel"><EditorIcon icon="cancel" /></ToolbarButton>
        </div>
      ) : (
        <>
          <div className="flex items-center">
            <ToolbarButton onClick={onToggleBold} isActive={isBold} title="Bold"><span className="font-bold w-5 h-5 flex items-center justify-center">B</span></ToolbarButton>
            <ToolbarButton onClick={onToggleItalic} isActive={isItalic} title="Italic"><span className="italic w-5 h-5 flex items-center justify-center">I</span></ToolbarButton>
            <ToolbarButton onClick={onToggleUnderline} isActive={isUnderlined} title="Underline"><span className="underline w-5 h-5 flex items-center justify-center">U</span></ToolbarButton>
          </div>

          <TextColorPicker currentColor={color} onColorChange={onColorChange} />

          <div className="w-px h-5 bg-gray-600 mx-1"></div>

          <div className="flex items-center">
            {(Object.keys(ALIGNMENT_MAP) as Alignment[]).map((align) => (
              <ToolbarButton key={align} onClick={() => onTextAlign(align)} isActive={textAlign === align} title={`Align ${align}`}>
                <EditorIcon icon={align} />
              </ToolbarButton>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-600 mx-1"></div>

          <div className="flex items-center space-x-1">
            <select value={textSize} onChange={(e) => onTextSizeChange(Number(e.target.value))} className="bg-gray-700 text-white text-sm rounded-md py-1.5 px-2 h-[36px] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" title="Font Size">
              {FONT_SIZE_OPTIONS.map(size => <option key={size} value={size}>{size}px</option>)}
            </select>
            <select value={fontFamily} onChange={(e) => onFontFamilyChange(e.target.value)} className="bg-gray-700 text-white text-sm rounded-md py-1.5 px-2 h-[36px] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" title="Font Family">
              {FONT_FAMILIES.map(font => <option key={font} value={font}>{font}</option>)}
            </select>
            <select value={lineHeight} onChange={(e) => onLineHeightChange(Number(e.target.value))} className="bg-gray-700 text-white text-sm rounded-md py-1.5 px-2 h-[36px] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" title="Line Height">
              {LINE_HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div className="w-px h-5 bg-gray-600 mx-1"></div>

          <div className="flex items-center">
            <ToolbarButton onClick={onToggleLink} isActive={isLink} title="Link"><EditorIcon icon="link" /></ToolbarButton>
            <ToolbarButton onClick={onClearFormatting} title="Clear Formatting"><EditorIcon icon="clear-formatting" /></ToolbarButton>
          </div>
        </>
      )}
    </div>
  );
});

export default EditorToolbar;
