// path: src/components/page-builder/types/components.ts
import { type FC } from 'react';

export type CustomButton<C extends PageComponent<any, any>> = {
  id: string;
  icon: React.ReactNode;
  tooltip: string;
  onClick: (component: C) => void;
  shouldShow?: (component: C) => boolean;
  className?: string;
};

export type BuiltInComponentType =
  | 'text'
  | 'heading'
  | 'divider'
  | 'image'
  | 'html'
  | 'generic'
  | 'column'
  | 'textarea'
  | 'alert'
  | 'parallax';

export interface PageComponent<T extends string, P> {
  id: number;
  type: T;
  props: P;
}

export interface PaddingProps {
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

export interface MarginProps {
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}

export interface BaseComponentProps extends PaddingProps, MarginProps {
  containerClasses?: string;
  containerStyles?: string;
  containerBackgroundColor?: string;
  textColor?: string;
  fullHeight?: boolean;
  textSize?: number;
  content?: string;
  fontFamily?: string;
  textAlign?: string;
  id?: string;
  code?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  zIndex?: number;
  url?: string;
  alt?: string;
  numCols?: number;
  numRows?: number;
  colWidths?: number[];
  colClasses?: string[];
  colColors?: string[];
  colStyles?: string[];
  colPaddings?: PaddingProps[];
  colMargins?: MarginProps[];
  colTextColors?: string[];
  colFullHeight?: boolean[];
  gridContents?: Record<number, PageComponent<any, any>[]>;
  containerPadding?: number;
  containerMargin?: number;
}

export interface GenericComponentProps extends BaseComponentProps { text?: string; }
export interface TextProps extends BaseComponentProps { content: string; textAlign?: string; textSize?: number; fontFamily?: string; textEffect?: string; }
export interface HeaderProps extends TextProps { }
export interface HtmlProps extends BaseComponentProps { code: string; }
export interface AlertProps extends BaseComponentProps { title: string; content: string; }
export interface TextareaComponentProps extends BaseComponentProps { text?: string; placeholder?: string; textareaClasses?: string; }
export interface ColumnComponentProps extends BaseComponentProps { numCols: number; numRows: number; colWidths: number[]; colClasses?: string[]; colStyles?: string[]; colColors?: string[]; colPaddings?: PaddingProps[]; colMargins?: MarginProps[]; colTextColors?: string[]; colFullHeight?: boolean[]; gridContents: Record<number, PageComponent<any, any>[]>; }

export interface ImageComponentProps extends BaseComponentProps {
  url: string;
  alt?: string;
  filter?: string;
  shape?: 'circle' | 'rect';
  externalImageUrl?: string;
  customFilters?: {
    [key: string]: number;
  };
}

export type PositionedComponent = PageComponent<any, any>;

export interface ParallaxPage {
  id: number;
  height: number;
  components: PositionedComponent[];
  backgroundImageUrl?: string;
  backgroundColor?: string;
  depth?: number;
}

export interface ParallaxComponentProps extends BaseComponentProps {
  pages: ParallaxPage[];
  containerHeight?: number;
  perspective?: number;
  containerHeightUnit?: 'px' | '%' | 'vh';
  is3DEnabled?: boolean;
}

// --- Component Type Aliases ---

export type GenericComponent = PageComponent<'generic', GenericComponentProps>;
export type DividerComponent = PageComponent<'divider', GenericComponentProps>;
export type TextComponent = PageComponent<'text', TextProps>;
export type HeaderComponent = PageComponent<'heading', HeaderProps>;
export type HTMLComponent = PageComponent<'html', HtmlProps>;
export type ColumnComponent = PageComponent<'column', ColumnComponentProps>;
export type TextareaComponent = PageComponent<'textarea', TextareaComponentProps>;
export type AlertComponent = PageComponent<'alert', AlertProps>;
export type ImageComponent = PageComponent<'image', ImageComponentProps>;
export type ParallaxComponent = PageComponent<'parallax', ParallaxComponentProps>;


export type BuiltInComponents =
  | GenericComponent
  | TextComponent
  | HeaderComponent
  | DividerComponent
  | HTMLComponent
  | ImageComponent
  | ColumnComponent
  | TextareaComponent
  | AlertComponent
  | ParallaxComponent;

export interface ComponentDefinition<C extends PageComponent<any, any> = PageComponent<any, any>> {
  type: C['type'];
  label?: string;
  icon?: React.ReactElement<{ className?: string }>;
  settingsIcon?: React.ReactNode;
  create: () => C;
  Renderer: FC<{ component: C }>;
  renderSettings?: (props: {
    component: C;
    updateComponent: (id: number, props: Partial<C['props']>) => void;
  }) => React.ReactNode;
  renderCustomControls?: (component: C) => React.ReactNode;
}