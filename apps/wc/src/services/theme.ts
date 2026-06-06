export const getRGBColor = (hex: string, type: string) => {
  const color = hex.replace(/#/g, '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  return `--color-${type}: ${r}, ${g}, ${b};`;
};

export const getAccessibleColor = (hex: string) => {
  const color = hex.replace(/#/g, '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
};

// Picks a Tailwind text color that's readable against the given hex background.
// Same YIQ formula as getAccessibleColor; the boundary (128) matches WCAG-ish
// brightness perception.
export const getTextColorByBrightness = (color: string): string => {
  if (!color) return '';
  const hex = color.replace(/#/g, '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'text-gray-800' : 'text-gray-300';
};
