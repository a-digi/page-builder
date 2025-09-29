// path: src/components/blocks/Column/DraggableItem.tsx
import type { CustomButton, PageComponent } from "../../../types/components";
import { BlockWrapper, type BlockWrapperProps } from '../../BlockWrapper';
import { ComponentRenderer } from "../../editor/ComponentRenderer";

const DraggableItem: React.FC<{
  itemRef: React.Ref<HTMLDivElement>;
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

  return (
    <>
      <div
        className={`transition-colors duration-200 border-4 w-full rounded-lg flex items-center justify-center ${!isDragOver ? 'h-0 border-transparent' : 'border-blue-500 bg-blue-50 h-48 border-dashed'}`}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {isDragOver && <div className="border-t-2 border-blue-500 h-1 animate-pulse" />}
      </div>
      <div ref={itemRef} className="relative group/component">
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