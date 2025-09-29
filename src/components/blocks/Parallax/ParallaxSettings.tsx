// path: src/components/blocks/Parallax/ParallaxSettings.tsx
import React, { useState, useMemo } from 'react';
import type { ParallaxComponent, ParallaxComponentProps, ParallaxPage } from '../../../types/components';
import AccordionItem from '../../controls/AccordionItem';
import { useParallaxEditor } from './ParallaxState';

const EditIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const StopIcon = () => (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>);

const ToggleSwitch: React.FC<{
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between p-2 border rounded-md">
    <label className="text-xs font-medium text-gray-700">{label}</label>
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`${enabled ? 'bg-blue-500' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        aria-hidden="true"
        className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);

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
      className={`flex-1 py-1 px-2 text-xs font-semibold rounded-md transition-colors ${activeBgType === type
        ? 'bg-blue-500 text-white shadow-sm'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500">Layer Depth</label>
        <input
          type="number"
          step="0.5"
          value={page.depth || 0}
          onChange={e => handleUpdatePage({ ...page, depth: parseFloat(e.target.value) })}
          className="w-full mt-1 p-2 border rounded-md text-xs"
        />
      </div>

      <div className="bg-white rounded-lg p-3 space-y-3">
        <label className="block text-xs font-medium text-gray-800">Background Type</label>
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
          <SegmentedButton label="Color" type="color" />
          <SegmentedButton label="Image" type="image" />
          <SegmentedButton label="Transparent" type="transparent" />
        </div>

        {activeBgType === 'color' && (
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="color"
              value={page.backgroundColor || '#ffffff'}
              onChange={e => handleUpdatePage({ ...page, backgroundColor: e.target.value })}
              className="w-10 h-10 p-0 border-none rounded-md cursor-pointer"
            />
            <span className="text-sm font-mono text-gray-600">{page.backgroundColor}</span>
          </div>
        )}
        {activeBgType === 'image' && (
          <div className="pt-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
            <input
              type="text"
              value={page.backgroundImageUrl || ''}
              onChange={(e) => handleUpdatePage({ ...page, backgroundImageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full p-2 border rounded-md text-xs"
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
    <div className="bg-gray-100 p-2">
      <div className="space-y-4 p-3 mb-2 bg-white border border-gray-200 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-800">Global Parallax Settings</h3>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Total Canvas Height</label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={props.containerHeight || 100}
              onChange={e => handlePropChange('containerHeight', Number(e.target.value))}
              className="flex-grow p-2 border rounded-md text-xs"
            />
            <select
              value={containerHeightUnit}
              onChange={e => handlePropChange('containerHeightUnit', e.target.value as 'px' | '%' | 'vh')}
              className="p-2 border rounded-md text-xs bg-white"
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
      <h3 className="text-sm font-semibold text-gray-800 p-1">Layers</h3>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {props.pages.map((page, index) => {
          const isEditingThisLayer = editingLayerId === page.id;
          return (
            <AccordionItem key={page.id} title={`Layer ${index + 1}`} isOpen={openAccordionIndex === index} onClick={() => setOpenAccordionIndex(openAccordionIndex === index ? null : index)} summary={<div className="flex items-center space-x-2 divide-x"><span className="pr-2 truncate">Depth: {page.depth || 0}</span><span className="pl-2">Components: {page.components.length}</span></div>}>
              <div className="space-y-4">
                <button onClick={() => handleEditClick(page.id)} className={`w-full flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-md p-2 cursor-pointer select-none transition-colors ${isEditingThisLayer ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                  {isEditingThisLayer ? <><StopIcon /> Stop Editing</> : <><EditIcon /> Edit This Layer</>}
                </button>
                <div style={{ pointerEvents: editingLayerId !== null && !isEditingThisLayer ? 'none' : 'auto', opacity: editingLayerId !== null && !isEditingThisLayer ? 0.5 : 1 }}>

                  <LayerSettings page={page} pageIndex={index} allPages={props.pages} updatePages={updatePages} />

                  <button onClick={() => removePage(index)} className="w-full text-center text-xs font-semibold text-red-600 hover:bg-red-100 p-2 rounded-md mt-4">Remove Layer {index + 1}</button>
                </div>
              </div>
            </AccordionItem>
          );
        })}
      </div>
      <div className="p-2"><button onClick={addPage} className="w-full mt-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600">Add New Layer</button></div>
    </div>
  );
};
