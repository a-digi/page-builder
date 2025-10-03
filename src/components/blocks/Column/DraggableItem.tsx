// path: src/components/page-builder/components/blocks/Column/DraggableItem.tsx
import type { CustomButton, PageComponent } from "../../../types/components";
import { BlockWrapper, type BlockWrapperProps } from '../../BlockWrapper';
import { ComponentRenderer } from "../../editor/ComponentRenderer";

const DraggableItem: React.FC<{
  itemRef: React.RefObject<HTMLDivElement | null>;
  component: PageComponent<any, any>;
  cellIndex: number;
  itemIndex: number;
  onDragStart: (e: React.DragEvent, cellIndex: number, component: PageComponent<any, any>) => void;
  onDragOver: React.DragEventHandler<HTMLDivElement>;
  onDrop: React.DragEventHandler<HTMLDivElement>;
  isDragOver: boolean;
  customToolbarButtons?: CustomButton<PageComponent<any, any>>[];
}> = ({ itemRef, component, cellIndex, onDragStart, onDragOver, onDrop, isDragOver, customToolbarButtons }) => {
  const controlsPos: BlockWrapperProps<PageComponent<any, any>>['controlsPosition'] = 'side-right-top-vertical';

  const dropIndicatorClasses = `pb-transition-colors pb-duration-200 pb-border-4 pb-w-full pb-rounded-lg pb-flex pb-items-center pb-justify-center ${!isDragOver ? 'pb-h-0 pb-border-transparent' : 'pb-border-blue-500 pb-bg-blue-50 pb-h-48 pb-border-dashed'}`;

  return (
    <>
      <div
        className={dropIndicatorClasses}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {isDragOver && <div className="pb-border-t-2 pb-border-blue-500 pb-h-1 pb-animate-pulse" />}
      </div>
      <div ref={itemRef} className="pb-relative pb-group/component">
        <BlockWrapper
          component={component}
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.effectAllowed = 'move';
            onDragStart(e, cellIndex, component);
          }}
          controlsPosition={controlsPos}
          customToolbarButtons={customToolbarButtons}
        >
          <ComponentRenderer component={component} />
        </BlockWrapper>
      </div>
    </>
  );
};

export default DraggableItem;
