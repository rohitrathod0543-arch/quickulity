import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  calculatePartToWhole,
  calculatePercentOf,
  calculatePercentChange,
  calculateDiscount,
  getZodiacSign,
} from '../utils/calcUtils';

describe('Age Calculator Logic', () => {
  it('calculates standard chronological age correctly', () => {
    const res = calculateAge('2000-01-01', '2025-01-01');
    expect(res.years).toBe(25);
    expect(res.months).toBe(0);
    expect(res.days).toBe(0);
    expect(res.isLeapYearBorn).toBe(true);
  });

  it('handles leap day birth correctly', () => {
    const res = calculateAge('2004-02-29', '2024-03-01');
    expect(res.years).toBe(20);
    expect(res.months).toBe(0);
    expect(res.days).toBe(1);
    expect(res.isLeapYearBorn).toBe(true);
  });

  it('rejects future birth dates', () => {
    expect(() => calculateAge('2030-01-01', '2025-01-01')).toThrow(
      'Birth date cannot be in the future.'
    );
  });

  it('correctly calculates zodiac signs', () => {
    expect(getZodiacSign(7, 25)).toBe('Leo (Lion)');
    expect(getZodiacSign(11, 8)).toBe('Scorpio (Scorpion)');
    expect(getZodiacSign(4, 15)).toBe('Aries (Ram)');
  });
});

describe('Percentage Calculator Logic', () => {
  it('calculates marks and total percentage', () => {
    const res = calculatePartToWhole(450, 600);
    expect(res.percent).toBe(75);
    expect(res.ratio).toBe('450 / 600');
  });

  it('throws an error when total is zero', () => {
    expect(() => calculatePartToWhole(10, 0)).toThrow(
      'Total cannot be zero in percentage calculations.'
    );
  });

  it('calculates percentage of a number', () => {
    expect(calculatePercentOf(15, 200)).toBe(30);
    expect(calculatePercentOf(0, 100)).toBe(0);
  });

  it('calculates percentage change (increase and decrease)', () => {
    const increase = calculatePercentChange(100, 150);
    expect(increase.percentChange).toBe(50);
    expect(increase.isIncrease).toBe(true);

    const decrease = calculatePercentChange(200, 150);
    expect(decrease.percentChange).toBe(25);
    expect(decrease.isIncrease).toBe(false);
  });

  it('calculates discount and net savings', () => {
    const discount = calculateDiscount(120, 25);
    expect(discount.finalPrice).toBe(90);
    expect(discount.savings).toBe(30);
  });
});
