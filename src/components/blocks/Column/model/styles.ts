// path: src/components/blocks/ColumnBlock/model/styles.ts
import type { ColumnComponentProps } from "../../../../types/components";

export const parseStyles = (styleString: string): React.CSSProperties => {
  try {
    const style: React.CSSProperties = {};
    styleString
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(rule => {
        const [key, value] = rule.split(':');
        if (key && value) {
          const camelCaseKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
          style[camelCaseKey as keyof React.CSSProperties] = value.trim() as any;
        }
      });
    return style;
  } catch {
    return {};
  }
};

export const buildStyle = (props: ColumnComponentProps) => {
  const style: React.CSSProperties = parseStyles(props.containerStyles || '');
  if (props.paddingTop) style.paddingTop = `${props.paddingTop}rem`;
  if (props.paddingRight) style.paddingRight = `${props.paddingRight}rem`;
  if (props.paddingBottom) style.paddingBottom = `${props.paddingBottom}rem`;
  if (props.paddingLeft) style.paddingLeft = `${props.paddingLeft}rem`;
  if (props.marginTop) style.marginTop = `${props.marginTop}rem`;
  if (props.marginRight) style.marginRight = `${props.marginRight}rem`;
  if (props.marginBottom) style.marginBottom = `${props.marginBottom}rem`;
  if (props.marginLeft) style.marginLeft = `${props.marginLeft}rem`;

  return style;
}

export const DEFAULT_MIN_COL_WIDTH_PX = 50;
