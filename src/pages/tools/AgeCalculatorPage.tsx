import React, { useState } from 'react';
import { Calendar, RefreshCw, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { calculateAge } from '../../utils/calcUtils';
import { AgeCalculationResult } from '../../types';
import { TOOLS } from '../../data/tools';

export const AgeCalculatorPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'age-calculator')!;

  const todayStr = new Date().toISOString().split('T')[0];
  const [birthDate, setBirthDate] = useState<string>('1998-05-15');
  const [asOfDate, setAsOfDate] = useState<string>(todayStr);

  const [result, setResult] = useState<AgeCalculationResult | null>(() => {
    try {
      return calculateAge('1998-05-15', todayStr);
    } catch {
      return null;
    }
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCalculate = (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorMessage(null);

    try {
      const res = calculateAge(birthDate, asOfDate);
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to calculate age.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setBirthDate('');
    setAsOfDate(todayStr);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Select your date of birth in the first field.',
        'Choose the comparison date (defaults to today, or pick any historical or future comparison date).',
        'Click "Calculate Precise Age".',
        'Explore your chronological age, next birthday countdown, total weeks, and astronomical zodiac sign.',
      ]}
      limitations={[
        'Birth dates occurring after the comparison date are rejected with validation protection.',
        'Accurately calculates calendar month lengths and leap years (February 29).',
      ]}
    >
      <div className="space-y-6">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="birthdate-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Date of Birth:
              </label>
              <input
                id="birthdate-input"
                type="date"
                required
                max={asOfDate || todayStr}
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="as-of-date-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Age as of Date:
              </label>
              <input
                id="as-of-date-input"
                type="date"
                required
                value={asOfDate}
                onChange={(e) => {
                  setAsOfDate(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Calculate Precise Age</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Results Card */}
        {result && (
          <div className="space-y-6 animate-in fade-in">
            {/* Primary Result Banner */}
            <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Chronological Age
              </span>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">{result.years}</span>
                  <span className="text-blue-200 text-sm font-medium">years</span>
                </div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight">{result.months}</span>
                  <span className="text-blue-200 text-sm font-medium">months</span>
                </div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight">{result.days}</span>
                  <span className="text-blue-200 text-sm font-medium">days</span>
                </div>
              </div>
              <p className="text-xs text-blue-100 mt-3">
                Born on a <strong className="text-white">{result.dayOfWeekBorn}</strong>
                {result.isLeapYearBorn ? ' (Leap Year Baby)' : ''}.
              </p>
            </div>

            {/* Detailed Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Next Birthday
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block">
                  {result.nextBirthdayDays} {result.nextBirthdayDays === 1 ? 'day' : 'days'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Countdown</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Weeks Lived
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block">
                  {result.totalWeeks.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">approx. weeks</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Days Lived
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block">
                  {result.totalDays.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">complete days</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Zodiac Sign
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block truncate">
                  {result.zodiacSign.split(' ')[0]}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {result.zodiacSign}
                </span>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
