import { describe, it, expect } from 'vitest';
import { getRGBColor, getAccessibleColor } from './theme';

describe('getRGBColor', () => {
  it('converts a hex with a leading # to the CSS custom-property line', () => {
    expect(getRGBColor('#ff8000', 'primary')).toBe('--color-primary: 255, 128, 0;');
  });

  it('accepts hex without a leading #', () => {
    expect(getRGBColor('00ff00', 'a11y')).toBe('--color-a11y: 0, 255, 0;');
  });

  it('clamps to the type passed in', () => {
    const out = getRGBColor('#aabbcc', 'whatever-name');
    expect(out).toMatch(/^--color-whatever-name:/);
  });
});

describe('getAccessibleColor', () => {
  it('returns white text on a dark background', () => {
    expect(getAccessibleColor('#000000')).toBe('#FFFFFF');
    expect(getAccessibleColor('#202040')).toBe('#FFFFFF');
  });

  it('returns black text on a light background', () => {
    expect(getAccessibleColor('#ffffff')).toBe('#000000');
    expect(getAccessibleColor('#ffff00')).toBe('#000000');
  });

  it('flips around the YIQ=128 boundary', () => {
    // YIQ for #808080 is exactly 128 -> >= 128 path -> black
    expect(getAccessibleColor('#808080')).toBe('#000000');
  });
});
