// path: src/hooks/useDragAutoScroll.ts
import { useEffect, useRef } from 'react';

const SCROLL_ZONE_SIZE = 80;
const SCROLL_SPEED = 15;

interface UseDragAutoScrollProps {
  isDragging: boolean;
  // --- CHANGED ---
  // The ref's current property can be null initially.
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

export const useDragAutoScroll = ({ isDragging, scrollContainerRef }: UseDragAutoScrollProps) => {
  const scrollIntervalRef = useRef<number | null>(null);
  const isDraggingRef = useRef(isDragging);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    // This check already handles the null case, so the logic is safe.
    if (!container) return;

    const stopScrolling = () => {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };

    const startScrolling = (direction: 'up' | 'down') => {
      if (scrollIntervalRef.current) return;

      const scrollStep = () => {
        window.scrollBy(0, direction === 'up' ? -SCROLL_SPEED : SCROLL_SPEED);
        scrollIntervalRef.current = requestAnimationFrame(scrollStep);
      };
      scrollIntervalRef.current = requestAnimationFrame(scrollStep);
    };

    const handleDragOver = (event: DragEvent) => {
      if (!isDraggingRef.current) {
        stopScrolling();
        return;
      }

      const clientY = event.clientY;
      const viewportHeight = window.innerHeight;

      if (clientY < SCROLL_ZONE_SIZE) {
        startScrolling('up');
      }
      else if (clientY > viewportHeight - SCROLL_ZONE_SIZE) {
        startScrolling('down');
      }
      else {
        stopScrolling();
      }
    };

    container.addEventListener('dragover', handleDragOver);

    return () => {
      stopScrolling();
      container.removeEventListener('dragover', handleDragOver);
    };
  }, [scrollContainerRef]);
};
