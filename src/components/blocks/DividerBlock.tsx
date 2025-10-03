// path: src/components/page-builder/components/blocks/DividerBlock.tsx
import { memo } from 'react';
import type { DividerComponent } from '../../types/components';
import { type ComponentDefinition } from '../../contexts/ComponentRegistry';

export const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16" />
  </svg>
);

const DividerBlock = memo(({ }: { component: DividerComponent }) => {
  return (
    <div className="pb-relative pb-group pb-py-4">
      <div className="pb-w-full pb-border-t pb-border-gray-300"></div>
    </div>
  );
});

export default DividerBlock;

export const dividerBlockDefinition: ComponentDefinition = {
  type: 'divider',
  label: 'Divider',
  icon: icon,
  create: (): DividerComponent => ({
    id: Date.now(),
    type: 'divider',
    props: {},
  }),
  Renderer: DividerBlock as any,
}
