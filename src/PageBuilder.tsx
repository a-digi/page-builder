// path: src/PageBuilder.tsx
import React, { useImperativeHandle, useState, useRef, useEffect } from 'react';
import { ComponentProvider } from './contexts/ComponentContext';
import ComponentPageEditor from './components/editor/Editor';
import EditorMenu from './components/editor/EditorMenu';
import { ComponentRegistrySetup } from './providers/ComponentRegistrySetup';
import { useComponentContext } from './hooks/useComponentContext';
import type { PageComponent, BuiltInComponents, BuiltInComponentType, CustomButton } from './types/components';
import { type ComponentDefinition } from './contexts/ComponentRegistry';
import { generateIdString } from './generator/id';
import { useDragAutoScroll } from './hooks/useDragAutoScroll';

export type Props<C extends PageComponent<any, any>> = {
  onSave: (data: string) => void;
  saveButtonClickable: boolean;
  displaySaveButton: boolean;
  className?: string;
  data: Data<C>;
  additionalComponents?: ComponentDefinition<any>[];
  excludedComponents?: (BuiltInComponentType | C['type'])[];
  customToolbarButtons?: CustomButton<C>[];
  customSettingsButtons?: CustomButton<C>[];
  readOnly?: boolean;
  allowComponentToBeAdded?: (componentTypeToAdd: string, destinationContainerType: string | null) => boolean;
};

export type Data<C extends PageComponent<any, any>> = {
  components: C[];
  className?: string;
  style?: React.CSSProperties;
};

export type PageBuilderHandle<C extends PageComponent<any, any>> = {
  exportJSON: () => Data<C>;
  getComponents: () => C[];
};

function HandleBinder<C extends PageComponent<any, any>>({ ref }: { ref?: React.ForwardedRef<PageBuilderHandle<C>> }) {
  const { components } = useComponentContext();
  useImperativeHandle(
    ref,
    () => ({
      exportJSON: () => ({ components: components as C[] }),
      getComponents: () => components as C[],
    }),
    [components]
  );
  return null;
}

const PageBuilderLayout = <C extends PageComponent<any, any>>({
  onSave,
  saveButtonClickable,
  displaySaveButton,
  data,
  customToolbarButtons,
  customSettingsButtons
}: Props<C>) => {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const { isDragging, isPreviewing, activeSettingsComponentId } = useComponentContext();
  const [isEditorMenuOpen, setIsEditorMenuOpen] = useState(false);
  const wasEditorMenuOpenRef = useRef(false);
  useEffect(() => {
    if (activeSettingsComponentId !== null) {
      if (isEditorMenuOpen) {
        wasEditorMenuOpenRef.current = true;
        setIsEditorMenuOpen(false);
      }
    }
    else {
      if (wasEditorMenuOpenRef.current) {
        setIsEditorMenuOpen(true);
        wasEditorMenuOpenRef.current = false;
      }
    }
  }, [activeSettingsComponentId, isEditorMenuOpen]);

  useDragAutoScroll({
    isDragging,
    scrollContainerRef: mainContainerRef
  });

  return (
    <div ref={mainContainerRef} data-pb-id={generateIdString()} className="w-full relative min-h-screen h-full font-sans bg-white text-gray-800">
      <main className="flex-1 min-h-screen h-full flex flex-col">
        <ComponentPageEditor
          customToolbarButtons={customToolbarButtons}
          customSettingsButtons={customSettingsButtons}
        />
      </main>

      {!isPreviewing && (
        <EditorMenu
          displaySaveButton={displaySaveButton}
          data={data as Data<BuiltInComponents>}
          onSave={onSave}
          saveButtonClickable={saveButtonClickable}
          open={isEditorMenuOpen}
          setOpen={setIsEditorMenuOpen}
        />
      )}
    </div>
  )
}

function PageBuilder<C extends PageComponent<any, any> = BuiltInComponents>(
  props: Props<C> & { ref?: React.ForwardedRef<PageBuilderHandle<C>> }
) {
  const { data, additionalComponents, excludedComponents, readOnly, allowComponentToBeAdded, ref } = props;
  const [isPreviewing, setIsPreviewing] = useState(false);

  return (
    <ComponentRegistrySetup<C>
      additionalComponents={additionalComponents}
      excludedComponents={excludedComponents}
    >
      <ComponentProvider
        readOnly={readOnly}
        initialComponents={data.components}
        isPreviewing={isPreviewing}
        setIsPreviewing={setIsPreviewing}
        allowComponentToBeAdded={allowComponentToBeAdded}
      >
        <HandleBinder ref={ref} />
        {/* Render the new layout component inside the provider */}
        <PageBuilderLayout {...props} />
      </ComponentProvider>
    </ComponentRegistrySetup>
  );
}

export default PageBuilder;