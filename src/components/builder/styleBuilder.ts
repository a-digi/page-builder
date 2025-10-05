import { PageComponent } from "../../types/components";
import { parseStyles } from "../blocks/Column/model/styles";

export const blockWrapperStyleBuilder = (component: PageComponent<any, any>) => {
    const newStyle: React.CSSProperties = parseStyles(component.props.containerStyles || '');

    const styleMappings: {
        propKey: keyof typeof component.props,
        styleKey: keyof React.CSSProperties,
        unit?: string
    }[] = [
            { propKey: 'paddingTop', styleKey: 'paddingTop', unit: 'rem' },
            { propKey: 'paddingRight', styleKey: 'paddingRight', unit: 'rem' },
            { propKey: 'paddingBottom', styleKey: 'paddingBottom', unit: 'rem' },
            { propKey: 'paddingLeft', styleKey: 'paddingLeft', unit: 'rem' },
            { propKey: 'marginTop', styleKey: 'marginTop', unit: 'rem' },
            { propKey: 'marginRight', styleKey: 'marginRight', unit: 'rem' },
            { propKey: 'marginBottom', styleKey: 'marginBottom', unit: 'rem' },
            { propKey: 'marginLeft', styleKey: 'marginLeft', unit: 'rem' },
            { propKey: 'containerBackgroundColor', styleKey: 'backgroundColor' },
            { propKey: 'textColor', styleKey: 'color' },
        ];

    styleMappings.forEach(({ propKey, styleKey, unit }) => {
        const value = component.props[propKey];
        if (value !== undefined && value !== null) {
            newStyle[styleKey] = unit ? `${value}${unit}` : value;
        }
    });

    return newStyle;
}