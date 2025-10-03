// path: src/components/page-builder/components/blocks/Image/model/settings.ts

export const filterOptions = [
  { name: 'None', value: 'none' },
  { name: 'Custom', value: 'custom' },
  { name: 'Grayscale', value: 'grayscale' },
  { name: 'Sepia', value: 'sepia' },
  { name: 'Invert', value: 'invert' },
  { name: 'Contrast', value: 'contrast' },
  { name: 'Brightness', value: 'brightness' },
  { name: 'Blur', value: 'blur' },
  { name: 'Saturate', value: 'saturate' },
  { name: 'Hue Rotate', value: 'hue-rotate' },
  { name: 'Opacity', value: 'opacity' }
];

export const filterStyles: Record<string, string> = {
  none: 'none',
  custom: '',
  grayscale: 'grayscale(100%)',
  sepia: 'sepia(100%)',
  invert: 'invert(100%)',
  contrast: 'contrast(150%)',
  brightness: 'brightness(120%)',
  blur: 'blur(3px)',
  saturate: 'saturate(200%)',
  'hue-rotate': 'hue-rotate(90deg)',
  opacity: 'opacity(50%)',
};

export const customFilterOptions = [
  { prop: 'brightness', name: 'Brightness', min: 0, max: 2, step: 0.01, defaultValue: 1, unit: '' },
  { prop: 'contrast', name: 'Contrast', min: 0, max: 2, step: 0.01, defaultValue: 1, unit: '' },
  { prop: 'saturate', name: 'Saturation', min: 0, max: 3, step: 0.01, defaultValue: 1, unit: '' },
  { prop: 'grayscale', name: 'Grayscale', min: 0, max: 1, step: 0.01, defaultValue: 0, unit: '' },
  { prop: 'sepia', name: 'Sepia', min: 0, max: 1, step: 0.01, defaultValue: 0, unit: '' },
  { prop: 'invert', name: 'Invert', min: 0, max: 1, step: 0.01, defaultValue: 0, unit: '' },
  { prop: 'blur', name: 'Blur', min: 0, max: 10, step: 0.1, defaultValue: 0, unit: 'px' },
  { prop: 'hue-rotate', name: 'Hue Rotate', min: 0, max: 360, step: 1, defaultValue: 0, unit: 'deg' },
  { prop: 'opacity', name: 'Opacity', min: 0, max: 1, step: 0.01, defaultValue: 1, unit: '' },
];

type CustomFilters = { [key: string]: number };

export const defaultCustomFilters = customFilterOptions.reduce((acc, option) => {
  acc[option.prop] = option.defaultValue;
  return acc;
}, {} as CustomFilters);
