// path: src/index.ts
// Import styles at the top of the main entry point to ensure they are always included.
import './styles.css';

// --- Components ---
import PageBuilder from './PageBuilder';
import TextColorPicker from './components/editor/toolbar/TextColorPicker';
export { PageBuilder, TextColorPicker };

// --- Main Types ---
export type { PageBuilderHandle, Props as PageBuilderProps, Data } from './PageBuilder';

// --- Component Types ---
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

    // --- Type Aliases ---
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