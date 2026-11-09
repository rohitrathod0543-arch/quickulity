import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, FileText, Image as ImageIcon, Calculator, Zap } from 'lucide-react';
import { TOOLS } from '../data/tools';
import { ToolMeta } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectTool }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global hotkey Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent can toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTools = TOOLS.filter((tool) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.shortDesc.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.features.some((f) => f.toLowerCase().includes(q))
    );
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-500" />;
      default:
        return <Calculator className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 flex items-center px-4">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools by name, action (e.g. merge, compress, passport, age)..."
            className="w-full py-4 px-3 text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No tools found matching "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for "PDF", "resize", "passport", "DOCX", or "calculator".
              </p>
            </div>
          ) : (
            filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.path);
                  onClose();
                }}
                className="w-full text-left p-3 hover:bg-blue-50/80 rounded-xl transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm">
                    {getCategoryIcon(tool.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-600">
                        {tool.name}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {tool.shortDesc}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
          <span>{filteredTools.length} of 15 tools shown</span>
          <span>Click tool or press Enter to launch</span>
        </div>
      </div>
    </div>
  );
};
