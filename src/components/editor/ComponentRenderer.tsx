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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">Component renderer for type "{component.type}" not found.</span>
      </div>
    );
  }

  return <Renderer component={component} />;
};
