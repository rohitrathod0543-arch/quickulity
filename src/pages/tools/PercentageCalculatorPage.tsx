import React, { useState } from 'react';
import { Percent, ArrowRight, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import {
  calculatePartToWhole,
  calculatePercentOf,
  calculatePercentChange,
  calculateDiscount,
} from '../../utils/calcUtils';
import { TOOLS } from '../../data/tools';

export const PercentageCalculatorPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'percentage-calculator')!;

  const [activeTab, setActiveTab] = useState<'marks' | 'percentOf' | 'change' | 'discount'>('marks');

  // Mode 1: Marks / Total
  const [marksPart, setMarksPart] = useState<string>('450');
  const [marksTotal, setMarksTotal] = useState<string>('600');

  // Mode 2: What is X% of Y
  const [percentVal, setPercentVal] = useState<string>('15');
  const [ofTotalVal, setOfTotalVal] = useState<string>('240');

  // Mode 3: % Change
  const [changeInitial, setChangeInitial] = useState<string>('80');
  const [changeFinal, setChangeFinal] = useState<string>('100');

  // Mode 4: Discount
  const [originalPrice, setOriginalPrice] = useState<string>('120');
  const [discountPercent, setDiscountPercent] = useState<string>('20');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute live results
  let marksResult: { percent: number; ratio: string } | null = null;
  let percentOfResult: number | null = null;
  let percentChangeResult: { percentChange: number; isIncrease: boolean; diff: number } | null = null;
  let discountResult: { finalPrice: number; savings: number } | null = null;

  try {
    if (activeTab === 'marks') {
      const p = parseFloat(marksPart);
      const t = parseFloat(marksTotal);
      if (!isNaN(p) && !isNaN(t) && t !== 0) {
        marksResult = calculatePartToWhole(p, t);
      }
    } else if (activeTab === 'percentOf') {
      const p = parseFloat(percentVal);
      const v = parseFloat(ofTotalVal);
      if (!isNaN(p) && !isNaN(v)) {
        percentOfResult = calculatePercentOf(p, v);
      }
    } else if (activeTab === 'change') {
      const i = parseFloat(changeInitial);
      const f = parseFloat(changeFinal);
      if (!isNaN(i) && !isNaN(f) && i !== 0) {
        percentChangeResult = calculatePercentChange(i, f);
      }
    } else if (activeTab === 'discount') {
      const op = parseFloat(originalPrice);
      const dp = parseFloat(discountPercent);
      if (!isNaN(op) && !isNaN(dp) && op >= 0 && dp >= 0) {
        discountResult = calculateDiscount(op, dp);
      }
    }
  } catch (err: any) {
    // handled gracefully
  }

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Choose the calculation mode using the tabs below (Exam Marks, X% of Y, Percentage Change, or Discount).',
        'Enter your values in the input boxes.',
        'The calculated percentage and formula breakdown will update instantly.',
      ]}
      limitations={[
        'Total values cannot be zero in ratio calculations.',
        'Values are rounded to 2 decimal places for financial and academic accuracy.',
      ]}
    >
      <div className="space-y-6">
        {/* Mode Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => {
              setActiveTab('marks');
              setErrorMessage(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'marks'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Exam Marks / Total (X of Y)
          </button>

          <button
            onClick={() => {
              setActiveTab('percentOf');
              setErrorMessage(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'percentOf'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            What is X% of Y?
          </button>

          <button
            onClick={() => {
              setActiveTab('change');
              setErrorMessage(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'change'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            % Increase / Decrease
          </button>

          <button
            onClick={() => {
              setActiveTab('discount');
              setErrorMessage(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'discount'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Discount & Final Price
          </button>
        </div>

        {/* Tab 1: Marks / Total */}
        {activeTab === 'marks' && (
          <div className="space-y-6">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="marks-obtained-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Marks Obtained (or Part):
                </label>
                <input
                  id="marks-obtained-input"
                  type="number"
                  value={marksPart}
                  onChange={(e) => setMarksPart(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="total-marks-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Total Maximum Marks (or Whole):
                </label>
                <input
                  id="total-marks-input"
                  type="number"
                  value={marksTotal}
                  onChange={(e) => setMarksTotal(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {marksResult !== null && (
              <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Calculated Percentage
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-1">
                    {marksResult.percent}%
                  </div>
                  <p className="text-xs text-blue-100 mt-2 font-mono">
                    Formula: ({marksPart} ÷ {marksTotal}) × 100 = {marksResult.percent}%
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: What is X% of Y */}
        {activeTab === 'percentOf' && (
          <div className="space-y-6">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="percent-val-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Percentage (%):
                </label>
                <div className="relative">
                  <input
                    id="percent-val-input"
                    type="number"
                    value={percentVal}
                    onChange={(e) => setPercentVal(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label htmlFor="of-total-val-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Of Value / Number:
                </label>
                <input
                  id="of-total-val-input"
                  type="number"
                  value={ofTotalVal}
                  onChange={(e) => setOfTotalVal(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {percentOfResult !== null && (
              <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Calculated Result
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-1">
                  {percentOfResult}
                </div>
                <p className="text-xs text-blue-100 mt-2 font-mono">
                  {percentVal}% of {ofTotalVal} = {percentOfResult}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: % Increase / Decrease */}
        {activeTab === 'change' && (
          <div className="space-y-6">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="initial-value-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Initial Value (From):
                </label>
                <input
                  id="initial-value-input"
                  type="number"
                  value={changeInitial}
                  onChange={(e) => setChangeInitial(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="final-value-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Final Value (To):
                </label>
                <input
                  id="final-value-input"
                  type="number"
                  value={changeFinal}
                  onChange={(e) => setChangeFinal(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {percentChangeResult !== null && (
              <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  {percentChangeResult.isIncrease ? 'Percentage Increase' : 'Percentage Decrease'}
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-1">
                  {percentChangeResult.isIncrease ? '+' : '-'}
                  {percentChangeResult.percentChange}%
                </div>
                <p className="text-xs text-blue-100 mt-2 font-mono">
                  Absolute Difference: {percentChangeResult.diff >= 0 ? `+${percentChangeResult.diff}` : percentChangeResult.diff}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Discount & Savings */}
        {activeTab === 'discount' && (
          <div className="space-y-6">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="original-price-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Original Price ($):
                </label>
                <input
                  id="original-price-input"
                  type="number"
                  min="0"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="discount-percent-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Discount Percentage (%):
                </label>
                <div className="relative">
                  <input
                    id="discount-percent-input"
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-400 font-bold">%</span>
                </div>
              </div>
            </div>

            {discountResult !== null && (
              <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    Final Discounted Price
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-1">
                    ${discountResult.finalPrice}
                  </div>
                  <p className="text-xs text-emerald-100 mt-2">
                    Total Savings: <strong className="text-white">${discountResult.savings}</strong> ({discountPercent}% off)
                  </p>
                </div>
              </div>
            )}
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
