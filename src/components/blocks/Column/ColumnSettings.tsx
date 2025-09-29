// path: src/components/blocks/Column/ColumnSettings.tsx
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
    return (
      <button
        type="button"
        onClick={() => setActiveColumnIndex(index)}
        className={`px-3 py-2 text-sm font-medium focus:outline-none ${isActive
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-800 cursor-pointer hover:text-gray-700 hover:bg-gray-200'
          }`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="flex flex-col relative">
      <div>
        <nav className="flex justify-start px-6 py-2 top-10" aria-label="Tabs">
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

      <div className='pb-4'>
        {activeColumnIndex === null ? (
          <div className="mt-4 pt-4 px-8">
            <h4 className="text-base font-medium text-gray-800 mb-4">Number of Columns</h4>
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
