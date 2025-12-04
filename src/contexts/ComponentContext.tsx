// path: src/contexts/ComponentContext.tsx
import React, { useState, useCallback, createContext, type ReactNode, useContext } from 'react';
import { type PageComponent, type BuiltInComponents, type ParallaxPage } from '../types/components';
import { useComponentRegistry } from './ComponentRegistry';

export interface ComponentContextType<C extends PageComponent<any, any> = BuiltInComponents> {
  components: C[];
  addComponent: (type: string, dropIndex?: number) => void;
  deleteComponent: (id: number) => void;
  updateComponent: (id: number, newProps: Partial<PageComponent<any, any>['props']>) => void;
  setAllComponents: (components: C[]) => void;
  importJSON: (payload: C[] | { components: C[] }) => void;
  setComponents: (components: C[]) => void;
  activeOverlayId: number | null;
  setActiveOverlayId: React.Dispatch<React.SetStateAction<number | null>>;
  readOnly: boolean;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  isPreviewing: boolean;
  setIsPreviewing: React.Dispatch<React.SetStateAction<boolean>>;
  isNested?: boolean;
  allowComponentToBeAdded: (componentTypeToAdd: string, destinationContainerType: string | null) => boolean;
  moveComponentToRoot: (component: C, dropIndex: number) => void;
  activeSettingsComponentId: number | null;
  setActiveSettingsComponentId: React.Dispatch<React.SetStateAction<number | null>>;
}

export const ComponentContext = createContext<ComponentContextType<any> | null>(null);

interface ComponentProviderProps {
  children: ReactNode;
  readOnly?: boolean;
  initialComponents?: PageComponent<any, any>[];
  isPreviewing: boolean;
  setIsPreviewing: React.Dispatch<React.SetStateAction<boolean>>;
  allowComponentToBeAdded?: (componentTypeToAdd: string, destinationContainerType: string | null) => boolean;
}

export const ComponentProvider = ({ children, readOnly = false, initialComponents = [], isPreviewing, setIsPreviewing, allowComponentToBeAdded = () => true }: ComponentProviderProps) => {
  const [components, setComponents] = useState<PageComponent<any, any>[]>(initialComponents);
  const [activeOverlayId, setActiveOverlayId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeSettingsComponentId, setActiveSettingsComponentId] = useState<number | null>(null);
  const { createComponent: createComponentFromRegistry } = useComponentRegistry();

  const ensureUniqueIds = useCallback((list: PageComponent<any, any>[]): PageComponent<any, any>[] => {
    const seen = new Set<number>();
    const genId = () => Date.now() + Math.floor(Math.random() * 1_000_000);

    const visit = (items: PageComponent<any, any>[]): PageComponent<any, any>[] =>
      items.map((comp) => {
        let id = comp.id;
        while (!id || seen.has(id)) {
          id = genId();
        }
        seen.add(id);

        const newProps = { ...comp.props };
        if (comp.type === 'column' && newProps.gridContents) {
          const gc = newProps.gridContents;
          const normalized = Object.fromEntries(
            Object.entries(gc).map(([k, v]) => [k, visit(v as PageComponent<any, any>[])])
          );
          newProps.gridContents = normalized;
        } else if (comp.type === 'parallax' && (newProps as any).pages) {
          (newProps as any).pages = ((newProps as any).pages as ParallaxPage[]).map(page => ({
            ...page,
            components: visit(page.components)
          }));
        }

        return { ...comp, id, props: newProps };
      });

    return visit(list);
  }, []);

  const deepUpdate = useCallback((items: PageComponent<any, any>[], id: number, newPropsUpdate: Partial<PageComponent<any, any>['props']>): PageComponent<any, any>[] => {
    return items.map(comp => {
      if (comp.id === id) {
        return { ...comp, props: { ...comp.props, ...newPropsUpdate } };
      }
      if (comp.type === 'column' && comp.props.gridContents) {
        const gc: any = comp.props.gridContents;
        const updatedObj = Object.fromEntries(
          Object.entries(gc).map(([k, cell]) => [k, deepUpdate(cell as PageComponent<any, any>[], id, newPropsUpdate)])
        );
        return { ...comp, props: { ...comp.props, gridContents: updatedObj } };
      }
      if (comp.type === 'parallax' && (comp.props as any).pages) {
        const newPages = ((comp.props as any).pages as ParallaxPage[]).map(page => ({
          ...page,
          components: deepUpdate(page.components, id, newPropsUpdate)
        }));
        return { ...comp, props: { ...comp.props, pages: newPages } };
      }
      return comp;
    });
  }, []);

  const deepDelete = useCallback((items: PageComponent<any, any>[], id: number): PageComponent<any, any>[] => {
    const filtered = items.filter(comp => comp.id !== id);
    return filtered.map(comp => {
      if (comp.type === 'column' && comp.props.gridContents) {
        const gc: any = comp.props.gridContents;
        const updatedObj = Object.fromEntries(
          Object.entries(gc).map(([k, cell]) => [k, deepDelete(cell as PageComponent<any, any>[], id)])
        );
        return { ...comp, props: { ...comp.props, gridContents: updatedObj } };
      }
      if (comp.type === 'parallax' && (comp.props as any).pages) {
        const newPages = ((comp.props as any).pages as ParallaxPage[]).map(page => ({
          ...page,
          components: deepDelete(page.components, id)
        }));
        return { ...comp, props: { ...comp.props, pages: newPages } };
      }
      return comp;
    });
  }, []);

  const addComponent = useCallback((type: string, dropIndex?: number) => {
    // If not allowed, do nothing and keep existing components
    if (!allowComponentToBeAdded(type, null)) {
      console.warn(`Adding component of type "${type}" to the root container is not allowed.`);
      return;
    }
    const newComponent = createComponentFromRegistry(type);
    if (!newComponent) {
      console.error(`Failed to create component of type: ${type}`);
      return;
    }
    setComponents(prev => {
      if (!newComponent) return prev; // Extra guard
      const newArray = [...prev];
      if (dropIndex !== undefined) {
        newArray.splice(dropIndex, 0, newComponent);
      } else {
        newArray.push(newComponent);
      }
      return newArray;
    });
  }, [createComponentFromRegistry, allowComponentToBeAdded]);

  const deleteComponent = useCallback((id: number) => {
    setComponents(prev => deepDelete(prev, id));
  }, [deepDelete]);

  const updateComponent = useCallback((id: number, newProps: Partial<PageComponent<any, any>['props']>) => {
    setComponents(prev => deepUpdate(prev, id, newProps));
  }, [deepUpdate]);

  const setAllComponents = useCallback((newComponents: PageComponent<any, any>[]) => {
    setComponents(newComponents);
  }, []);

  const importJSON = useCallback((payload: PageComponent<any, any>[] | { components: PageComponent<any, any>[] }) => {
    const list = Array.isArray(payload) ? payload : payload?.components;
    if (!Array.isArray(list)) return;
    const sanitized = ensureUniqueIds(list);
    setComponents(sanitized);
  }, [ensureUniqueIds]);

  // --- PATCH START: Only move if allowed ---
  const moveComponentToRoot = useCallback((component: PageComponent<any, any>, dropIndex: number) => {
    if (!allowComponentToBeAdded(component.type, null)) {
      console.warn(`Moving component of type "${component.type}" to root is not allowed.`);
      return;
    }

    setComponents(prev => {
      const afterDelete = deepDelete(prev, component.id);
      afterDelete.splice(dropIndex, 0, component);
      return afterDelete;
    });
  }, [deepDelete, allowComponentToBeAdded]);
  // --- PATCH END ---

  const value: ComponentContextType<any> = {
    components,
    addComponent,
    deleteComponent,
    updateComponent,
    setAllComponents,
    setComponents: setAllComponents,
    importJSON,
    activeOverlayId,
    setActiveOverlayId,
    readOnly,
    isDragging,
    setIsDragging,
    isPreviewing,
    setIsPreviewing,
    isNested: false,
    allowComponentToBeAdded,
    moveComponentToRoot,
    activeSettingsComponentId,
    setActiveSettingsComponentId,
  };

  return <ComponentContext.Provider value={value}>{children}</ComponentContext.Provider>;
};

export const useComponentContext = () => {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error('useComponentContext must be used inside a ComponentProvider');
  }
  return context;
};
