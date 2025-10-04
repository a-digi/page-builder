// path: src/PageBuilder.tsx
import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { ComponentProvider } from './contexts/ComponentContext';
import ComponentPageEditor from './components/editor/Editor';
import EditorMenu from './components/editor/EditorMenu';
import { ComponentRegistrySetup } from './providers/ComponentRegistrySetup';
import { useComponentContext } from './hooks/useComponentContext';
import type { PageComponent, BuiltInComponents, BuiltInComponentType, CustomButton } from './types/components';
import { ComponentDefinition } from './contexts/ComponentRegistry';
import { generateIdString } from './generator/id';
import { useDragAutoScroll } from './hooks/useDragAutoScroll';

export type Props<C extends PageComponent<any, any>> = {
  onSave: (data: string) => void;
  saveButtonClickable: boolean;
  displaySaveButton: boolean;
  className?: string;
  data: Data<C>;
  additionalComponents?: ComponentDefinition<C>[];
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

function HandleBinderFn<C extends PageComponent<any, any>>(
  props: { data: Data<C> },
  ref: React.Ref<PageBuilderHandle<C>>
) {
  const { components } = useComponentContext();
  useImperativeHandle(
    ref,
    () => ({
      exportJSON: () => ({
        className: props.data.className,
        style: props.data.style,
        components: components as C[],
      }),
      getComponents: () => components as C[],
    }),
    [components, props.data.className, props.data.style]
  );
  return null;
}
const HandleBinder = forwardRef(HandleBinderFn);

const PageBuilderLayout = <C extends PageComponent<any, any>>({
  onSave,
  saveButtonClickable,
  displaySaveButton,
  data,
  customToolbarButtons,
  customSettingsButtons,
  className
}: Props<C>) => {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const { isDragging, isPreviewing } = useComponentContext();
  useDragAutoScroll({
    isDragging,
    scrollContainerRef: mainContainerRef
  });

  const combinedClassName = [
    'pb-w-full', 'pb-relative', 'pb-min-h-screen', 'pb-h-full', 'pb-font-sans', 'pb-bg-white', 'pb-text-gray-800',
    className
  ].filter(Boolean).join(' ');
  return (
    <div ref={mainContainerRef} data-pb-id={generateIdString()} className={combinedClassName}>
      <main className="pb-flex-1 pb-min-h-screen pb-h-full pb-flex pb-flex-col">
        <ComponentPageEditor
          customToolbarButtons={customToolbarButtons}
          customSettingsButtons={customSettingsButtons}
        />
      </main>

      {!isPreviewing && (
        <EditorMenu
          displaySaveButton={displaySaveButton}
          data={data}
          onSave={onSave}
          saveButtonClickable={saveButtonClickable}
        />
      )}
    </div>
  )
}

function PageBuilderComponent<C extends PageComponent<any, any> = BuiltInComponents>(
  props: Props<C>,
  ref: React.ForwardedRef<PageBuilderHandle<C>>
) {
  const { data, additionalComponents, excludedComponents, readOnly, allowComponentToBeAdded } = props;
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
        <HandleBinder data={props.data} ref={ref} />
        <PageBuilderLayout {...props} />
      </ComponentProvider>
    </ComponentRegistrySetup>
  );
}

const PageBuilder = forwardRef(PageBuilderComponent) as <C extends PageComponent<any, any> = BuiltInComponents>(
  props: Props<C> & { ref?: React.ForwardedRef<PageBuilderHandle<C>> }
) => React.ReactElement;


export default PageBuilder;