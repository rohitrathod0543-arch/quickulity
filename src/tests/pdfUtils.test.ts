import { describe, it, expect } from 'vitest';
import { parsePageRanges } from '../utils/pdfUtils';

describe('PDF Range Parser', () => {
  it('parses individual pages', () => {
    const pages = parsePageRanges('1, 3, 5', 10);
    expect(pages).toEqual([0, 2, 4]); // 0-indexed
  });

  it('parses ranges', () => {
    const pages = parsePageRanges('1-4, 7-8', 10);
    expect(pages).toEqual([0, 1, 2, 3, 6, 7]);
  });

  it('deduplicates overlapping ranges and sorts order', () => {
    const pages = parsePageRanges('3-5, 2, 4-6', 10);
    expect(pages).toEqual([1, 2, 3, 4, 5]);
  });

  it('throws when page exceeds document count', () => {
    expect(() => parsePageRanges('1-12', 10)).toThrow('Range "1-12" is out of bounds');
  });

  it('throws on inverted ranges like 5-2', () => {
    expect(() => parsePageRanges('5-2', 10)).toThrow('Start page (5) cannot be greater than end page (2)');
  });

  it('throws on empty or non-numeric input', () => {
    expect(() => parsePageRanges('', 10)).toThrow('Please enter at least one page number');
    expect(() => parsePageRanges('abc', 10)).toThrow('Invalid page number');
  });
});
