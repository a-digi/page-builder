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
    className={`${className || ''} pb-transition-transform ${dir === 'left' ? 'pb-rotate-180' : ''}`}
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
  isOpen?: boolean;
  onToggle?: () => void;
}

const EditorMenu: React.FC<Props> = ({ onSave, saveButtonClickable, data, displaySaveButton, isOpen = false, onToggle }) => {

  const { listDefinitions } = useComponentRegistry();
  const allDefinitions = listDefinitions();
  const ctx: any = useComponentContext();
  const { readOnly, setIsDragging, allowComponentToBeAdded } = useComponentContext();

  const definitions = useMemo(() => {
    return allDefinitions.filter(def => allowComponentToBeAdded(def.type, null));
  }, [allDefinitions, allowComponentToBeAdded]);

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
    <div className="pb-fixed pb-inset-y-0 pb-right-0 pb-z-40 pb-pointer-events-none">
      <button
        type="button"
        onClick={onToggle}
        style={{ right: isOpen ? PANEL_WIDTH : 0, transform: 'translateY(-50%)' }}
        className="pb-pointer-events-auto pb-fixed pb-top-1/2 pb-bg-white pb-border pb-border-gray-200 pb-shadow-lg pb-rounded-l-md pb-px-2 pb-py-2 pb-text-gray-600 pb-hover:text-blue-600 pb-hover:border-blue-400"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close editor menu' : 'Open editor menu'}
        title={isOpen ? 'Close menu' : 'Open menu'}
      >
        <Caret dir={isOpen ? 'right' : 'left'} />
      </button>
      {isOpen && (
        <div className="pb-pointer-events-auto pb-fixed pb-right-0 pb-top-0 pb-h-screen" style={{ width: PANEL_WIDTH }}>
          <aside className="pb-h-screen pb-w-full pb-bg-white pb-border-l pb-border-gray-200 pb-shadow-2xl pb-flex pb-flex-col pb-overflow-y-auto">
            <div className="pb-px-4 pb-py-3 pb-border-b pb-border-gray-100 pb-flex pb-items-center pb-justify-between pb-shrink-0 pb-sticky pb-top-0 pb-bg-white pb-z-10">
              <div className="pb-text-sm pb-font-semibold pb-text-gray-700">Editor Menu</div>
              <button
                type="button"
                onClick={onToggle}
                className="pb-p-2 pb-text-gray-500 pb-hover:text-blue-600"
                title="Close"
                aria-label="Close"
              >
                <Caret dir="right" />
              </button>
            </div>

            <div className="pb-flex-1 pb-p-4 pb-space-y-5">
              <section>
                <div className="pb-text-xs pb-font-semibold pb-text-gray-500 pb-mb-2">Components</div>
                <div className={`pb-flex pb-flex-wrap pb-gap-2`}>
                  {definitions.map((def, index) => {
                    const label = def.label || String(def.type);
                    const desc = `Drag to add a ${label.toLowerCase()} block.`;

                    let tooltipPositionClasses = 'pb-left-1/2 -pb-translate-x-50%';
                    if (index % GRID_COLUMNS === 0) {
                      tooltipPositionClasses = 'pb-left-0';
                    } else if (index % GRID_COLUMNS === GRID_COLUMNS - 1) {
                      tooltipPositionClasses = 'pb-right-0';
                    }

                    return (
                      <div
                        key={String(def.type)}
                        className="pb-relative"
                        onMouseEnter={() => setHoveredDef(def)}
                        onMouseLeave={() => setHoveredDef(null)}
                      >
                        <button
                          draggable
                          onDragStart={(e) => handleDragStart(e, String(def.type))}
                          onDragEnd={() => setIsDragging(false)}
                          className="pb-w-16 pb-h-16 pb-rounded pb-border pb-text-gray-700 pb-flex pb-items-center pb-justify-center pb-transition-colors pb-cursor-pointer pb-border-gray-200 pb-hover:border-blue-400 pb-hover:bg-blue-50"
                          title={label}
                          aria-label={label}
                        >
                          {def.icon && React.cloneElement(def.icon, {
                            className: 'pb-w-8 pb-h-8 pb-text-gray-600'
                          })}
                          <span className="pb-sr-only">{label}</span>
                        </button>

                        {hoveredDef && hoveredDef.type === def.type && (
                          <div className={`pb-absolute pb-bottom-full pb-mb-2 pb-w-max pb-max-w-xs pb-bg-gray-800 pb-text-white pb-text-xs pb-rounded-md pb-shadow-lg pb-p-2 pb-z-20 pb-pointer-events-none ${tooltipPositionClasses}`}>
                            <div className="pb-font-bold">{label}</div>
                            <div>{desc}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
              <section className="pb-grid pb-grid-cols-1 pb-gap-3">
                {displaySaveButton &&
                  <div>
                    <div className="pb-flex pb-items-center pb-justify-between pb-mb-1">
                      {saveButtonClickable &&
                        <button
                          onClick={handleCopy}
                          className="pb-mt-10 pb-w-full pb-px-2 pb-py-1.5 pb-text-md pb-rounded pb-border pb-border-gray-200 pb-bg-gray-900 pb-color-white pb-cursor-pointer"
                          title="Copy to clipboard"
                        >
                          Save
                        </button>
                      }

                      {!saveButtonClickable &&
                        <button
                          disabled
                          onClick={handleCopy}
                          className="pb-mt-10 pb-w-full pb-px-2 pb-py-1.5 pb-text-md pb-rounded pb-border pb-border-gray-200 pb-bg-gray-900 pb-color-white pb-cursor-pointer"
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
