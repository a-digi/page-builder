// path: src/components/blocks/Image/ImageSettings.tsx
import { useState, useCallback } from 'react';
import { useComponentContext } from '../../../hooks/useComponentContext';
import { Accordion } from './Accordion';
import { CropModal } from './CropModal';
import { filterOptions, filterStyles, customFilterOptions, defaultCustomFilters } from './model/settings';
import type { ImageComponent, ImageComponentProps } from '../../../types/components';

export const settingsIcon = (
  <svg
    className="w-6 h-6 flex-shrink-0 text-gray-700"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M12.25 21.75H5.25C4.42157 21.75 3.75 21.0784 3.75 20.25V5.25C3.75 4.42157 4.42157 3.75 5.25 3.75H18.75C19.5784 3.75 20.25 4.42157 20.25 5.25V11.25M4.5 17.25L9 12.75C9.37258 12.3774 9.97742 12.3774 10.35 12.75L14.25 16.5M14.25 10.5C15.0784 10.5 15.75 9.82843 15.75 9C15.75 8.17157 15.0784 7.5 14.25 7.5C13.4216 7.5 12.75 8.17157 12.75 9C12.75 9.82843 13.4216 10.5 14.25 10.5ZM19.5 14.25V21.75M15.75 18H23.25"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


// Icons for the accordion menus
const sourceIcon = (<svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899A4 4 0 0010.172 13.83l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>);
const cropIcon = (<svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 1H3a2 2 0 0 0-2 2v4m14-6h4a2 2 0 0 1 2 2v4m0 8v4a2 2 0 0 1-2 2h-4M7 23H3a2 2 0 0 1-2-2v-4" /></svg>);
const propertiesIcon = (<svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-5 5a2 2 0 0 1-2.828 0l-7-7A2 2 0 0 1 3 8V3z" /></svg>);
const shapeIcon = (<svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.024a8.976 8.976 0 0 1-8.976 8.976A8.976 8.976 0 0 1 3 15.024m18 0V3H3v12.024" /></svg>);
const filtersIcon = (<svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21.74,11.74-8-8a2,2,0,0,0-2.83,0l-8,8a2,2,0,0,0,0,2.83l8,8a2,2,0,0,0,2.83,0l8-8a2,2,0,0,0,0-2.83Z" /><line x1="12" x2="12" y1="3" y2="21" /></svg>);
const customAdjustmentsIcon = (<svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m8-8h2M4 12H2m15.364 6.364l1.414 1.414M4.222 4.222l1.414 1.414M19.778 4.222l-1.414 1.414M8.636 15.364l-1.414 1.414M12 16a4 4 0 110-8 4 4 0 010 8z"></path></svg>);


export const ImageSettings = ({ component }: { component: ImageComponent }) => {
  const { updateComponent } = useComponentContext();
  const [isCropping, setIsCropping] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('Image Source');
  const { id, props } = component;

  const handleAccordionClick = (title: string) => {
    setOpenAccordion(prev => (prev === title ? null : title));
  };

  const getFilterName = (value?: string) => {
    return filterOptions.find(f => f.value === value)?.name || 'None';
  };

  const handlePropChange = <K extends keyof ImageComponentProps>(
    prop: K,
    value: ImageComponentProps[K]
  ) => {
    updateComponent(id, { [prop]: value });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateComponent(id, { externalImageUrl: e.target.value, url: '' });
  };

  const clearUrl = () => {
    updateComponent(id, { externalImageUrl: '', url: '' });
  };

  const handleCustomFilterChange = (filterProp: string, value: number) => {
    const newCustomFilters = {
      ...(props.customFilters || defaultCustomFilters),
      [filterProp]: value,
    };
    updateComponent(id, {
      customFilters: newCustomFilters,
      filter: 'custom'
    });
  };

  const handleResetCustomFilters = () => {
    updateComponent(id, {
      customFilters: { ...defaultCustomFilters },
      filter: 'none'
    });
  };

  const handleCrop = useCallback((croppedImageUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const newImageWidth = img.naturalWidth;
      const newImageHeight = img.naturalHeight;
      if (typeof props.width !== 'number') return;

      if (newImageWidth > 0) {
        const newAspectRatio = newImageHeight / newImageWidth;
        const newComponentHeight = Math.round(props.width * newAspectRatio);
        updateComponent(id, {
          url: croppedImageUrl,
          externalImageUrl: '',
          width: props.width,
          height: newComponentHeight,
        });
      }
    };
    img.src = croppedImageUrl;
    setIsCropping(false);
  }, [id, props.width, updateComponent]);

  const shapeSummary = (props.shape === 'circle' ? 'Circle' : 'Rectangle');
  const altSummary = props.alt || 'No alt text';
  const sourceSummary = props.externalImageUrl ? 'External URL' : (props.url ? 'Uploaded' : 'None');

  return (
    <>
      <div className="border-t border-gray-200">
        <Accordion
          title="Image Source"
          isOpen={openAccordion === 'Image Source'}
          onClick={() => handleAccordionClick('Image Source')}
          summary={<span>{sourceSummary}</span>}
          icon={sourceIcon}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <div className="flex items-center">
            <input
              type="text"
              value={props.externalImageUrl || ''}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.png"
              className="mt-1 p-1.5 border rounded-l-md w-full text-sm"
            />
            <button onClick={clearUrl} title="Clear URL and stored image" className="mt-1 bg-gray-200 hover:bg-gray-300 text-xs font-semibold p-[9px] rounded-r-md border border-l-0">
              Clear
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {props.url ? 'An uploaded (base64) image is also stored. Setting a URL will override it.' : 'Enter an external image URL.'}
          </p>
        </Accordion>

        {props.url && (
          <Accordion
            title="Crop"
            isOpen={openAccordion === 'Crop'}
            onClick={() => handleAccordionClick('Crop')}
            icon={cropIcon}
          >
            <button
              onClick={() => setIsCropping(true)}
              className="w-full bg-blue-500 text-white rounded-md px-3 py-2 text-sm font-semibold hover:bg-blue-600"
            >
              Crop Image
            </button>
            <p className="text-xs text-gray-500 mt-2">Cropping is only available for uploaded images, not external URLs.</p>
          </Accordion>
        )}

        <Accordion
          title="Properties"
          isOpen={openAccordion === 'Properties'}
          onClick={() => handleAccordionClick('Properties')}
          summary={<span>{altSummary}</span>}
          icon={propertiesIcon}
        >
          <label className="flex flex-col text-sm font-medium text-gray-700">
            Alt Text
            <input
              type="text"
              value={props.alt || ''}
              onChange={(e) => handlePropChange('alt', e.target.value)}
              className="mt-1 p-1.5 border rounded-md w-full"
            />
          </label>
        </Accordion>

        <Accordion
          title="Shape"
          isOpen={openAccordion === 'Shape'}
          onClick={() => handleAccordionClick('Shape')}
          summary={<span className="capitalize">{shapeSummary}</span>}
          icon={shapeIcon}
        >
          <div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handlePropChange('shape', 'rect')}
                className={`flex h-10 w-10 items-center justify-center rounded-md border-2 transition-colors ${(props.shape === 'rect' || !props.shape)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
                aria-label="Rectangle Shape"
                title="Rectangle"
              ><svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20"><rect x="2" y="4" width="16" height="12" rx="1" fill="currentColor" /></svg></button>
              <button
                type="button"
                onClick={() => handlePropChange('shape', 'circle')}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${props.shape === 'circle'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
                aria-label="Circle Shape"
                title="Circle"
              ><svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="currentColor" /></svg></button>
            </div>
          </div>
        </Accordion>

        <Accordion
          title="Filters"
          isOpen={openAccordion === 'Filters'}
          onClick={() => handleAccordionClick('Filters')}
          summary={<span>{getFilterName(props.filter)}</span>}
          icon={filtersIcon}
        >
          <div className="grid grid-cols-3 gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => handlePropChange('filter', filter.value as ImageComponentProps['filter'])}
                className={`flex flex-col items-center justify-start p-1 rounded-md border-2 transition-colors
                    ${(props.filter || 'none') === filter.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-transparent hover:bg-gray-100 hover:border-gray-200'
                  }`}
              >
                <div className="w-full h-12 mb-1 overflow-hidden rounded border border-gray-200">
                  <div
                    className="h-full w-full bg-gradient-to-br from-blue-400 via-pink-400 to-yellow-400"
                    style={{ filter: filter.value === 'custom' ? '' : filterStyles[filter.value] }}
                  />
                </div>
                <span className="text-xs text-center text-gray-700">{filter.name}</span>
              </button>
            ))}
          </div>
        </Accordion>
        <Accordion
          title="Custom Adjustments"
          isOpen={openAccordion === 'Custom Adjustments'}
          onClick={() => handleAccordionClick('Custom Adjustments')}
          icon={customAdjustmentsIcon}
        >
          <div className='space-y-4'>
            {customFilterOptions.map(option => (
              <div key={option.prop} className="flex flex-col">
                <label htmlFor={option.prop} className="flex justify-between items-center mb-1 text-sm font-medium text-gray-700">
                  <span>{option.name}</span>
                  <span className='text-gray-500 font-normal'>{(props.customFilters?.[option.prop] ?? option.defaultValue).toFixed(2)}</span>
                </label>
                <input
                  id={option.prop}
                  type="range"
                  min={option.min}
                  max={option.max}
                  step={option.step}
                  value={props.customFilters?.[option.prop] ?? option.defaultValue}
                  onChange={(e) => handleCustomFilterChange(option.prop, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
            <button
              onClick={handleResetCustomFilters}
              className="w-full mt-4 bg-gray-200 text-gray-700 rounded-md px-3 py-2 text-sm font-semibold hover:bg-gray-300"
            >
              Reset Adjustments
            </button>
          </div>
        </Accordion>
      </div>

      {isCropping && props.url && (
        <CropModal
          imageUrl={props.url}
          onClose={() => setIsCropping(false)}
          onCrop={handleCrop}
          initialShape={props.shape}
        />
      )}
    </>
  );
};
