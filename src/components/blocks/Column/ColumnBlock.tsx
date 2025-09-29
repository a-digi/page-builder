// path: src/components/blocks/Column/ColumnBlock.tsx
import React, { useState, useCallback, memo, Suspense, useRef, useEffect, useMemo, useContext, useLayoutEffect } from 'react';
import type { ColumnComponent as ColumnComponent, PageComponent } from '../../../types/components';
import { useComponentContext } from '../../../hooks/useComponentContext';
import { useComponentRegistry, type ComponentDefinition } from '../../../contexts/ComponentRegistry';
import { CustomButtonsContext as EditorCustomButtonsContext } from '../../editor/Editor';
import DraggableItem from './DraggableItem';
import ColumnBlockSettings from './ColumnSettings'; // Import the new settings component
import { buildStyle, DEFAULT_MIN_COL_WIDTH_PX, parseStyles } from './model/styles';
import { ComponentContext } from '../../../contexts/ComponentContext';

export const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="4" width="18" height="16" rx="2" ry="2" strokeWidth="2" />
    <path d="M12 4v16" strokeWidth="2" />
    <path d="M3 12h18" strokeWidth="2" />
  </svg>
);

export const columnComponentId = 'column';

const RESIZER_HANDLE_WIDTH = 16;
const ColumnResizer = ({ onMouseDown, style, isResizing }: { onMouseDown: (e: React.MouseEvent) => void, style: React.CSSProperties, isResizing: boolean }) => (
  <div
    className="absolute top-0 bottom-0 flex items-center justify-center cursor-col-resize group z-30"
    style={{
      width: `${RESIZER_HANDLE_WIDTH}px`,
      transform: `translateX(-${RESIZER_HANDLE_WIDTH / 2}px)`,
      ...style
    }}
    onMouseDown={onMouseDown}
  >
    <div className={`w-0.5 h-full bg-transparent transition-colors ${!isResizing ? 'group-hover:bg-blue-500' : ''}`} />
  </div>
);

type ResizingState = {
  rowIndex: number;
  index: number;
  startX: number;
  startLeftWidth: number;
  startRightWidth: number;
  initialPxWidths: number[];
  liveTemplate: string;
};

// Props for the new sub-component
type ColumnCellProps = {
  parentComponentId: number;
  cellIndex: number;
  colIndex: number;
  contents: PageComponent<any, any>[];
  allColumnProps: ColumnComponent['props'];
  dragOverState: { cellIndex: number; itemIndex: number } | null;
  readOnly: boolean;

  // functions
  updateParentComponent: (id: number, props: Partial<ColumnComponent['props']>) => void;
  handleDragOver: (e: React.DragEvent, cellIndex: number, itemIndex: number) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, destCellIndex: number, destItemIndexParam: number) => void;
  handleDragStartInternal: (e: React.DragEvent, sourceCellIndex: number, component: PageComponent<any, any>) => void;

  // misc
  itemRefs: React.MutableRefObject<Map<number, React.RefObject<HTMLDivElement>>>;
  customToolbarButtons: any;
};

// The new sub-component
const ColumnCell: React.FC<ColumnCellProps> = ({
  parentComponentId,
  cellIndex,
  colIndex,
  contents,
  allColumnProps,
  dragOverState,
  readOnly,
  updateParentComponent,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragStartInternal,
  itemRefs,
  customToolbarButtons
}) => {
  const parentContext = useComponentContext();
  const isCellDragOverTarget = dragOverState?.cellIndex === cellIndex;

  const {
    colPaddings, colMargins, colFullHeight, colTextColors,
    colStyles, colClasses, colColors, gridContents,
  } = allColumnProps;

  // Calculate styles and classes for this specific cell
  const colPadding = colPaddings?.[colIndex] || {};
  const colMargin = colMargins?.[colIndex] || {};
  const isColFullHeight = colFullHeight?.[colIndex] || false;
  const colTextColor = colTextColors?.[colIndex];

  const columnStyle: React.CSSProperties = {
    ...parseStyles(colStyles?.[colIndex] || ''),
    backgroundColor: colColors?.[colIndex] || 'transparent',
    position: 'relative'
  };

  const columnClasses = [colClasses?.[colIndex] || ''];

  if (isColFullHeight) columnClasses.push('h-full');
  if (colTextColor) columnStyle.color = colTextColor;
  if (colPadding.paddingTop) columnStyle.paddingTop = `${colPadding.paddingTop}rem`;
  if (colPadding.paddingRight) columnStyle.paddingRight = `${colPadding.paddingRight}rem`;
  if (colPadding.paddingBottom) columnStyle.paddingBottom = `${colPadding.paddingBottom}rem`;
  if (colPadding.paddingLeft) columnStyle.paddingLeft = `${colPadding.paddingLeft}rem`;
  if (colMargin.marginTop) columnStyle.marginTop = `${colMargin.marginTop}rem`;
  if (colMargin.marginRight) columnStyle.marginRight = `${colMargin.marginRight}rem`;
  if (colMargin.marginBottom) columnStyle.marginBottom = `${colMargin.marginBottom}rem`;
  if (colMargin.marginLeft) columnStyle.marginLeft = `${colMargin.marginLeft}rem`;

  // The useMemo hook is now at the top level of this new component, which is valid.
  const scopedContextValue = useMemo(() => {
    const scopedUpdateComponent = (componentId: number, newProps: Partial<PageComponent<any, any>['props']>) => {
      const newGridContents = { ...gridContents };
      const cellContents = [...(newGridContents[cellIndex] || [])];
      const compIndex = cellContents.findIndex(c => c.id === componentId);
      if (compIndex !== -1) {
        cellContents[compIndex] = { ...cellContents[compIndex], props: { ...cellContents[compIndex].props, ...newProps } };
        newGridContents[cellIndex] = cellContents;
        updateParentComponent(parentComponentId, { gridContents: newGridContents });
      }
    };

    const scopedDeleteComponent = (componentId: number) => {
      const newGridContents = { ...gridContents };
      const cellContents = newGridContents[cellIndex] || [];
      newGridContents[cellIndex] = cellContents.filter(c => c.id !== componentId);
      updateParentComponent(parentComponentId, { gridContents: newGridContents });
    };

    return { ...parentContext, updateComponent: scopedUpdateComponent, deleteComponent: scopedDeleteComponent, isNested: true };
  }, [parentContext, cellIndex, gridContents, updateParentComponent, parentComponentId]);

  return (
    <div
      data-column-index={colIndex}
      className={`relative items-stretch flex flex-col ${columnClasses.join(' ')}`}
      style={columnStyle}
    >
      <ComponentContext.Provider value={scopedContextValue}>
        {contents.length > 0 ? (
          <div className="column-content space-y-2 group/item-list" onDragLeave={!readOnly ? handleDragLeave : undefined}>
            {contents.map((comp, itemIndex) => {
              if (!itemRefs.current.has(comp.id)) {
                itemRefs.current.set(comp.id, React.createRef<HTMLDivElement>());
              }
              const itemRef = itemRefs.current.get(comp.id)!;
              return (
                <DraggableItem
                  key={comp.id}
                  itemRef={itemRef}
                  component={comp}
                  cellIndex={cellIndex}
                  itemIndex={itemIndex}
                  onDragStart={!readOnly ? handleDragStartInternal : () => { }}
                  onDragOver={!readOnly ? (e) => handleDragOver(e, cellIndex, itemIndex) : () => { }}
                  onDrop={!readOnly ? (e) => handleDrop(e, cellIndex, itemIndex) : () => { }}
                  isDragOver={!readOnly && isCellDragOverTarget && dragOverState?.itemIndex === itemIndex}
                  customToolbarButtons={customToolbarButtons}
                />
              );
            })}
            {!readOnly && <div className={`w-full relative ${isCellDragOverTarget && dragOverState?.itemIndex === contents.length ? 'min-h-[4rem]' : 'min-h-[8px]'}`} onDragOver={e => handleDragOver(e, cellIndex, contents.length)} onDrop={e => handleDrop(e, cellIndex, contents.length)}>
              {isCellDragOverTarget && dragOverState?.itemIndex === contents.length && <div className="border-t-2 border-blue-500 h-1 animate-pulse" />}
            </div>}
          </div>
        ) : (
          !readOnly ? (
            <div onDragOver={e => handleDragOver(e, cellIndex, 0)} onDragLeave={handleDragLeave} onDrop={e => handleDrop(e, cellIndex, 0)} className={`h-full min-h-[50px] rounded-md border border-dashed flex items-center justify-center text-xs text-gray-400 transition-colors ${isCellDragOverTarget ? 'bg-blue-100/50 border-blue-400' : 'bg-transparent border-gray-300/70'}`}>
              Drop here
            </div>
          ) : <div className="h-full min-h-[50px]"></div>
        )}
      </ComponentContext.Provider>
    </div>
  );
};

const ColumnBlock = memo(({ component }: { component: ColumnComponent }) => {
  const parentContext = useComponentContext();
  const { createComponent } = useComponentRegistry();
  const { customToolbarButtons } = useContext(EditorCustomButtonsContext);

  const { id, props } = component;
  const { updateComponent, deleteComponent, readOnly, allowComponentToBeAdded } = parentContext;

  const [isHovered, setIsHovered] = useState(false);
  const [dragOverState, setDragOverState] = useState<{ cellIndex: number; itemIndex: number } | null>(null);
  const gridRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefs = useRef(new Map<number, React.RefObject<HTMLDivElement>>());
  const [resizing, setResizing] = useState<ResizingState | null>(null);
  const [resizerPositions, setResizerPositions] = useState<number[]>([]);

  const containerStyle = useMemo(() => {
    return buildStyle(props);
  }, [props]);

  useEffect(() => {
    if (readOnly) return;
    const currentNumCols = props.numCols;
    const newColClasses = [...(props.colClasses || [])].slice(0, currentNumCols);
    const newColStyles = [...(props.colStyles || [])].slice(0, currentNumCols);
    const newColWidths = [...(props.colWidths || [])].slice(0, currentNumCols);
    const newColColors = [...(props.colColors || [])].slice(0, currentNumCols);
    const newColPaddings = [...(props.colPaddings || [])].slice(0, currentNumCols);
    const newColMargins = [...(props.colMargins || [])].slice(0, currentNumCols);
    const newColTextColors = [...(props.colTextColors || [])].slice(0, currentNumCols);
    const newColFullHeight = [...(props.colFullHeight || [])].slice(0, currentNumCols);
    const newGridContents = { ...(props.gridContents || {}) };

    while (newColClasses.length < currentNumCols) newColClasses.push('');
    while (newColStyles.length < currentNumCols) newColStyles.push('');
    while (newColWidths.length < currentNumCols) newColWidths.push(1);
    while (newColColors.length < currentNumCols) newColColors.push(undefined as any);
    while (newColPaddings.length < currentNumCols) newColPaddings.push({});
    while (newColMargins.length < currentNumCols) newColMargins.push({});
    while (newColTextColors.length < currentNumCols) newColTextColors.push(undefined as any);
    while (newColFullHeight.length < currentNumCols) newColFullHeight.push(false);

    Object.keys(newGridContents).forEach(key => {
      const idx = parseInt(key, 10);
      if (idx >= (props.numRows * currentNumCols)) {
        delete (newGridContents as Record<number, PageComponent<any, any>[]>)[idx];
      }
    });

    const totalWidth = newColWidths.reduce((sum, w) => sum + w, 0);
    const normalizedWidths = totalWidth > 0 ? newColWidths.map(w => w / totalWidth) : newColWidths.map(() => 1 / currentNumCols);

    let changed = JSON.stringify(normalizedWidths) !== JSON.stringify(props.colWidths) ||
      JSON.stringify(newGridContents) !== JSON.stringify(props.gridContents) ||
      newColClasses.length !== props.colClasses?.length ||
      newColStyles.length !== props.colStyles?.length ||
      newColColors.length !== props.colColors?.length ||
      newColPaddings.length !== props.colPaddings?.length ||
      newColMargins.length !== props.colMargins?.length ||
      newColTextColors.length !== props.colTextColors?.length ||
      newColFullHeight.length !== props.colFullHeight?.length;

    if (changed) {
      updateComponent(id, {
        colWidths: normalizedWidths,
        colClasses: newColClasses,
        colStyles: newColStyles,
        colColors: newColColors,
        colPaddings: newColPaddings,
        colMargins: newColMargins,
        colTextColors: newColTextColors,
        colFullHeight: newColFullHeight,
        gridContents: newGridContents
      });
    }
  }, [props.numCols, props.numRows, readOnly, id, updateComponent]);

  const handleResizeStart = (e: React.MouseEvent, index: number, rowIndex: number) => {
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const grid = gridRefs.current[rowIndex];
    if (!grid) return;

    const colElements = Array.from(grid.children).filter(el => el.hasAttribute('data-column-index'));
    const initialPxWidths = colElements.map(child => (child as HTMLElement).getBoundingClientRect().width);
    const initialTemplate = initialPxWidths.map(px => `${px}px`).join(` `);

    setResizing({
      rowIndex,
      index,
      startX: e.clientX,
      startLeftWidth: initialPxWidths[index],
      startRightWidth: initialPxWidths[index + 1],
      initialPxWidths,
      liveTemplate: initialTemplate,
    });
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;
    const { index, startX, startLeftWidth, startRightWidth, initialPxWidths } = resizing;
    const deltaX = e.clientX - startX;
    const totalTwoColWidth = startLeftWidth + startRightWidth;
    let newLeftWidth = Math.max(DEFAULT_MIN_COL_WIDTH_PX, startLeftWidth + deltaX);
    if (newLeftWidth > totalTwoColWidth - DEFAULT_MIN_COL_WIDTH_PX) {
      newLeftWidth = totalTwoColWidth - DEFAULT_MIN_COL_WIDTH_PX;
    }
    const newRightWidth = totalTwoColWidth - newLeftWidth;
    const newPxWidths = [...initialPxWidths];
    newPxWidths[index] = newLeftWidth;
    newPxWidths[index + 1] = newRightWidth;
    const newTemplate = newPxWidths.map(px => `${px}px`).join(' ');
    setResizing(prev => (prev ? { ...prev, liveTemplate: newTemplate } : null));
  }, [resizing]);

  const handleResizeEnd = useCallback(() => {
    if (!resizing) return;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    const gridEl = gridRefs.current[resizing.rowIndex];
    if (!gridEl) {
      setResizing(null);
      return;
    }

    const { index } = resizing;
    const colElements = Array.from(gridEl.children).filter(el => el.hasAttribute('data-column-index'));
    const leftColEl = colElements[index] as HTMLElement;
    const rightColEl = colElements[index + 1] as HTMLElement;

    if (!leftColEl || !rightColEl) {
      setResizing(null);
      return;
    }

    const finalLeftPx = leftColEl.getBoundingClientRect().width;
    const finalRightPx = rightColEl.getBoundingClientRect().width;
    const combinedPx = finalLeftPx + finalRightPx;

    const currentCombinedFr = props.colWidths[index] + props.colWidths[index + 1];
    const newWidths = [...props.colWidths];

    if (combinedPx > 0) {
      newWidths[index] = (finalLeftPx / combinedPx) * currentCombinedFr;
      newWidths[index + 1] = (finalRightPx / combinedPx) * currentCombinedFr;
    }

    setResizing(null);
    updateComponent(id, { colWidths: newWidths });
  }, [resizing, props.colWidths, id, updateComponent]);

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [resizing, handleResizeMove, handleResizeEnd]);

  useLayoutEffect(() => {
    if (readOnly) return;
    const calculatePositions = () => {
      const gridEl = gridRefs.current[0];
      if (!gridEl || props.numCols <= 1) {
        setResizerPositions([]);
        return;
      }

      const colElements = Array.from(gridEl.children).filter(el => el.hasAttribute('data-column-index'));
      const gridRect = gridEl.getBoundingClientRect();

      const positions = colElements.slice(0, -1).map(el => {
        const colRect = el.getBoundingClientRect();
        return colRect.right - gridRect.left;
      });

      setResizerPositions(positions);
    };

    calculatePositions();

    const observer = new ResizeObserver(calculatePositions);
    if (gridRefs.current[0]) {
      observer.observe(gridRefs.current[0]);
    }

    window.addEventListener('resize', calculatePositions);
    return () => {
      if (gridRefs.current[0]) {
        observer.unobserve(gridRefs.current[0]);
      }
      window.removeEventListener('resize', calculatePositions);
    }
  }, [props.colWidths, props.numCols, readOnly]);

  const handleDragStartInternal = (e: React.DragEvent, sourceCellIndex: number, component: PageComponent<any, any>) => {
    if (readOnly) return;
    e.dataTransfer.setData('application/json', JSON.stringify({ from: 'column', component, sourceCellIndex }));
  };
  const handleDragOver = (e: React.DragEvent, cellIndex: number, itemIndex: number) => {
    if (readOnly) return;
    e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move'; setDragOverState({ cellIndex, itemIndex });
  };
  const handleDragLeave = () => {
    if (readOnly) return;
    setDragOverState(null)
  };

  const parseDragData = (e: React.DragEvent) => {
    try { return JSON.parse(e.dataTransfer.getData('application/json')); } catch { return null; }
  };
  const handleDrop = useCallback((e: React.DragEvent, destCellIndex: number, destItemIndexParam: number) => {
    if (readOnly) return;
    e.preventDefault(); e.stopPropagation(); setDragOverState(null);
    const data = parseDragData(e); if (!data) return;

    let componentType: string;
    if (data.from === 'menu') {
      componentType = data.type as string;
    } else if (data.from === 'main' || data.from === 'column') {
      componentType = (data.component as PageComponent<any, any>).type;
    } else {
      return;
    }

    if (!allowComponentToBeAdded(componentType, component.type)) {
      console.warn(`Adding component of type "${componentType}" to a "${component.type}" component is not allowed.`);
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    const newGridContents: Record<number, PageComponent<any, any>[]> = JSON.parse(JSON.stringify(props.gridContents || {}));
    let componentToAdd: PageComponent<any, any> | null = null;
    let insertIndex = destItemIndexParam;

    if (data.from === 'menu') {
      const type = data.type as string;
      componentToAdd = createComponent(type) || null;
    } else if (data.from === 'main') {
      componentToAdd = data.component as PageComponent<any, any>;
      deleteComponent(componentToAdd.id);
    } else if (data.from === 'column') {
      const { component, sourceCellIndex } = data;
      componentToAdd = component;
      const sourceCell = newGridContents[sourceCellIndex] || [];
      const moveIndex = sourceCell.findIndex((c: PageComponent<any, any>) => c.id === componentToAdd!.id);
      if (moveIndex > -1) {
        sourceCell.splice(moveIndex, 1);
        if (sourceCellIndex === destCellIndex && moveIndex < insertIndex) { insertIndex--; }
        newGridContents[sourceCellIndex] = sourceCell;
      }
    }
    if (componentToAdd) {
      if (!newGridContents[destCellIndex]) { newGridContents[destCellIndex] = []; }
      const destinationCell = newGridContents[destCellIndex];
      destinationCell.splice(insertIndex, 0, componentToAdd);
      updateComponent(id, { gridContents: newGridContents });
    }
  }, [props.gridContents, deleteComponent, createComponent, readOnly, updateComponent, id, allowComponentToBeAdded, component.type]);

  const isResizerVisible = !readOnly && (isHovered || !!resizing);

  const gridStyle = useMemo(() => {
    if (resizing?.liveTemplate) {
      return { gridTemplateColumns: resizing.liveTemplate, gap: 0 };
    }
    const widths = props.colWidths || [];
    const template = widths.map(w => `${w}fr`).join(' ');
    return {
      gridTemplateColumns: template,
      gap: 0,
    };
  }, [resizing, props.colWidths]);

  return (
    <div
      className={`relative items-stretch ${props.containerClasses || ''} ${readOnly ? 'group-read-only' : ''}`}
      style={containerStyle}
      onMouseEnter={!readOnly ? () => setIsHovered(true) : undefined}
      onMouseLeave={!readOnly ? () => setIsHovered(false) : undefined}
    >
      <Suspense fallback={<div className="text-center text-sm text-gray-500">Loading...</div>}>
        {Array.from({ length: props.numRows }).map((_, rowIndex) => (
          <div key={rowIndex} ref={el => { gridRefs.current[rowIndex] = el; }} className="grid relative items-stretch" style={gridStyle}>
            {Array.from({ length: props.numCols }).map((_, colIndex) => {
              const cellIndex = rowIndex * props.numCols + colIndex;
              const contents = (props.gridContents as Record<number, PageComponent<any, any>[]>)[cellIndex] || [];

              return (
                <ColumnCell
                  key={cellIndex}
                  parentComponentId={id}
                  cellIndex={cellIndex}
                  colIndex={colIndex}
                  contents={contents}
                  allColumnProps={props}
                  dragOverState={dragOverState}
                  readOnly={readOnly}
                  updateParentComponent={updateComponent}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                  handleDragStartInternal={handleDragStartInternal}
                  itemRefs={itemRefs}
                  customToolbarButtons={customToolbarButtons}
                />
              );
            })}

            {isResizerVisible && resizerPositions.map((pos, index) => (
              <ColumnResizer
                key={`resizer-${rowIndex}-${index}`}
                style={{ left: `${pos}px` }}
                isResizing={!!resizing}
                onMouseDown={e => {
                  e.stopPropagation();
                  handleResizeStart(e, index, rowIndex);
                }}
              />
            ))}
          </div>
        ))}
      </Suspense>
    </div>
  );
});

export default ColumnBlock;

export const overlayBlockDefinition: ComponentDefinition = {
  type: 'column',
  label: 'Column block',
  icon: icon,
  create: (): ColumnComponent => {
    const numRows = 1;
    const numCols = 2;
    return {
      id: Date.now(),
      type: 'column',
      props: {
        numRows,
        numCols,
        colWidths: [1, 1],
        gridContents: {},
        containerClasses: '',
        containerStyles: '',
        colClasses: Array.from({ length: numCols }, () => ''),
        colStyles: Array.from({ length: numCols }, () => ''),
        colColors: Array.from({ length: numCols }, () => undefined as any),
        colPaddings: Array.from({ length: numCols }, () => ({})),
        colMargins: Array.from({ length: numCols }, () => ({})),
        colTextColors: Array.from({ length: numCols }, () => undefined as any),
        colFullHeight: Array.from({ length: numCols }, () => false),
      },
    }
  },
  Renderer: ColumnBlock as any,
  renderSettings: ({ component, updateComponent }) => <ColumnBlockSettings component={component as ColumnComponent} updateComponent={updateComponent as any} />,
};