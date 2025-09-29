// path: src/components/custom/SkeletonBlock.tsx

import React from 'react';
import type { PageComponent, BaseComponentProps } from '../types/components';
import { useComponentContext } from '../hooks/useComponentContext';
import type { ComponentDefinition } from '../contexts/ComponentRegistry';

interface SkeletonProps extends BaseComponentProps {
  placeholderText: string;
}

export type SkeletonComponent = PageComponent<'skeleton', SkeletonProps>;
const SkeletonBlock: React.FC<{ component: SkeletonComponent }> = ({ component }) => {
  const { updateComponent } = useComponentContext();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateComponent(component.id, { placeholderText: e.target.value });
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <h3 className="mb-2 text-sm font-bold text-gray-500">Skeleton Block Settings</h3>
      <label className="block text-sm font-medium text-gray-700">
        Placeholder Text
        <input
          type="text"
          value={component.props.placeholderText}
          onChange={handleTextChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </label>

      <p className="mt-4 text-gray-500 italic">
        Preview: {component.props.placeholderText}
      </p>
    </div>
  );
};


export const skeletonDefinition: ComponentDefinition<SkeletonComponent> = {
  type: 'skeleton',
  label: 'Skeleton Block',
  create: () => ({
    id: Date.now(),
    type: 'skeleton',
    props: {
      placeholderText: 'Edit me!',
    },
  }),

  Renderer: SkeletonBlock,
};
