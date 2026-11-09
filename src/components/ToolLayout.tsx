import React from 'react';
import { ShieldCheck, ChevronRight, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { AdSenseSlot } from './AdSenseSlot';
import { TOOLS } from '../data/tools';
import { ToolMeta } from '../types';

interface ToolLayoutProps {
  tool: ToolMeta;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
  instructions?: string[];
  limitations?: string[];
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  onNavigate,
  children,
  instructions,
  limitations,
}) => {
  const relatedTools = TOOLS.filter((t) => t.id !== tool.id && t.category === tool.category).slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6 font-medium">
        <button onClick={() => onNavigate('/')} className="hover:text-blue-600">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="capitalize text-slate-600">{tool.category} Tools</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold">{tool.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {tool.name}
            </h1>
            {tool.badge && (
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                {tool.badge}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            {tool.longDesc}
          </p>
        </div>

        {/* Privacy Pill */}
        <div className="shrink-0 flex items-center space-x-2 bg-emerald-50/90 border border-emerald-200/80 px-3.5 py-2 rounded-xl text-emerald-800 text-xs font-semibold self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Local In-Browser Processing</span>
        </div>
      </div>

      {/* Main Tool Workspace */}
      <main className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {children}
      </main>

      {/* Non-intrusive AdSense Container below workspace (Rule compliant: never beside action buttons) */}
      <AdSenseSlot slotId="tool-bottom" className="mt-8" />

      {/* Instructions & Technical Transparency Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        {/* Step-by-Step Guide */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 font-bold text-slate-900 mb-4">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>How to Use This Tool</span>
          </div>
          <ol className="space-y-3 text-slate-600">
            {(instructions || [
              'Upload your file or select the desired options in the tool area above.',
              'Adjust target parameters (dimensions, quality, page ranges, or colors).',
              'Preview your result in real time.',
              'Click the download button to save the generated file directly to your device.',
            ]).map((step, idx) => (
              <li key={idx} className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Honest Limitations & Engine Disclosures */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 font-bold text-slate-900 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Privacy & Processing Guarantee</span>
          </div>
          <ul className="space-y-2.5 text-slate-600 text-xs sm:text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>
                <strong>100% Client-Side Memory:</strong> Your documents never leave your computer or get saved on any server.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>
                <strong>Zero Registration:</strong> No signups, email walls, or daily usage quotas.
              </span>
            </li>
            {(limitations || [
              'Standard formatting: Complex multi-column layouts and custom proprietary embedded fonts might be normalized for standard document viewers.',
              'Scanned PDFs without digital text streams require optical OCR to convert to editable text.',
            ]).map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-slate-500">
                <span className="text-slate-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Related Utilities */}
      {relatedTools.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            Related {tool.category.toUpperCase()} Utilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((rel) => (
              <button
                key={rel.id}
                onClick={() => onNavigate(rel.path)}
                className="p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-xl text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                    {rel.name}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {rel.shortDesc}
                  </p>
                </div>
                <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-blue-600">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
