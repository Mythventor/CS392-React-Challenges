import { expect, it } from 'vitest';
import { getCourseColor } from './course-colors';

const luminance = (hex: string) => {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};
it('uses text colors with at least 4.5:1 contrast against each course background', () => {
  const colors = new Set();
  for (let number = 0; number < 500; number++) {
    const color = getCourseColor(`F${number}`);
    colors.add(color.background);
    const contrast = (luminance(color.background) + 0.05) / (luminance(color.text) + 0.05);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  }
  expect(colors.size).toBe(10);
});
