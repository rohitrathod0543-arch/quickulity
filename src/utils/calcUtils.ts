import { AgeCalculationResult } from '../types';

export function calculateAge(birthDateStr: string, asOfDateStr?: string): AgeCalculationResult {
  if (!birthDateStr) {
    throw new Error('Please select a birth date.');
  }

  const birthDate = new Date(birthDateStr + 'T00:00:00');
  if (isNaN(birthDate.getTime())) {
    throw new Error('Invalid birth date format.');
  }

  const asOf = asOfDateStr ? new Date(asOfDateStr + 'T00:00:00') : new Date();
  if (isNaN(asOf.getTime())) {
    throw new Error('Invalid comparison date format.');
  }

  // Set asOf to start of day for clean calculation
  const compareDate = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate());
  const bDate = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());

  if (bDate > compareDate) {
    throw new Error('Birth date cannot be in the future.');
  }

  let years = compareDate.getFullYear() - bDate.getFullYear();
  let months = compareDate.getMonth() - bDate.getMonth();
  let days = compareDate.getDate() - bDate.getDate();

  if (days < 0) {
    // Borrow days from previous month
    const prevMonthLastDay = new Date(compareDate.getFullYear(), compareDate.getMonth(), 0).getDate();
    days += prevMonthLastDay;
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffMs = compareDate.getTime() - bDate.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekBorn = weekdays[bDate.getDay()];

  // Next birthday calculation
  let nextBday = new Date(compareDate.getFullYear(), bDate.getMonth(), bDate.getDate());
  if (nextBday < compareDate) {
    nextBday = new Date(compareDate.getFullYear() + 1, bDate.getMonth(), bDate.getDate());
  }
  const nextDiffMs = nextBday.getTime() - compareDate.getTime();
  const nextBirthdayDays = Math.round(nextDiffMs / (1000 * 60 * 60 * 24));

  // Leap year check
  const birthYear = bDate.getFullYear();
  const isLeapYearBorn = (birthYear % 4 === 0 && birthYear % 100 !== 0) || birthYear % 400 === 0;

  // Zodiac sign
  const month = bDate.getMonth() + 1; // 1-12
  const day = bDate.getDate();
  const zodiacSign = getZodiacSign(month, day);

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalHours,
    dayOfWeekBorn,
    nextBirthdayDays,
    zodiacSign,
    isLeapYearBorn,
  };
}

export function getZodiacSign(month: number, day: number): string {
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius (Water Bearer)';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces (Fish)';
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries (Ram)';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus (Bull)';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini (Twins)';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer (Crab)';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo (Lion)';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo (Maiden)';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra (Scales)';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio (Scorpion)';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius (Archer)';
  return 'Capricorn (Sea Goat)';
}

// Percentage calculations
export function calculatePartToWhole(part: number, total: number): { percent: number; ratio: string } {
  if (isNaN(part) || isNaN(total)) {
    throw new Error('Please enter valid numerical values.');
  }
  if (total === 0) {
    throw new Error('Total cannot be zero in percentage calculations.');
  }
  const percent = Number(((part / total) * 100).toFixed(2));
  return {
    percent,
    ratio: `${part} / ${total}`,
  };
}

export function calculatePercentOf(percent: number, value: number): number {
  if (isNaN(percent) || isNaN(value)) {
    throw new Error('Please enter valid numerical values.');
  }
  return Number(((percent / 100) * value).toFixed(2));
}

export function calculatePercentChange(
  initial: number,
  final: number
): { percentChange: number; isIncrease: boolean; diff: number } {
  if (isNaN(initial) || isNaN(final)) {
    throw new Error('Please enter valid numerical values.');
  }
  if (initial === 0) {
    throw new Error('Initial value cannot be zero when calculating percentage change.');
  }
  const diff = final - initial;
  const percentChange = Number(((diff / Math.abs(initial)) * 100).toFixed(2));
  return {
    percentChange: Math.abs(percentChange),
    isIncrease: diff >= 0,
    diff,
  };
}

export function calculateDiscount(
  originalPrice: number,
  discountPercent: number
): { finalPrice: number; savings: number } {
  if (isNaN(originalPrice) || isNaN(discountPercent)) {
    throw new Error('Please enter valid numerical values.');
  }
  if (originalPrice < 0 || discountPercent < 0) {
    throw new Error('Prices and percentages cannot be negative.');
  }
  const savings = Number(((originalPrice * discountPercent) / 100).toFixed(2));
  const finalPrice = Math.max(0, Number((originalPrice - savings).toFixed(2)));
  return {
    finalPrice,
    savings,
  };
}
