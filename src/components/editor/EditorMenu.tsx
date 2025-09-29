// path: src/components/editor/EditorMenu.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useComponentRegistry } from '../../contexts/ComponentRegistry';
import { useComponentContext } from '../../hooks/useComponentContext';
import { type ComponentDefinition } from '../../contexts/ComponentRegistry';
import type { Data } from '../../PageBuilder';
import type { BuiltInComponents } from '../../types/components';

const Caret: React.FC<{ dir?: 'left' | 'right'; className?: string }> = ({ dir = 'right', className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    className={`${className || ''} transition-transform ${dir === 'left' ? 'rotate-180' : ''}`}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M9 5l7 7-7 7V5z" />
  </svg>
);

const readComponentsFromContext = (ctx: any) => {
  if (Array.isArray(ctx?.components)) return ctx.components;
  if (Array.isArray(ctx?.state?.components)) return ctx.state.components;
  if (typeof ctx?.exportJSON === 'function') return ctx.exportJSON();
  if (typeof ctx?.getComponents === 'function') return ctx.getComponents();
  return [];
};

const applyImportedToContext = (ctx: any, components: any[]) => {
  if (typeof ctx?.setComponents === 'function') return ctx.setComponents(components);
  if (typeof ctx?.setAllComponents === 'function') return ctx.setAllComponents(components);
  if (typeof ctx?.replaceAll === 'function') return ctx.replaceAll(components);
  if (typeof ctx?.importJSON === 'function') return ctx.importJSON(components);
  if (typeof ctx?.loadFromJSON === 'function') return ctx.loadFromJSON(components);
  if (typeof ctx?.dispatch === 'function') return ctx.dispatch({ type: 'SET_COMPONENTS', payload: components });
  throw new Error('Import failed: no supported API on ComponentContext to replace components.');
};

const PANEL_WIDTH = 336;
const GRID_COLUMNS = 4;

type Props = {
  onSave: (data: any) => void;
  saveButtonClickable: boolean;
  displaySaveButton: boolean;
  data: Data<BuiltInComponents>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditorMenu: React.FC<Props> = ({ onSave, saveButtonClickable, data, displaySaveButton, open, setOpen }) => {

  const { listDefinitions } = useComponentRegistry();
  const definitions = listDefinitions();
  const ctx: any = useComponentContext();
  const { readOnly, setIsDragging } = useComponentContext();

  const [hoveredDef, setHoveredDef] = useState<ComponentDefinition | null>(null);

  const components = readComponentsFromContext(ctx);
  const exportJSON = useMemo(() => {
    const payload = Array.isArray(components) ? { components } : components;
    return JSON.stringify(payload, null, 2);
  }, [components]);

  const [importText, setImportText] = useState<string>('');

  useEffect(() => {

    if (data === undefined) {
      return;
    }

    if (!('components' in data)) {
      return;
    }

    if (data.components.length === 0) {
      return;
    }

    setImportText(JSON.stringify(data.components));
  }, [data]);

  useEffect(() => {
    if (!importText.trim()) {
      return;
    }

    try {
      const json = JSON.parse(importText);
      const list = Array.isArray(json) ? json : json?.components;
      if (Array.isArray(list)) {
        performImport('replace')
      }
    } catch (e: any) {
      // do nothing
    }
  }, [importText]);

  const handleCopy = async () => {
    try {
      onSave(exportJSON);
      await navigator.clipboard.writeText(exportJSON);
    } catch {
      // ignore
    }
  };

  const performImport = (mode: 'replace' | 'append') => {
    try {
      const json = JSON.parse(importText || '{}');
      const incoming = Array.isArray(json) ? json : json?.components;
      if (!Array.isArray(incoming)) {
        throw new Error('Invalid format: expected an array or an object with "components".');
      }

      if (mode === 'replace') {
        applyImportedToContext(ctx, incoming);
      } else {
        const current = readComponentsFromContext(ctx);
        const merged = Array.isArray(current) ? [...current, ...incoming] : incoming;
        applyImportedToContext(ctx, merged);
      }
    } catch (err: any) {
      alert(`Import failed: ${err?.message || String(err)}`);
    }
  };

  const handleDragStart = (e: React.DragEvent, type: string) => {
    setIsDragging(true);
    const payload = { from: 'menu', type };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copyMove';
    setHoveredDef(null);
  };

  if (readOnly) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 pointer-events-none">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ right: open ? PANEL_WIDTH : 0, transform: 'translateY(-50%)' }}
        className="pointer-events-auto fixed top-1/2 bg-white border border-gray-200 shadow-lg rounded-l-md px-2 py-2 text-gray-600 hover:text-blue-600 hover:border-blue-400"
        aria-expanded={open}
        aria-label={open ? 'Close editor menu' : 'Open editor menu'}
        title={open ? 'Close menu' : 'Open menu'}
      >
        <Caret dir={open ? 'right' : 'left'} />
      </button>
      {open && (
        <div className="pointer-events-auto fixed right-0 top-0 h-screen" style={{ width: PANEL_WIDTH }}>
          <aside className="h-screen w-full bg-white border-l border-gray-200 shadow-2xl flex flex-col overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0 sticky top-0 bg-white z-10">
              <div className="text-sm font-semibold text-gray-700">Editor Menu</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-gray-500 hover:text-blue-600"
                title="Close"
                aria-label="Close"
              >
                <Caret dir="right" />
              </button>
            </div>

            <div className="flex-1 p-4 space-y-5">
              <section>
                <div className="text-xs font-semibold text-gray-500 mb-2">Components</div>
                <div className={`flex flex-wrap gap-2`}>
                  {definitions.map((def, index) => {
                    const label = def.label || String(def.type);
                    const desc = `Drag to add a ${label.toLowerCase()} block.`;

                    let tooltipPositionClasses = 'left-1/2 -translate-x-1/2';
                    if (index % GRID_COLUMNS === 0) {
                      tooltipPositionClasses = 'left-0';
                    } else if (index % GRID_COLUMNS === GRID_COLUMNS - 1) {
                      tooltipPositionClasses = 'right-0';
                    }

                    return (
                      <div
                        key={String(def.type)}
                        className="relative"
                        onMouseEnter={() => setHoveredDef(def)}
                        onMouseLeave={() => setHoveredDef(null)}
                      >
                        <button
                          draggable
                          onDragStart={(e) => handleDragStart(e, String(def.type))}
                          onDragEnd={() => setIsDragging(false)}
                          className="w-16 h-16 rounded border text-gray-700 flex items-center justify-center transition-colors cursor-pointer border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                          title={label}
                          aria-label={label}
                        >
                          {def.icon && React.cloneElement(def.icon, {
                            className: 'w-8 h-8 text-gray-600'
                          })}
                          <span className="sr-only">{label}</span>
                        </button>

                        {hoveredDef && hoveredDef.type === def.type && (
                          <div className={`absolute bottom-full mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded-md shadow-lg p-2 z-20 pointer-events-none ${tooltipPositionClasses}`}>
                            <div className="font-bold">{label}</div>
                            <div>{desc}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
              <section className="grid grid-cols-1 gap-3">
                {displaySaveButton &&
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      {saveButtonClickable &&
                        <button
                          onClick={handleCopy}
                          className="mt-10 w-full px-2 py-1.5 text-md rounded border border-gray-200 bg-gray-900 color-white cursor-pointer"
                          title="Copy to clipboard"
                        >
                          Save
                        </button>
                      }

                      {!saveButtonClickable &&
                        <button
                          disabled
                          onClick={handleCopy}
                          className="mt-10 w-full px-2 py-1.5 text-md rounded border border-gray-200 bg-gray-900 color-white cursor-pointer"
                          title="Copy to clipboard"
                        >
                          Save
                        </button>
                      }
                    </div>
                  </div>
                }
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default EditorMenu;
