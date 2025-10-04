// path: src/components/editor/Editor.tsx
import React, { useState, useCallback, createContext } from 'react';
import { useComponentContext } from '../../hooks/useComponentContext';
import type { CustomButton, PageComponent } from '../../types/components';
import { ComponentRenderer } from './ComponentRenderer';
import { BlockWrapper } from '../BlockWrapper';
import { SettingsPanelProvider } from '../../contexts/SettingsPanelContext';

type ComponentPageEditorProps<C extends PageComponent<any, any>> = {
  customToolbarButtons?: CustomButton<C>[];
  customSettingsButtons?: CustomButton<C>[];
};

export const CustomButtonsContext = createContext<{ customToolbarButtons?: CustomButton<PageComponent<any, any>>[] }>({});

function ComponentPageEditor<C extends PageComponent<any, any>>({
  customToolbarButtons,
  customSettingsButtons,
}: ComponentPageEditorProps<C>) {
  const { components, setComponents, addComponent, isDragging, setIsDragging, moveComponentToRoot } = useComponentContext<C>();

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, component: C) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    const data = { from: 'main', id: component.id, component };
    e.dataTransfer.setData('application/json', JSON.stringify(data));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (isDragging) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverIndex(null);

    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData('application/json'));
    } catch {
      return;
    }

    if (data.from === 'menu') {
      addComponent(data.type, dropIndex);
    } else if (data.from === 'main') {
      const draggedComponentId = data.id;
      const draggedIndex = components.findIndex(c => c.id === draggedComponentId);
      if (draggedIndex === -1) return;

      const newComponents = [...components];
      const [draggedItem] = newComponents.splice(draggedIndex, 1);

      const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
      newComponents.splice(adjustedDropIndex, 0, draggedItem);

      setComponents(newComponents);
    } else if (data.from === 'column') {
      const componentToMove = data.component as C;
      moveComponentToRoot(componentToMove, dropIndex);
    }
  }, [components, setComponents, addComponent, setIsDragging, moveComponentToRoot]);

  // Empty state classes
  const emptyDropZoneBaseClasses = "pb-transition-colors pb-duration-200 pb-h-96 pb-w-full pb-border-2 pb-border-dashed pb-rounded-lg pb-flex pb-items-center pb-justify-center";
  const emptyDropZoneActiveClasses = "pb-border-blue-500 pb-bg-blue-50";
  const emptyDropZoneInactiveClasses = "pb-border-gray-300";

  const emptyTextBaseClasses = "pb-font-medium pb-transition-colors";
  const emptyTextActiveClasses = "pb-text-blue-600";
  const emptyTextInactiveClasses = "pb-text-gray-500";


  return (
    <SettingsPanelProvider>
      <div className="pb-flex-1 pb-w-full pb-max-w-4xl pb-mx-auto pb-space-y-4">
        <CustomButtonsContext.Provider value={{ customToolbarButtons: customToolbarButtons as any }}>
          {components.map((component, index) => {
            return (
              <div
                key={component.id}
                className="pb-relative"
                onDragOver={e => handleDragOver(e, index)}
                onDrop={e => handleDrop(e, index)}
                onDragLeave={handleDragLeave}
              >
                {dragOverIndex === index && (
                  <div className="pb-absolute pb-inset-x-0 pb-top-0 pb-h-1 pb-bg-blue-500 pb--mt-2 pb-animate-pulse pb-z-30" />
                )}

                <BlockWrapper<C>
                  component={component}
                  onDragStart={(e) => handleDragStart(e, component)}
                  customToolbarButtons={customToolbarButtons}
                  customSettingsButtons={customSettingsButtons}
                >
                  <ComponentRenderer component={component} />
                </BlockWrapper>
              </div>
            );
          })}
        </CustomButtonsContext.Provider>

        <div
          className="pb-w-full pb-relative"
          onDragOver={e => handleDragOver(e, components.length)}
          onDrop={e => handleDrop(e, components.length)}
          onDragLeave={handleDragLeave}
        >
          {components.length === 0 ? (
            // Case 1: Editor is empty
            <div className={`${emptyDropZoneBaseClasses} ${isDragging && dragOverIndex === 0
              ? emptyDropZoneActiveClasses
              : emptyDropZoneInactiveClasses
              }`}>
              <p className={`${emptyTextBaseClasses} ${isDragging && dragOverIndex === 0
                ? emptyTextActiveClasses
                : emptyTextInactiveClasses
                }`}>
                Drag components here to start building your page.
              </p>
            </div>
          ) : (
            // Case 2: Editor has components, show an expanding drop zone at the end
            <div className={`pb-relative pb-w-full pb-transition-all pb-duration-300 pb-ease-in-out ${isDragging && dragOverIndex === components.length ? 'pb-h-40' : 'pb-h-10'
              }`}>
              {isDragging && dragOverIndex === components.length && (
                <div className="pb-absolute pb-inset-2 pb-border-2 pb-border-dashed pb-border-blue-500 pb-rounded-lg pb-bg-blue-50 pb-flex pb-items-center pb-justify-center">
                  <p className="pb-font-medium pb-text-blue-600">Drop here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SettingsPanelProvider>
  );
};

export default ComponentPageEditor;
