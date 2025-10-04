// path: src/components/blocks/Parallax/ParallaxSettings.tsx
import React, { useState, useMemo } from 'react';
import type { ParallaxComponent, ParallaxComponentProps, ParallaxPage } from '../../../types/components';
import AccordionItem from '../../controls/AccordionItem';
import { useParallaxEditor } from './ParallaxState';

const EditIcon = () => (<svg className="pb-w-4 pb-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const StopIcon = () => (<svg className="pb-w-4 pb-h-4" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>);

const ToggleSwitch: React.FC<{
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ label, enabled, onChange }) => {
  const switchBase = "pb-relative pb-inline-flex pb-h-6 pb-w-11 pb-flex-shrink-0 pb-cursor-pointer pb-rounded-full pb-border-2 pb-border-transparent pb-transition-colors pb-duration-200 pb-ease-in-out pb-focus:outline-none pb-focus:ring-2 pb-focus:ring-blue-500 pb-focus:ring-offset-2";
  const knobBase = "pb-pointer-events-none pb-inline-block pb-h-5 pb-w-5 pb-transform pb-rounded-full pb-bg-white pb-shadow pb-ring-0 pb-transition pb-duration-200 pb-ease-in-out";

  return (
    <div className="pb-flex pb-items-center pb-justify-between pb-p-2 pb-border pb-rounded-md">
      <label className="pb-text-xs pb-font-medium pb-text-gray-700">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`${enabled ? 'pb-bg-blue-500' : 'pb-bg-gray-200'} ${switchBase}`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          aria-hidden="true"
          className={`${enabled ? 'pb-translate-x-5' : 'pb-translate-x-0'} ${knobBase}`}
        />
      </button>
    </div>
  );
};

const LayerSettings: React.FC<{
  page: ParallaxPage;
  pageIndex: number;
  updatePages: (pages: ParallaxPage[]) => void;
  allPages: ParallaxPage[];
}> = ({ page, pageIndex, updatePages, allPages }) => {

  const activeBgType = useMemo(() => {
    if (page.backgroundColor) {
      return page.backgroundColor === 'transparent' ? 'transparent' : 'color';
    }
    return 'image';
  }, [page.backgroundColor]);

  const handleUpdatePage = (updatedPage: ParallaxPage) => {
    const newPages = allPages.map((p, i) => (i === pageIndex ? updatedPage : p));
    updatePages(newPages);
  };

  const handleBgTypeChange = (type: 'color' | 'image' | 'transparent') => {
    switch (type) {
      case 'color':
        handleUpdatePage({ ...page, backgroundImageUrl: '', backgroundColor: '#ffffff' });
        break;
      case 'image':
        handleUpdatePage({ ...page, backgroundColor: '' });
        break;
      case 'transparent':
        handleUpdatePage({ ...page, backgroundImageUrl: '', backgroundColor: 'transparent' });
        break;
    }
  };

  const SegmentedButton: React.FC<{ label: string, type: 'color' | 'image' | 'transparent' }> = ({ label, type }) => (
    <button
      onClick={() => handleBgTypeChange(type)}
      className={`pb-flex-1 pb-py-1 pb-px-2 pb-text-xs pb-font-semibold pb-rounded-md pb-transition-colors ${activeBgType === type
        ? 'pb-bg-blue-500 pb-text-white pb-shadow-sm'
        : 'pb-bg-gray-200 pb-text-gray-700 pb-hover:bg-gray-300'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="pb-space-y-4">
      <div>
        <label className="pb-block pb-text-xs pb-font-medium pb-text-gray-500">Layer Depth</label>
        <input
          type="number"
          step="0.5"
          value={page.depth || 0}
          onChange={e => handleUpdatePage({ ...page, depth: parseFloat(e.target.value) })}
          className="pb-w-full pb-mt-1 pb-p-2 pb-border pb-rounded-md pb-text-xs"
        />
      </div>

      <div className="pb-bg-white pb-rounded-lg pb-p-3 pb-space-y-3">
        <label className="pb-block pb-text-xs pb-font-medium pb-text-gray-800">Background Type</label>
        <div className="pb-flex pb-items-center pb-space-x-1 pb-bg-gray-100 pb-p-1 pb-rounded-lg">
          <SegmentedButton label="Color" type="color" />
          <SegmentedButton label="Image" type="image" />
          <SegmentedButton label="Transparent" type="transparent" />
        </div>

        {activeBgType === 'color' && (
          <div className="pb-flex pb-items-center pb-space-x-2 pt-2">
            <input
              type="color"
              value={page.backgroundColor || '#ffffff'}
              onChange={e => handleUpdatePage({ ...page, backgroundColor: e.target.value })}
              className="pb-w-10 pb-h-10 pb-p-0 pb-border-none pb-rounded-md pb-cursor-pointer"
            />
            <span className="pb-text-sm pb-font-mono pb-text-gray-600">{page.backgroundColor}</span>
          </div>
        )}
        {activeBgType === 'image' && (
          <div className="pb-pt-2">
            <label className="pb-block pb-text-xs pb-font-medium pb-text-gray-500 pb-mb-1">Image URL</label>
            <input
              type="text"
              value={page.backgroundImageUrl || ''}
              onChange={(e) => handleUpdatePage({ ...page, backgroundImageUrl: e.target.value })}
              placeholder="https://..."
              className="pb-w-full pb-p-2 pb-border pb-rounded-md pb-text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
};


export const ParallaxSettings: React.FC<{
  component: ParallaxComponent,
  updateComponent: (id: number, newProps: Partial<ParallaxComponentProps>) => void;
}> = ({ component, updateComponent }) => {
  const { liveComponent, editingLayerId, setLiveComponent, setEditingLayerId } = useParallaxEditor(component);

  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(0);

  const currentComponent = liveComponent || component;
  const { id, props } = currentComponent;
  const { is3DEnabled = true, containerHeightUnit = 'vh' } = props;

  const handleEditClick = (layerId: number) => {
    const newEditingId = editingLayerId === layerId ? null : layerId;
    setEditingLayerId(newEditingId);
  };

  const handlePropChange = <K extends keyof ParallaxComponentProps>(prop: K, value: ParallaxComponentProps[K]) => {
    const newProps = { ...props, [prop]: value };
    setLiveComponent({ ...currentComponent, props: newProps });
    updateComponent(id, newProps);
  };

  const updatePages = (newPages: ParallaxPage[]) => {
    handlePropChange('pages', newPages);
  };

  const addPage = () => {
    const newPage: ParallaxPage = { id: Date.now(), height: 100, components: [], backgroundColor: '#ffffff', depth: (props.pages?.length || 0) * -2, };
    const newPages = [...(props.pages || []), newPage];
    updatePages(newPages);
    setOpenAccordionIndex(newPages.length - 1);
  };

  const removePage = (pageIndex: number) => {
    if (props.pages[pageIndex].id === editingLayerId) {
      setEditingLayerId(null);
    }
    const newPages = props.pages.filter((_, index) => index !== pageIndex);
    updatePages(newPages);
    if (openAccordionIndex === pageIndex) {
      setOpenAccordionIndex(null);
    }
  };

  return (
    <div className="pb-bg-gray-100 pb-p-2">
      <div className="pb-space-y-4 pb-p-3 pb-mb-2 pb-bg-white pb-border pb-border-gray-200 pb-rounded-lg">
        <h3 className="pb-text-sm pb-font-semibold pb-text-gray-800">Global Parallax Settings</h3>
        <div>
          <label className="pb-block pb-text-xs pb-font-medium pb-text-gray-500 pb-mb-1">Total Canvas Height</label>
          <div className="pb-flex pb-space-x-2">
            <input
              type="number"
              value={props.containerHeight || 100}
              onChange={e => handlePropChange('containerHeight', Number(e.target.value))}
              className="pb-flex-grow pb-p-2 pb-border pb-rounded-md pb-text-xs"
            />
            <select
              value={containerHeightUnit}
              onChange={e => handlePropChange('containerHeightUnit', e.target.value as 'px' | '%' | 'vh')}
              className="pb-p-2 pb-border pb-rounded-md pb-text-xs pb-bg-white"
            >
              <option value="px">px</option>
              <option value="%">%</option>
              <option value="vh">vh</option>
            </select>
          </div>
        </div>

        <ToggleSwitch
          label="Enable 3D Effect"
          enabled={is3DEnabled}
          onChange={(newValue) => handlePropChange('is3DEnabled', newValue)}
        />

      </div>
      <h3 className="pb-text-sm pb-font-semibold pb-text-gray-800 pb-p-1">Layers</h3>
      <div className="pb-border pb-border-gray-200 pb-rounded-lg pb-overflow-hidden">
        {props.pages.map((page, index) => {
          const isEditingThisLayer = editingLayerId === page.id;
          return (
            <AccordionItem key={page.id} title={`Layer ${index + 1}`} isOpen={openAccordionIndex === index} onClick={() => setOpenAccordionIndex(openAccordionIndex === index ? null : index)} summary={<div className="pb-flex pb-items-center pb-space-x-2 pb-divide-x"><span className="pb-pr-2 pb-truncate">Depth: {page.depth || 0}</span><span className="pb-pl-2">Components: {page.components.length}</span></div>}>
              <div className="pb-space-y-4">
                <button onClick={() => handleEditClick(page.id)} className={`pb-w-full pb-flex pb-items-center pb-justify-center pb-gap-2 pb-text-sm pb-font-semibold pb-text-white pb-rounded-md pb-p-2 pb-cursor-pointer pb-select-none pb-transition-colors ${isEditingThisLayer ? 'pb-bg-red-500 pb-hover:bg-red-600' : 'pb-bg-blue-500 pb-hover:bg-blue-600'}`}>
                  {isEditingThisLayer ? <><StopIcon /> Stop Editing</> : <><EditIcon /> Edit This Layer</>}
                </button>
                <div style={{ pointerEvents: editingLayerId !== null && !isEditingThisLayer ? 'none' : 'auto', opacity: editingLayerId !== null && !isEditingThisLayer ? 0.5 : 1 }}>

                  <LayerSettings page={page} pageIndex={index} allPages={props.pages} updatePages={updatePages} />

                  <button onClick={() => removePage(index)} className="pb-w-full pb-text-center pb-text-xs pb-font-semibold pb-text-red-600 pb-hover:bg-red-100 pb-p-2 pb-rounded-md pb-mt-4">Remove Layer {index + 1}</button>
                </div>
              </div>
            </AccordionItem>
          );
        })}
      </div>
      <div className="pb-p-2"><button onClick={addPage} className="pb-w-full pb-mt-2 pb-px-4 pb-py-2 pb-text-sm pb-font-semibold pb-text-white pb-bg-blue-500 pb-rounded-md pb-hover:bg-blue-600">Add New Layer</button></div>
    </div>
  );
};
