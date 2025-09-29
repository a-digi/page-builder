// path: src/providers/ComponentRegistrySetup.tsx
import React, { useMemo } from 'react';
import { ComponentRegistryProvider, type ComponentDefinition } from '../contexts/ComponentRegistry';
import type { PageComponent, BuiltInComponents, BuiltInComponentType } from '../types/components';

import { textBlockDefinition, headingBlockDefinition } from '../components/blocks/EditableText';
import { dividerBlockDefinition } from '../components/blocks/DividerBlock';
import { htmlBlockDefinition } from '../components/blocks/HTMLBlock';
import { overlayBlockDefinition as columnBlockDefinition } from '../components/blocks/Column/ColumnBlock';
import { alertBlockDefinition } from '../components/blocks/AlertBlock';
import { imageBlockDefinition } from '../components/blocks/Image/ImageBlock';
import { parallaxBlockDefinition } from '../components/blocks/Parallax/ParallaxBlock';

const allBuiltInDefinitions: ComponentDefinition<any>[] = [
  textBlockDefinition,
  headingBlockDefinition,
  dividerBlockDefinition,
  imageBlockDefinition,
  htmlBlockDefinition,
  columnBlockDefinition,
  alertBlockDefinition,
  parallaxBlockDefinition,
];

type Props<C extends PageComponent<any, any>> = {
  children: React.ReactNode;
  additionalComponents?: ComponentDefinition<C>[];
  excludedComponents?: (BuiltInComponentType | C['type'])[];
};

export function ComponentRegistrySetup<C extends PageComponent<any, any> = BuiltInComponents>({
  children,
  additionalComponents = [],
  excludedComponents = [],
}: Props<C>) {
  const definitions = useMemo(() => {
    const combinedDefinitions: ComponentDefinition<any>[] = [
      ...allBuiltInDefinitions,
      ...additionalComponents,
    ];

    const componentMap = new Map<string, ComponentDefinition<any>>();

    for (const def of combinedDefinitions) {
      componentMap.set(def.type, def);
    }

    const excludedSet = new Set(excludedComponents);
    for (const type of excludedSet) {
      componentMap.delete(type);
    }

    return Array.from(componentMap.values());
  }, [additionalComponents, excludedComponents]);

  return <ComponentRegistryProvider definitions={definitions}>{children}</ComponentRegistryProvider>;
};
