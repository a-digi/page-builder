// path: src/components/editor/ComponentRenderer.tsx
import React from 'react';
import { useComponentRegistry } from '../../contexts/ComponentRegistry';
import type { PageComponent } from '../../types/components';

export const ComponentRenderer: React.FC<{ component: PageComponent<any, any> }> = ({ component }) => {
  const { getRenderer } = useComponentRegistry();
  const Renderer = getRenderer(component.type);

  if (!Renderer) {
    console.error(`Renderer for component type "${component.type}" not found.`);
    return (
      <div className="pb-bg-red-100 pb-border pb-border-red-400 pb-text-red-700 pb-px-4 pb-py-3 pb-rounded pb-relative" role="alert">
        <strong className="pb-font-bold">Error: </strong>
        <span className="pb-block pb-sm:inline">Component renderer for type "{component.type}" not found.</span>
      </div>
    );
  }

  return <Renderer component={component} />;
};
