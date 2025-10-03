// path: src/components/page-builder/components/blocks/HTMLBlock.tsx
import React, { useState, useCallback, memo } from 'react';
import { type HTMLComponent } from '../../types/components';
import { useComponentContext } from '../../hooks/useComponentContext';
import { type ComponentDefinition } from '../../contexts/ComponentRegistry';

export const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M7 8l-4 4 4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 8l4 4-4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 6l-2 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HTMLBlock = memo(({ component }: { component: HTMLComponent }) => {
  const { updateComponent } = useComponentContext();
  const { id, props } = component;
  const [tab, setTab] = useState<'code' | 'preview'>('code');

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateComponent(id, { code: e.target.value });
  }, [id, updateComponent]);

  const getTabClass = (tabName: 'code' | 'preview') => {
    const baseClass = "pb-px-4 pb-py-2 pb-text-sm";
    return tab === tabName
      ? `${baseClass} pb-border-b-2 pb-border-blue-500 pb-text-blue-600`
      : `${baseClass} pb-text-gray-500`;
  }

  return (
    <div className="pb-relative pb-group pb-p-4 pb-border-2 pb-border-dashed pb-border-gray-300 pb-rounded-md">
      <div className="pb-flex pb-space-x-2 pb-mb-4 pb-border-b">
        <button onClick={() => setTab('code')} className={getTabClass('code')}>Code</button>
        <button onClick={() => setTab('preview')} className={getTabClass('preview')}>Preview</button>
      </div>
      <div>
        {tab === 'code' && (
          <textarea
            value={props.code}
            onChange={handleCodeChange}
            className="pb-w-full pb-h-40 pb-bg-gray-50 pb-font-mono pb-text-sm pb-p-2 pb-rounded pb-focus:outline-none"
          />
        )}
        {tab === 'preview' && (
          <iframe
            title="HTML Preview"
            srcDoc={props.code}
            className="pb-w-full pb-h-40 pb-border pb-rounded pb-bg-white"
            sandbox="allow-scripts"
          />
        )}
      </div>
    </div>
  );
});

export default HTMLBlock;

export const htmlBlockDefinition: ComponentDefinition = {
  type: 'html',
  label: 'HTML',
  icon: icon,
  create: (): HTMLComponent => ({
    id: Date.now(),
    type: 'html',
    props: { code: '<div>Hello</div>' },
  }),
  Renderer: HTMLBlock as any,
};
