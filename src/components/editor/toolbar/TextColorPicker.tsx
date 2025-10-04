// path: src/components/editor/toolbar/TextColorPicker.tsx
import React, { useState, useRef, useCallback, useEffect, type RefObject } from 'react';
import { PREDEFINED_COLORS } from './model/colors';

const useOnClickOutside = <T extends HTMLElement>(ref: React.RefObject<T>, handler: (event: MouseEvent | TouchEvent) => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

const rgbToHex = (rgb: string): string => {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return rgb;
  const toHex = (c: number) => ('0' + c.toString(16)).slice(-2);
  return `#${toHex(parseInt(match[1], 10))}${toHex(parseInt(match[2], 10))}${toHex(parseInt(match[3], 10))}`;
}

interface TextColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

const TextColorPicker: React.FC<TextColorPickerProps> = ({ currentColor, onColorChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(popoverRef as RefObject<HTMLElement>, () => setIsOpen(false));

  const handleColorSelect = useCallback((color: string) => {
    onColorChange(color);
    setIsOpen(false);
  }, [onColorChange]);

  const safeColor = currentColor || '';
  const normalizedColor = safeColor.startsWith('rgb') ? rgbToHex(safeColor) : safeColor;
  const displayColor = normalizedColor || '#000000';

  const popoverClasses = [
    'pb-absolute', 'pb-z-20', 'pb-top-full', 'pb-mt-2', 'pb-p-2', 'pb-bg-gray-800',
    'pb-border', 'pb-border-gray-600', 'pb-rounded-md', 'pb-shadow-lg', 'pb-w-60',
    'pb-left-1/2', 'pb-translate-x--50%'
  ].join(' ');

  return (
    <div className="pb-relative">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen(!isOpen)}
        className="pb-flex pb-items-center pb-p-2 pb-rounded-md pb-transition-colors pb-duration-150 pb-text-gray-300 pb-hover:bg-gray-600 pb-hover:text-white"
        title="Text Color"
      >
        <div className="pb-w-5 pb-h-5 pb-rounded-sm pb-border pb-border-gray-400" style={{ backgroundColor: displayColor }} />
      </button>

      {isOpen && (
        <div ref={popoverRef} className={popoverClasses}>
          <div className="pb-grid pb-grid-cols-8 pb-gap-1">
            {PREDEFINED_COLORS.map((color) => {
              const colorButtonClasses = [
                'pb-w-6', 'pb-h-6', 'pb-rounded-sm', 'pb-transition-transform', 'pb-duration-100', 'pb-hover:scale-110',
                'pb-focus:outline-none', 'pb-focus:ring-2',
                displayColor.toLowerCase() === color.toLowerCase() ? 'pb-ring-blue-500' : 'pb-focus:ring-blue-500'
              ].join(' ');

              return (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleColorSelect(color)}
                  className={colorButtonClasses}
                  aria-label={`Set color to ${color}`}
                  style={{ backgroundColor: color }}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextColorPicker;
