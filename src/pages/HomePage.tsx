import React, { useState } from 'react';
import {
  Search,
  Zap,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Calculator,
  ArrowRight,
  Lock,
  Sparkles,
  Sliders,
  CheckCircle2,
  HardDrive,
  UserCheck,
  Calendar,
  Percent,
  Briefcase,
  QrCode,
  Layers,
  Scissors,
  Minimize2,
  FileCheck,
  Images,
} from 'lucide-react';
import { TOOLS } from '../data/tools';
import { ToolMeta, ToolCategory } from '../types';
import { AdSenseSlot } from '../components/AdSenseSlot';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ToolCategory>('all');

  // Filter tools based on query and category
  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesQuery =
      tool.name.toLowerCase().includes(q) ||
      tool.shortDesc.toLowerCase().includes(q) ||
      tool.features.some((f) => f.toLowerCase().includes(q));

    return matchesCategory && matchesQuery;
  });

  const getToolIcon = (iconName: string, category: ToolCategory) => {
    const props = { className: 'w-6 h-6' };
    switch (iconName) {
      case 'FileText':
        return <FileText {...props} className="w-6 h-6 text-rose-500" />;
      case 'FileCheck':
        return <FileCheck {...props} className="w-6 h-6 text-rose-600" />;
      case 'Images':
        return <Images {...props} className="w-6 h-6 text-rose-500" />;
      case 'Image':
        return <ImageIcon {...props} className="w-6 h-6 text-rose-600" />;
      case 'Layers':
        return <Layers {...props} className="w-6 h-6 text-rose-500" />;
      case 'Scissors':
        return <Scissors {...props} className="w-6 h-6 text-rose-600" />;
      case 'Minimize2':
        return <Minimize2 {...props} className="w-6 h-6 text-rose-500" />;
      case 'Sliders':
        return <Sliders {...props} className="w-6 h-6 text-emerald-500" />;
      case 'Maximize':
        return <ImageIcon {...props} className="w-6 h-6 text-emerald-600" />;
      case 'HardDrive':
        return <HardDrive {...props} className="w-6 h-6 text-emerald-500" />;
      case 'UserCheck':
        return <UserCheck {...props} className="w-6 h-6 text-emerald-600" />;
      case 'Calendar':
        return <Calendar {...props} className="w-6 h-6 text-amber-500" />;
      case 'Percent':
        return <Percent {...props} className="w-6 h-6 text-amber-600" />;
      case 'Briefcase':
        return <Briefcase {...props} className="w-6 h-6 text-indigo-500" />;
      case 'QrCode':
        return <QrCode {...props} className="w-6 h-6 text-indigo-600" />;
      default:
        return <Zap {...props} className="w-6 h-6 text-blue-500" />;
    }
  };

  const popularTools = TOOLS.filter((t) => Boolean(t.badge));

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-14 bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>100% In-Browser Privacy • Zero Server Uploads</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            15 Free Essential Online Tools. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Fast, Private & Zero-Install.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Convert, merge, split, and compress PDFs, resize photos, make passport prints, solve percentages, and build print-ready resumes directly inside your browser.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center shadow-lg shadow-blue-500/5 rounded-2xl border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all 15 utilities (e.g. merge pdf, passport photo, word to pdf)..."
                className="w-full py-4 px-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mr-3 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AdSense Slot 1 (Between hero and content sections, strictly compliant with Prompt Section G) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSenseSlot slotId="home-mid" />
      </div>

      {/* Main Tools Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              All Utilities (15)
            </button>
            <button
              onClick={() => setSelectedCategory('pdf')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedCategory === 'pdf'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-rose-500" />
              <span>PDF Tools (7)</span>
            </button>
            <button
              onClick={() => setSelectedCategory('image')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedCategory === 'image'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              <span>Image Tools (4)</span>
            </button>
            <button
              onClick={() => setSelectedCategory('daily')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedCategory === 'daily'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4 text-amber-500" />
              <span>Daily & Productivity (4)</span>
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Showing {filteredTools.length} of 15 tools
          </span>
        </div>

        {/* Tools Cards Grid */}
        {filteredTools.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No matching tools found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any tool matching "{searchQuery}". Try browsing by category or clearing your search.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => onNavigate(tool.path)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all p-6 flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getToolIcon(tool.iconName, tool.category)}
                    </div>
                    {tool.badge && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {tool.name}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                      {tool.shortDesc}
                    </p>
                  </div>

                  {/* Feature chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tool.features.slice(0, 2).map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Tools Highlights (Reflects actual tools only) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-2xl space-y-3 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Instant Productivity
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Why QuickUtility is 100% Client-Side Private
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unlike traditional conversion sites that upload your confidential contracts and private photos to third-party cloud servers, QuickUtility processes everything directly in your browser’s memory using WebAssembly and HTML5 APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Zero Server Uploads</h3>
              <p className="text-slate-300">
                Your files remain strictly inside your browser tab and are never transmitted over the network.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm text-white">Instant Speed</h3>
              <p className="text-slate-300">
                Eliminates slow upload queues and network latencies. Conversions run immediately on your device hardware.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">No Signup or Limits</h3>
              <p className="text-slate-300">
                No email walls, subscriptions, or daily conversion limits. Free and open whenever you need it.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
