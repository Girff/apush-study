import { expect, it } from 'vitest';
import { maskYears } from '../dates';
it('masks years', () => {
  expect(maskYears('Panic of 1837')).toBe('Panic of ····');
  expect(maskYears('Burning of Washington (Aug. 24, 1814)')).toBe('Burning of Washington');
  expect(maskYears('Lowell "turnouts" (1834, 1836)')).toBe('Lowell "turnouts"');
  expect(maskYears('World Anti-Slavery Convention (London, 1840)')).toBe('World Anti-Slavery Convention');
  expect(maskYears('1840 split / Abby Kelly')).toBe('···· split / Abby Kelly');
  expect(maskYears('Britain forced about 6,000 Americans into its navy, 1803–1812')).toBe('Britain forced about 6,000 Americans into its navy, ····–····');
  expect(maskYears('Printing technology (1830s)')).toBe('Printing technology');
});

import { parseTermDate } from '../dates';
it('parses term-name dates', () => {
  expect(parseTermDate('Louisiana Purchase (1803)')).toEqual({ start: 1803, label: '1803' });
  expect(parseTermDate('Election of 1840')?.label).toBe('1840');
  expect(parseTermDate('Burning of Washington (Aug. 24, 1814)')?.label).toBe('Aug. 24, 1814');
  expect(parseTermDate('Burning of Washington (Aug. 24, 1814)')!.start).toBeCloseTo(1814.65, 1);
  expect(parseTermDate('Lowell "turnouts" (1834, 1836)')).toMatchObject({ start: 1834, label: '1834, 1836' });
  expect(parseTermDate('Printing technology (1830s)')).toMatchObject({ start: 1830, label: '1830s' });
  expect(parseTermDate('Thomas Jefferson')).toBeNull();
});
