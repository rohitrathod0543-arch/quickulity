import React from 'react';
import { Zap, ShieldCheck, Heart, Cpu, Globe2, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          <span>About QuickUtility</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy-First Utilities Powered by Your Browser
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          QuickUtility was built to eliminate the security risks of uploading confidential documents, tax forms, and family photos to unknown servers.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 text-sm text-slate-700 leading-relaxed shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Our Core Philosophy</h2>
        <p>
          Most traditional online PDF converters and image resizers operate as server-centric funnels: you upload your file, their servers process it, and you download the result. This model is slow, creates severe privacy vulnerabilities, and exposes personal data to potential leaks and cloud retention.
        </p>
        <p>
          QuickUtility takes an entirely different architectural path: <strong>100% Client-Side Processing</strong>. Using WebAssembly, HTML5 Canvas, and modern in-browser JavaScript engines, all conversions, mergers, compressions, and crops take place right on your local CPU and RAM.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Zero Data Retention</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your documents never touch our disks or databases because no backend file upload route exists.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <Cpu className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">WASM & Canvas Speed</h3>
            <p className="text-xs text-slate-500 mt-1">
              Runs instantaneously on your laptop, phone, or tablet without network throttling or queue times.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <Globe2 className="w-6 h-6 text-indigo-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Universal Accessibility</h3>
            <p className="text-xs text-slate-500 mt-1">
              15 high-frequency tools packaged in a lightweight, responsive interface accessible from any modern browser.
            </p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-900 pt-4">15 Built-in Utilities</h2>
        <p>
          We provide 7 specialized PDF utilities (Word to PDF, PDF to Word, Merge, Split, Compress, Images to PDF, PDF to Images), 4 advanced image processors (Compressor, Pixel Resizer, Exact KB Reducer, Passport Photo Maker), and 4 daily productivity calculators and builders (Age Calculator, Percentage Calculator, ATS Resume Builder, and QR Generator).
        </p>

        <div className="pt-4 flex justify-center">
          <button
            onClick={() => onNavigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center space-x-2 transition-all cursor-pointer"
          >
            <span>Explore All 15 Tools</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
