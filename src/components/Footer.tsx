import React from 'react';
import { Zap, ShieldCheck, Lock, Heart } from 'lucide-react';
import { TOOLS } from '../data/tools';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const pdfTools = TOOLS.filter((t) => t.category === 'pdf');
  const imageTools = TOOLS.filter((t) => t.category === 'image');
  const dailyTools = TOOLS.filter((t) => t.category === 'daily');

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center space-x-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                QUICK<span className="text-blue-500">UTILITY</span>
              </span>
            </button>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              QuickUtility provides 15 fast, zero-install, privacy-first web utilities. Every document and image is processed directly inside your browser’s local sandbox without cloud server uploads.
            </p>
            <div className="flex flex-col space-y-2 pt-2">
              <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Server Uploads: Files stay strictly on your device</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-blue-400 font-medium">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>No user account or tracking cookies required</span>
              </div>
            </div>
          </div>

          {/* PDF Tools */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              PDF Utilities
            </h3>
            <ul className="space-y-2">
              {pdfTools.map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => onNavigate(tool.path)}
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Tools */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Image Utilities
            </h3>
            <ul className="space-y-2">
              {imageTools.map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => onNavigate(tool.path)}
                    className="hover:text-emerald-400 transition-colors text-left"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Daily & Legal */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Daily & Legal
            </h3>
            <ul className="space-y-2">
              {dailyTools.map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => onNavigate(tool.path)}
                    className="hover:text-amber-400 transition-colors text-left"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-slate-800">
                <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">
                  About QuickUtility
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} QuickUtility Platform. Built for speed, privacy, and productivity.</p>
          <p className="flex items-center space-x-1">
            <span>Client-side powered with WebAssembly & modern browser APIs</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
