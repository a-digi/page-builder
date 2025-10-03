// path: src/components/page-builder/contexts/ComponentRegistry.tsx
import React, { createContext, useContext, useMemo } from 'react';
import type { PageComponent, BuiltInComponents } from '../types/components';

type AnyRenderer<C extends PageComponent<any, any>> = React.ComponentType<{ component: C }>;

export type ComponentDefinition<C extends PageComponent<any, any> = BuiltInComponents> = {
  type: C['type'];
  create: () => C;
  Renderer: AnyRenderer<C>;
  label?: string;
  icon?: React.ReactElement<{ className?: string }>;
  settingsIcon?: React.ReactNode;
  renderSettings?: (props: {
    component: C;
    updateComponent: (id: number, props: Partial<C['props']>) => void;
  }) => React.ReactNode;
  renderCustomControls?: (component: C) => React.ReactNode;
};

type RegistryMap = Map<string, ComponentDefinition<any>>;

type ComponentRegistryContextValue = {
  getDefinition: (type: string) => ComponentDefinition<any> | undefined;
  getRenderer: (type: string) => AnyRenderer<any> | undefined;
  createComponent: (type: string) => PageComponent<any, any> | undefined;
  listDefinitions: () => ComponentDefinition<any>[];
};

const ComponentRegistryContext = createContext<ComponentRegistryContextValue | null>(null);

export const ComponentRegistryProvider: React.FC<{
  definitions: ComponentDefinition<any>[];
  children: React.ReactNode;
}> = ({ definitions, children }) => {
  const registry = useMemo<RegistryMap>(() => {
    const map = new Map<string, ComponentDefinition<any>>();
    for (const def of definitions) map.set(def.type, def);
    return map;
  }, [definitions]);

  const ordered = useMemo(() => definitions.slice(), [definitions]);

  const value = useMemo<ComponentRegistryContextValue>(() => ({
    getDefinition: (type) => registry.get(type),
    getRenderer: (type) => registry.get(type)?.Renderer,
    createComponent: (type) => registry.get(type)?.create(),
    listDefinitions: () => ordered,
  }), [registry, ordered]);

  return (
    <ComponentRegistryContext.Provider value={value}>
      {children}
    </ComponentRegistryContext.Provider>
  );
};

export const useComponentRegistry = () => {
  const ctx = useContext(ComponentRegistryContext);
  if (!ctx) throw new Error('useComponentRegistry must be used within ComponentRegistryProvider');
  return ctx;
};
