// path: src/hooks/useComponentContext.ts
import { useContext } from 'react';
import { ComponentContext, type ComponentContextType } from '../contexts/ComponentContext';
import { type PageComponent, type BuiltInComponents } from '../types/components';

export const useComponentContext = <C extends PageComponent<any, any> = BuiltInComponents>(): ComponentContextType<C> => {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error('useComponentContext must be used within a ComponentProvider');
  }
  return context as ComponentContextType<C>;
};
