// path: src/components/page-builder/components/blocks/Parallax/ParallaxBlock.tsx
import React, { useCallback, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useComponentContext } from '../../../contexts/ComponentContext';
import { useComponentRegistry } from '../../../contexts/ComponentRegistry';
import type { ComponentDefinition, ParallaxComponent, ParallaxPage, PositionedComponent } from '../../../types/components';
import { ParallaxSettings } from './ParallaxSettings';
import { PositionedItem } from './PositionedItem';
import { useParallaxEditor } from './ParallaxState';
import { ComponentContext } from '../../../contexts/ComponentContext';

export const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 21H3" /><path d="M12 15.5l-7-5.25" /><path d="M12 15.5l7-5.25" /><path d="M12 21V10.25" /><path d="M15.5 6L12 3 8.5 6" /><path d="M12 3v2.75" />
  </svg>
);

const ParallaxBlock: React.FC<{ component: ParallaxComponent }> = ({ component }) => {
  const context = useComponentContext();
  const { createComponent } = useComponentRegistry();
  const containerRef = useRef<HTMLDivElement>(null);

  const { liveComponent, editingLayerId, setLiveComponent } = useParallaxEditor();

  const currentComponent = liveComponent || component;
  const { id: parallaxId, props } = currentComponent;
  const { pages: layers = [], containerHeight = 100, containerHeightUnit = 'vh', perspective = 3, is3DEnabled = true } = props;

  const showParallaxEffect = context.isPreviewing && is3DEnabled;
  const isEditing = editingLayerId !== null && !context.isPreviewing;

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, layerIndex: number) => {
    e.preventDefault(); e.stopPropagation();
    const container = containerRef.current; if (!container) return;
    let data; try { data = JSON.parse(e.dataTransfer.getData('application/json')); } catch { return; }
    if (data.from !== 'menu') return;

    if (!context.allowComponentToBeAdded(data.type, currentComponent.type)) {
      console.warn(`Adding component of type "${data.type}" to a "${currentComponent.type}" component is not allowed.`);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top + container.scrollTop;

    const newComponent = createComponent(data.type); if (!newComponent) return;
    const positionedComponent: PositionedComponent = { ...newComponent, props: { ...newComponent.props, x: Math.max(0, dropX - 125), y: Math.max(0, dropY - 75), width: 250, height: 150, zIndex: 1 } };
    const newLayers = [...layers]; newLayers[layerIndex].components.push(positionedComponent);

    const newProps = { ...props, pages: newLayers };
    setLiveComponent({ ...currentComponent, props: newProps });
    context.updateComponent(parallaxId, newProps);
  }, [layers, createComponent, parallaxId, props, currentComponent, setLiveComponent, context]);

  const updatePositionedComponentProps = useCallback((layerIndex: number, compId: number, newCompProps: Partial<PositionedComponent['props']>) => {
    const newLayers = [...layers];
    const layer = newLayers[layerIndex];
    if (!layer) return;
    const compIndex = layer.components.findIndex((c: PositionedComponent) => c.id === compId);
    if (compIndex === -1) return;
    layer.components[compIndex] = { ...layer.components[compIndex], props: { ...layer.components[compIndex].props, ...newCompProps } };

    const updatedProps = { ...props, pages: newLayers };
    setLiveComponent({ ...currentComponent, props: updatedProps });
    context.updateComponent(parallaxId, updatedProps);
  }, [layers, parallaxId, props, currentComponent, setLiveComponent, context]);

  const removePositionedComponent = useCallback((layerIndex: number, compId: number) => {
    const newLayers = [...layers];
    const layer = newLayers[layerIndex];
    if (!layer) return;

    layer.components = layer.components.filter((c: PositionedComponent) => c.id !== compId);

    const updatedProps = { ...props, pages: newLayers };
    setLiveComponent({ ...currentComponent, props: updatedProps });
    context.updateComponent(parallaxId, updatedProps);
  }, [layers, parallaxId, props, currentComponent, setLiveComponent, context]);

  return (
    <div ref={containerRef} className="pb-w-full pb-border-y pb-border-dashed pb-border-gray-400 pb-bg-gray-100" style={{ height: `${containerHeight}${containerHeightUnit}`, overflowX: 'hidden', overflowY: 'auto', perspective: showParallaxEffect ? `${perspective}px` : 'none', }}>
      <div style={{ height: '100%', width: '100%', position: 'relative', transformStyle: showParallaxEffect ? 'preserve-3d' : 'flat' }}>
        {layers.map((layer: ParallaxPage, layerIndex: number) => {
          const isInteractive = !isEditing || editingLayerId === layer.id;
          const depth = layer.depth || 0;
          const scale = 1 - (depth / perspective);
          const parallaxTransform = `translateZ(${depth}px) scale(${scale})`;
          const layerStyle: CSSProperties = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, transform: showParallaxEffect ? parallaxTransform : 'none', display: isInteractive ? 'block' : 'none', };

          if (layer.backgroundImageUrl) {
            layerStyle.backgroundImage = `url(${layer.backgroundImageUrl})`;
            layerStyle.backgroundSize = 'cover';
            layerStyle.backgroundPosition = 'center';
            layerStyle.backgroundColor = 'transparent';
          } else if (layer.backgroundColor) {
            layerStyle.backgroundColor = layer.backgroundColor;
          }

          const scopedContextValue = useMemo(() => {
            const scopedUpdateComponent = (componentId: number, newProps: Partial<PositionedComponent['props']>) => {
              updatePositionedComponentProps(layerIndex, componentId, newProps);
            };

            const scopedDeleteComponent = (componentId: number) => {
              removePositionedComponent(layerIndex, componentId);
            };

            return {
              ...context,
              updateComponent: scopedUpdateComponent,
              deleteComponent: scopedDeleteComponent,
              isNested: true
            };
          }, [context, layerIndex, updatePositionedComponentProps, removePositionedComponent]);

          return (
            <ComponentContext.Provider key={layer.id} value={scopedContextValue}>
              <div style={layerStyle} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, layerIndex)}>
                {layer.components.map((posComp: PositionedComponent) => <PositionedItem key={posComp.id} component={posComp} isInteractive={isInteractive} onPositionChange={({ x, y }) => updatePositionedComponentProps(layerIndex, posComp.id, { x, y })} onSizeChange={({ width, height }) => updatePositionedComponentProps(layerIndex, posComp.id, { width, height })} onLayerChange={dir => { const currentZ = posComp.props.zIndex || 1; const newZ = dir === 'front' ? currentZ + 1 : Math.max(1, currentZ - 1); updatePositionedComponentProps(layerIndex, posComp.id, { zIndex: newZ }); }} />)}

                {layer.components.length === 0 && !context.isPreviewing && !layer.backgroundImageUrl && !layer.backgroundColor && (
                  <div className="pb-absolute pb-inset-0 pb-flex pb-items-center pb-justify-center pb-text-gray-400 pb-font-bold pb-uppercase pb-pointer-events-none pb-text-2xl pb-opacity-50">
                    Layer {layerIndex + 1}
                  </div>
                )}
              </div>
            </ComponentContext.Provider>
          );
        })}
      </div>
    </div>
  );
};

export const parallaxBlockDefinition: ComponentDefinition<ParallaxComponent> = {
  type: 'parallax', label: 'Parallax Canvas', icon,
  create: (): ParallaxComponent => ({
    id: Date.now(),
    type: 'parallax',
    props: {
      containerHeight: 100,
      containerHeightUnit: 'vh',
      perspective: 3,
      is3DEnabled: true,
      pages: [
        { id: Date.now() + 1, height: 100, components: [], backgroundColor: '#F3F4F6', depth: 0 }
      ],
    },
  }),
  Renderer: ParallaxBlock,
  renderSettings: ({ component, updateComponent }) => {
    return (
      <ParallaxSettings
        component={component}
        updateComponent={updateComponent}
      />
    );
  },
};
