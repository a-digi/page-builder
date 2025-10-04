// path: src/components/blocks/Image/ImageSettings.tsx
import { useState, useCallback } from 'react';
import { useComponentContext } from '../../../hooks/useComponentContext';
import { Accordion } from './Accordion';
import { CropModal } from './CropModal';
import { filterOptions, filterStyles, customFilterOptions, defaultCustomFilters } from './model/settings';
import type { ImageComponent, ImageComponentProps } from '../../../types/components';

export const settingsIcon = (
  <svg
    className="pb-w-6 pb-h-6 pb-flex-shrink-0 pb-text-gray-700"
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
const sourceIcon = (<svg className="pb-w-5 pb-h-5 pb-text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899A4 4 0 0010.172 13.83l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>);
const cropIcon = (<svg className="pb-w-5 pb-h-5 pb-text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 1H3a2 2 0 0 0-2 2v4m14-6h4a2 2 0 0 1 2 2v4m0 8v4a2 2 0 0 1-2 2h-4M7 23H3a2 2 0 0 1-2-2v-4" /></svg>);
const propertiesIcon = (<svg className="pb-w-5 pb-h-5 pb-text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-5 5a2 2 0 0 1-2.828 0l-7-7A2 2 0 0 1 3 8V3z" /></svg>);
const shapeIcon = (<svg className="pb-w-5 pb-h-5 pb-text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.024a8.976 8.976 0 0 1-8.976 8.976A8.976 8.976 0 0 1 3 15.024m18 0V3H3v12.024" /></svg>);
const filtersIcon = (<svg className="pb-w-5 pb-h-5 pb-text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21.74,11.74-8-8a2,2,0,0,0-2.83,0l-8,8a2,2,0,0,0,0,2.83l8,8a2,2,0,0,0,2.83,0l8-8a2,2,0,0,0,0-2.83Z" /><line x1="12" x2="12" y1="3" y2="21" /></svg>);
const customAdjustmentsIcon = (<svg className="pb-w-5 pb-h-5 pb-text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m8-8h2M4 12H2m15.364 6.364l1.414 1.414M4.222 4.222l1.414 1.414M19.778 4.222l-1.414 1.414M8.636 15.364l-1.414 1.414M12 16a4 4 0 110-8 4 4 0 010 8z"></path></svg>);


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
      <div className="pb-border-t pb-border-gray-200">
        <Accordion
          title="Image Source"
          isOpen={openAccordion === 'Image Source'}
          onClick={() => handleAccordionClick('Image Source')}
          summary={<span>{sourceSummary}</span>}
          icon={sourceIcon}
        >
          <label className="pb-block pb-text-sm pb-font-medium pb-text-gray-700 pb-mb-1">Image URL</label>
          <div className="pb-flex pb-items-center">
            <input
              type="text"
              value={props.externalImageUrl || ''}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.png"
              className="pb-mt-1 pb-p-1.5 pb-border pb-rounded-l-md pb-w-full pb-text-sm"
            />
            <button onClick={clearUrl} title="Clear URL and stored image" className="pb-mt-1 pb-bg-gray-200 pb-hover:bg-gray-300 pb-text-xs pb-font-semibold pb-p-[9px] pb-rounded-r-md pb-border pb-border-l-0">
              Clear
            </button>
          </div>
          <p className="pb-text-xs pb-text-gray-500 pb-mt-1">
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
              className="pb-w-full pb-bg-blue-500 pb-text-white pb-rounded-md pb-px-3 pb-py-2 pb-text-sm pb-font-semibold pb-hover:bg-blue-600"
            >
              Crop Image
            </button>
            <p className="pb-text-xs pb-text-gray-500 pb-mt-2">Cropping is only available for uploaded images, not external URLs.</p>
          </Accordion>
        )}

        <Accordion
          title="Properties"
          isOpen={openAccordion === 'Properties'}
          onClick={() => handleAccordionClick('Properties')}
          summary={<span>{altSummary}</span>}
          icon={propertiesIcon}
        >
          <label className="pb-flex pb-flex-col pb-text-sm pb-font-medium pb-text-gray-700">
            Alt Text
            <input
              type="text"
              value={props.alt || ''}
              onChange={(e) => handlePropChange('alt', e.target.value)}
              className="pb-mt-1 pb-p-1.5 pb-border pb-rounded-md pb-w-full"
            />
          </label>
        </Accordion>

        <Accordion
          title="Shape"
          isOpen={openAccordion === 'Shape'}
          onClick={() => handleAccordionClick('Shape')}
          summary={<span className="pb-capitalize">{shapeSummary}</span>}
          icon={shapeIcon}
        >
          <div>
            <div className="pb-flex pb-items-center pb-space-x-2">
              <button
                type="button"
                onClick={() => handlePropChange('shape', 'rect')}
                className={`pb-flex pb-h-10 pb-w-10 pb-items-center pb-justify-center pb-rounded-md pb-border-2 pb-transition-colors ${(props.shape === 'rect' || !props.shape)
                  ? 'pb-border-blue-500 pb-bg-blue-50'
                  : 'pb-border-gray-300 pb-hover:border-gray-400'
                  }`}
                aria-label="Rectangle Shape"
                title="Rectangle"
              ><svg className="pb-w-5 pb-h-5 pb-text-gray-600" viewBox="0 0 20 20"><rect x="2" y="4" width="16" height="12" rx="1" fill="currentColor" /></svg></button>
              <button
                type="button"
                onClick={() => handlePropChange('shape', 'circle')}
                className={`pb-flex pb-h-10 pb-w-10 pb-items-center pb-justify-center pb-rounded-full pb-border-2 pb-transition-colors ${props.shape === 'circle'
                  ? 'pb-border-blue-500 pb-bg-blue-50'
                  : 'pb-border-gray-300 pb-hover:border-gray-400'
                  }`}
                aria-label="Circle Shape"
                title="Circle"
              ><svg className="pb-w-5 pb-h-5 pb-text-gray-600" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="currentColor" /></svg></button>
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
          <div className="pb-grid pb-grid-cols-3 pb-gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => handlePropChange('filter', filter.value as ImageComponentProps['filter'])}
                className={`pb-flex pb-flex-col pb-items-center pb-justify-start pb-p-1 pb-rounded-md pb-border-2 pb-transition-colors
                    ${(props.filter || 'none') === filter.value
                    ? 'pb-border-blue-500 pb-bg-blue-50'
                    : 'pb-border-transparent pb-hover:bg-gray-100 pb-hover:border-gray-200'
                  }`}
              >
                <div className="pb-w-full pb-h-12 pb-mb-1 pb-overflow-hidden pb-rounded pb-border pb-border-gray-200">
                  <div
                    className="pb-h-full pb-w-full pb-bg-gradient-to-br pb-from-blue-400 pb-via-pink-400 pb-to-yellow-400"
                    style={{ filter: filter.value === 'custom' ? '' : filterStyles[filter.value] }}
                  />
                </div>
                <span className="pb-text-xs pb-text-center pb-text-gray-700">{filter.name}</span>
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
          <div className='pb-space-y-4'>
            {customFilterOptions.map(option => (
              <div key={option.prop} className="pb-flex pb-flex-col">
                <label htmlFor={option.prop} className="pb-flex pb-justify-between pb-items-center pb-mb-1 pb-text-sm pb-font-medium pb-text-gray-700">
                  <span>{option.name}</span>
                  <span className='pb-text-gray-500 pb-font-normal'>{(props.customFilters?.[option.prop] ?? option.defaultValue).toFixed(2)}</span>
                </label>
                <input
                  id={option.prop}
                  type="range"
                  min={option.min}
                  max={option.max}
                  step={option.step}
                  value={props.customFilters?.[option.prop] ?? option.defaultValue}
                  onChange={(e) => handleCustomFilterChange(option.prop, parseFloat(e.target.value))}
                  className="pb-w-full pb-h-2 pb-bg-gray-200 pb-rounded-lg pb-appearance-none pb-cursor-pointer"
                />
              </div>
            ))}
            <button
              onClick={handleResetCustomFilters}
              className="pb-w-full pb-mt-4 pb-bg-gray-200 pb-text-gray-700 pb-rounded-md pb-px-3 pb-py-2 pb-text-sm pb-font-semibold pb-hover:bg-gray-300"
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
