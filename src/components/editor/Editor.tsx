// path: src/components/editor/Editor.tsx
import React, { useState, useCallback, createContext } from 'react';
import { useComponentContext } from '../../hooks/useComponentContext';
import type { CustomButton, PageComponent } from '../../types/components';
import { ComponentRenderer } from './ComponentRenderer';
import { BlockWrapper } from '../BlockWrapper';
import { SettingsPanelProvider } from '../../contexts/SettingsPanelContext';
import styles from './Editor.module.css';

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

  return (
    <SettingsPanelProvider>
      <div className="flex-1 w-full max-w-4xl mx-auto space-y-4">
        <CustomButtonsContext.Provider value={{ customToolbarButtons: customToolbarButtons as any }}>
          {components.map((component, index) => {
            return (
              <div
                key={component.id}
                className="relative"
                onDragOver={e => handleDragOver(e, index)}
                onDrop={e => handleDrop(e, index)}
                onDragLeave={handleDragLeave}
              >
                {dragOverIndex === index && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 -mt-2 animate-pulse z-30" />
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
          className="w-full relative"
          onDragOver={e => handleDragOver(e, components.length)}
          onDrop={e => handleDrop(e, components.length)}
          onDragLeave={handleDragLeave}
        >
          {components.length === 0 ? (
            // Case 1: Editor is empty
            <div style={{ height: '24rem' }} className={`transition-colors duration-200 w-full border-2 border-dashed rounded-lg flex items-center justify-center ${isDragging && dragOverIndex === 0
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300'
              }`}>
              <p className={`font-medium transition-colors ${isDragging && dragOverIndex === 0
                ? 'text-blue-600'
                : 'text-gray-500'
                }`}>
                Drag components here to start building your page.
              </p>
            </div>
          ) : (
            // Case 2: Editor has components, show an expanding drop zone at the end
            <div className={`relative w-full transition-all duration-300 ease-in-out ${isDragging && dragOverIndex === components.length ? 'h-40' : 'h-10'
              }`}>
              {isDragging && dragOverIndex === components.length && (
                <div className="absolute inset-2 border-2 border-dashed border-blue-500 rounded-lg bg-blue-50 flex items-center justify-center">
                  <p className="font-medium text-blue-600">Drop here</p>
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
