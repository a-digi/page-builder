// path: src/index.ts
import './styles.css';

import PageBuilder from './PageBuilder';
import TextColorPicker from './components/editor/toolbar/TextColorPicker';
export { PageBuilder, TextColorPicker };

export type { PageBuilderHandle, Props as PageBuilderProps, Data } from './PageBuilder';

export type {
    PageComponent,
    BuiltInComponentType,
    CustomButton,
    ComponentDefinition,
    BaseComponentProps,
    PaddingProps,
    MarginProps,
    GenericComponentProps,
    TextProps,
    HeaderProps,
    HtmlProps,
    AlertProps,
    TextareaComponentProps,
    ColumnComponentProps,
    ImageComponentProps,
    ParallaxComponentProps,
    ParallaxPage,
    PositionedComponent,
    GenericComponent,
    DividerComponent,
    TextComponent,
    HeaderComponent,
    HTMLComponent,
    ColumnComponent,
    TextareaComponent,
    AlertComponent,
    ImageComponent,
    ParallaxComponent,
    BuiltInComponents,

} from './types/components';

export { ImageUploadProvider } from './components/blocks/Image/ImageUploadContext';
export type { IImageUploadContext } from './components/blocks/Image/ImageUploadContext';
export { columnComponentId, overlayBlockDefinition } from './components/blocks/Column/ColumnBlock';
export { useComponentContext } from './hooks/useComponentContext';