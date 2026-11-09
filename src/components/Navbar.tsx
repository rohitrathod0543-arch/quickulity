import React, { useState } from 'react';
import {
  Zap,
  ShieldCheck,
  Search,
  Menu,
  X,
  FileText,
  Image as ImageIcon,
  Calculator,
  ChevronDown,
  Download,
} from 'lucide-react';
import { TOOLS } from '../data/tools';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState<string | null>(null);

  const pdfTools = TOOLS.filter((t) => t.category === 'pdf');
  const imageTools = TOOLS.filter((t) => t.category === 'image');
  const dailyTools = TOOLS.filter((t) => t.category === 'daily');

  const handleToolClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setCategoryDropdown(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleToolClick('/')}
              className="flex items-center space-x-2.5 text-left group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  QUICK<span className="text-blue-600">UTILITY</span>
                </span>
                <span className="hidden sm:block text-[11px] font-medium text-slate-400 tracking-wide uppercase">
                  Fast • Private • In-Browser
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {/* PDF Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdown(categoryDropdown === 'pdf' ? null : 'pdf')}
                className="flex items-center space-x-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4 text-rose-500" />
                <span>PDF Tools</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {categoryDropdown === 'pdf' && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    7 PDF Utilities
                  </div>
                  {pdfTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.path)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                    >
                      <span className="font-medium">{tool.name}</span>
                      {tool.badge && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded">
                          {tool.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Image Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdown(categoryDropdown === 'image' ? null : 'image')}
                className="flex items-center space-x-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                <span>Image Tools</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {categoryDropdown === 'image' && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    4 Image Utilities
                  </div>
                  {imageTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.path)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
                    >
                      <span className="font-medium">{tool.name}</span>
                      {tool.badge && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                          {tool.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Daily Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdown(categoryDropdown === 'daily' ? null : 'daily')}
                className="flex items-center space-x-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Calculator className="w-4 h-4 text-amber-500" />
                <span>Daily & Work</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {categoryDropdown === 'daily' && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Calculators & Builders
                  </div>
                  {dailyTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.path)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center justify-between"
                    >
                      <span className="font-medium">{tool.name}</span>
                      {tool.badge && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                          {tool.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Search Trigger & Privacy Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              title="Search all 15 tools"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Search tools...</span>
              <kbd className="hidden lg:inline text-[10px] bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-400 font-mono">
                Ctrl K
              </kbd>
            </button>


            <div className="hidden xl:flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% In-Browser Privacy</span>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              PDF Tools
            </div>
            {pdfTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.path)}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 rounded-lg flex items-center justify-between"
              >
                <span>{tool.name}</span>
                {tool.badge && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                    {tool.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Image Tools
            </div>
            {imageTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.path)}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 rounded-lg flex items-center justify-between"
              >
                <span>{tool.name}</span>
                {tool.badge && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                    {tool.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Daily & Productivity
            </div>
            {dailyTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.path)}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-amber-50 rounded-lg flex items-center justify-between"
              >
                <span>{tool.name}</span>
                {tool.badge && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
                    {tool.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <a
              href="/quickutility-source.zip"
              download="quickutility-source.zip"
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Project Source ZIP</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
