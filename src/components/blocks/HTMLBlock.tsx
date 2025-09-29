// path: src/components/blocks/HTMLBlock.tsx
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

  return (
    <div className="relative group p-4 border-2 border-dashed border-gray-300 rounded-md">
      <div className="flex space-x-2 mb-4 border-b">
        <button onClick={() => setTab('code')} className={`px-4 py-2 text-sm ${tab === 'code' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Code</button>
        <button onClick={() => setTab('preview')} className={`px-4 py-2 text-sm ${tab === 'preview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Preview</button>
      </div>
      <div>
        {tab === 'code' && (
          <textarea
            value={props.code}
            onChange={handleCodeChange}
            className="w-full h-40 bg-gray-50 font-mono text-sm p-2 rounded focus:outline-none"
          />
        )}
        {tab === 'preview' && (
          <iframe
            title="HTML Preview"
            srcDoc={props.code}
            className="w-full h-40 border rounded bg-white"
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
