// path: src/index.ts
// --- Components ---
import PageBuilder from './PageBuilder';
export { PageBuilder };

// --- Main Types ---
export type { PageBuilderHandle, Props as PageBuilderProps, Data as PageBuilderData } from './PageBuilder';

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

// --- Context Providers (Optional, for advanced usage) ---
export { ImageUploadProvider } from './components/blocks/Image/ImageUploadContext';
export type { IImageUploadContext } from './components/blocks/Image/ImageUploadContext';