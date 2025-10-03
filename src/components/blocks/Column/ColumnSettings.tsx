// path: src/components/page-builder/components/blocks/Column/ColumnSettings.tsx
import React, { useState, useMemo, useCallback } from 'react';
import type { BaseComponentProps, ColumnComponent, ColumnComponentProps, PaddingProps, MarginProps, PageComponent } from '../../../types/components';
import { SettingsPanel } from '../../controls/SettingsPanel';
import ColumnSelector from './ColumnSelector';
import { parseStyles } from './model/styles';
import { ButtonGroup } from '../../controls/ButtonGroup';

const ColumnBlockSettings: React.FC<{
  component: ColumnComponent;
  updateComponent: (id: number, props: Partial<ColumnComponentProps>) => void;
}> = ({ component, updateComponent }) => {
  const [activeColumnIndex, setActiveColumnIndex] = useState<number | null>(null);

  const props = component.props;
  const id = component.id;

  const proxyColumnComponent = useMemo<PageComponent<any, any> | null>(() => {
    if (activeColumnIndex === null) return null;

    const colPadding = props.colPaddings?.[activeColumnIndex] || {};
    const colMargin = props.colMargins?.[activeColumnIndex] || {};

    return {
      id: component.id,
      type: `proxy-col-${activeColumnIndex}`,
      props: {
        containerClasses: props.colClasses?.[activeColumnIndex] || '',
        containerStyles: props.colStyles?.[activeColumnIndex] || '',
        containerBackgroundColor: props.colColors?.[activeColumnIndex],
        textColor: props.colTextColors?.[activeColumnIndex],
        fullHeight: props.colFullHeight?.[activeColumnIndex],
        ...colPadding,
        ...colMargin
      }
    };
  }, [activeColumnIndex, component, props]);

  const handleColumnUpdate = useCallback((updatedColumnProps: Partial<BaseComponentProps>) => {
    if (activeColumnIndex === null) return;

    const {
      containerClasses, containerStyles, containerBackgroundColor,
      paddingTop, paddingRight, paddingBottom, paddingLeft,
      marginTop, marginRight, marginBottom, marginLeft,
      fullHeight, textColor, ...restCustomProps
    } = updatedColumnProps;

    const updateArrayProp = <T,>(propName: keyof ColumnComponentProps, value: T) => {
      const newArray = [...((props[propName] as T[] | undefined) || [])];
      newArray[activeColumnIndex] = value;
      return { [propName]: newArray };
    };

    let finalUpdate: Partial<ColumnComponentProps> = { ...restCustomProps };

    if ('containerClasses' in updatedColumnProps) finalUpdate = { ...finalUpdate, ...updateArrayProp('colClasses', containerClasses) };
    if ('containerStyles' in updatedColumnProps) finalUpdate = { ...finalUpdate, ...updateArrayProp('colStyles', containerStyles) };
    if ('containerBackgroundColor' in updatedColumnProps) finalUpdate = { ...finalUpdate, ...updateArrayProp('colColors', containerBackgroundColor) };
    if ('fullHeight' in updatedColumnProps) finalUpdate = { ...finalUpdate, ...updateArrayProp('colFullHeight', fullHeight) };
    if ('textColor' in updatedColumnProps) finalUpdate = { ...finalUpdate, ...updateArrayProp('colTextColors', textColor) };

    const paddingKeys: (keyof PaddingProps)[] = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];
    if (paddingKeys.some(key => key in updatedColumnProps)) {
      const newPaddingsArray = [...(props.colPaddings || [])];
      const currentPadding = newPaddingsArray[activeColumnIndex] || {};
      const newPadding: PaddingProps = {
        paddingTop: 'paddingTop' in updatedColumnProps ? paddingTop : currentPadding.paddingTop,
        paddingRight: 'paddingRight' in updatedColumnProps ? paddingRight : currentPadding.paddingRight,
        paddingBottom: 'paddingBottom' in updatedColumnProps ? paddingBottom : currentPadding.paddingBottom,
        paddingLeft: 'paddingLeft' in updatedColumnProps ? paddingLeft : currentPadding.paddingLeft,
      };
      newPaddingsArray[activeColumnIndex] = newPadding;
      finalUpdate.colPaddings = newPaddingsArray;
    }

    const marginKeys: (keyof MarginProps)[] = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
    if (marginKeys.some(key => key in updatedColumnProps)) {
      const newMarginsArray = [...(props.colMargins || [])];
      const currentMargin = newMarginsArray[activeColumnIndex] || {};
      const newMargin: MarginProps = {
        marginTop: 'marginTop' in updatedColumnProps ? marginTop : currentMargin.marginTop,
        marginRight: 'marginRight' in updatedColumnProps ? marginRight : currentMargin.marginRight,
        marginBottom: 'marginBottom' in updatedColumnProps ? marginBottom : currentMargin.marginBottom,
        marginLeft: 'marginLeft' in updatedColumnProps ? marginLeft : currentMargin.marginLeft,
      };
      newMarginsArray[activeColumnIndex] = newMargin;
      finalUpdate.colMargins = newMarginsArray;
    }

    if (Object.keys(finalUpdate).length > 0) {
      updateComponent(id, finalUpdate);
    }
  }, [activeColumnIndex, props, id, updateComponent]);

  const TabButton: React.FC<{ index: number | null, children: React.ReactNode }> = ({ index, children }) => {
    const isActive = activeColumnIndex === index;
    const buttonClasses = `pb-px-3 pb-py-2 pb-text-sm pb-font-medium pb-focus:outline-none ${isActive
      ? 'pb-bg-gray-200 pb-text-gray-900'
      : 'pb-text-gray-800 pb-cursor-pointer pb-hover:text-gray-700 pb-hover:bg-gray-200'
      }`;
    return (
      <button
        type="button"
        onClick={() => setActiveColumnIndex(index)}
        className={buttonClasses}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="pb-flex pb-flex-col pb-relative">
      <div>
        <nav className="pb-flex pb-justify-start pb-px-6 pb-py-2 pb-top-10" aria-label="Tabs">
          <ButtonGroup>
            <TabButton index={null}>Main</TabButton>
            {Array.from({ length: component.props.numCols }).map((_, i) => (
              <TabButton key={i} index={i}>
                Col {i + 1}
              </TabButton>
            ))}
          </ButtonGroup>
        </nav>
      </div>

      <div className='pb-pb-4'>
        {activeColumnIndex === null ? (
          <div className="pb-mt-4 pb-pt-4 pb-px-8">
            <h4 className="pb-text-base pb-font-medium pb-text-gray-800 pb-mb-4">Number of Columns</h4>
            <ColumnSelector
              value={component.props.numCols}
              onChange={(numCols) => updateComponent(component.id, { numCols })}
              min={1}
              max={12}
            />
          </div>
        ) : (
          proxyColumnComponent && (
            <SettingsPanel
              settingsOnly={true}
              style={parseStyles('')}
              component={proxyColumnComponent}
              onUpdate={handleColumnUpdate}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ColumnBlockSettings;
