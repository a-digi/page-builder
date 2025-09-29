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

  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-2 rounded-md transition-colors duration-150 text-gray-300 hover:bg-gray-600 hover:text-white"
        title="Text Color"
      >
        <div className="w-5 h-5 rounded-sm border border-gray-400" style={{ backgroundColor: displayColor }} />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-20 top-full mt-2 p-2 bg-gray-800 border border-gray-600 rounded-md shadow-lg w-60 left-1/2 -translate-x-1/2"
        >
          <div className="grid grid-cols-8 gap-1">
            {PREDEFINED_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleColorSelect(color)}
                className={`w-6 h-6 rounded-sm transition-transform duration-100 hover:scale-110 focus:outline-none focus:ring-2 ${displayColor.toLowerCase() === color.toLowerCase() ? 'ring-blue-500' : 'focus:ring-blue-500'}`}
                aria-label={`Set color to ${color}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextColorPicker;
