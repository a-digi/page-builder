// path: src/components/blocks/AlertBlock.tsx
import React, { memo } from 'react';
import { useComponentContext } from '../../hooks/useComponentContext';
import type { AlertComponent } from '../../types/components';
import { type ComponentDefinition } from '../../contexts/ComponentRegistry';

export const icon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const AlertBlock = memo(({ component }: { component: AlertComponent }) => {
  const { updateComponent } = useComponentContext();

  const handleBlur = (field: 'title' | 'content') => (e: React.FocusEvent<HTMLParagraphElement>) => {
    const newText = e.currentTarget.textContent || '';
    if (component.props[field] !== newText) {
      updateComponent(component.id, {
        [field]: newText,
      });
    }
  };

  return (
    <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
      <p
        className="font-bold"
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur('title')}
        data-placeholder="Alert Title"
      >
        {component.props.title}
      </p>
      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur('content')}
        data-placeholder="Alert content..."
      >
        {component.props.content}
      </p>
    </div>
  );
});

export default AlertBlock;

export const alertBlockDefinition: ComponentDefinition = {
  type: 'alert',
  label: 'Alert',
  icon: icon,
  create: (): AlertComponent => ({
    id: Date.now(),
    type: 'alert',
    props: {
      title: 'Alert Title',
      content: 'This is an important message.',
    },
  }),
  Renderer: AlertBlock as any,
};
