import React, { useState } from 'react';
import { Download, RefreshCw, Scissors, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { FileDropzone } from '../../components/FileDropzone';
import { splitPdfFile, getPdfInfo } from '../../utils/pdfUtils';
import { formatBytes } from '../../utils/imageUtils';
import { TOOLS } from '../../data/tools';

export const SplitPdfPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'split-pdf')!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [rangeInput, setRangeInput] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [splitResult, setSplitResult] = useState<{ url: string; size: number; pageCount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setSplitResult(null);
      setErrorMessage(null);
      try {
        const info = await getPdfInfo(selected);
        setPageCount(info.pageCount);
        setRangeInput(info.pageCount > 1 ? `1-${Math.min(3, info.pageCount)}` : '1');
      } catch (err: any) {
        setErrorMessage(err.message || 'Could not inspect PDF pages.');
      }
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await splitPdfFile(file, rangeInput);
      const blob = new Blob([result.pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setSplitResult({
        url,
        size: blob.size,
        pageCount: result.pageCount,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to split PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const setPresetRange = (type: 'all' | 'firstHalf' | 'odd' | 'even') => {
    if (!pageCount) return;
    if (type === 'all') {
      setRangeInput(`1-${pageCount}`);
    } else if (type === 'firstHalf') {
      const half = Math.max(1, Math.floor(pageCount / 2));
      setRangeInput(`1-${half}`);
    } else if (type === 'odd') {
      const odds = [];
      for (let i = 1; i <= pageCount; i += 2) odds.push(i);
      setRangeInput(odds.join(', '));
    } else if (type === 'even') {
      const evens = [];
      for (let i = 2; i <= pageCount; i += 2) evens.push(i);
      setRangeInput(evens.join(', '));
    }
  };

  const handleReset = () => {
    if (splitResult?.url) URL.revokeObjectURL(splitResult.url);
    setFile(null);
    setPageCount(null);
    setSplitResult(null);
    setErrorMessage(null);
  };

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Upload the PDF document you want to split.',
        'Enter page numbers or ranges (e.g. 1-3, 5, 8-10) or choose a quick preset.',
        'Click "Extract & Split PDF".',
        'Download your newly generated PDF containing only the selected pages.',
      ]}
    >
      <div className="space-y-6">
        {!file ? (
          <FileDropzone
            accept=".pdf"
            maxSizeMb={50}
            multiple={false}
            onFilesSelected={handleFilesSelected}
            title="Select or drop your PDF document to split"
            subtitle="Extract specific pages or custom page ranges"
          />
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  PDF
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatBytes(file.size)} {pageCount ? `• ${pageCount} total pages` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Change PDF
              </button>
            </div>

            {/* Range Input Section */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
              <label className="block text-sm font-bold text-slate-900">
                Specify Page Numbers or Ranges to Extract:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSplit}
                  disabled={isProcessing || !rangeInput.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Splitting...</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" />
                      <span>Extract & Split PDF</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Preset Buttons */}
              {pageCount && pageCount > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <span className="text-slate-400 font-medium mr-1">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setPresetRange('firstHalf')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer"
                  >
                    First Half (1-{Math.floor(pageCount / 2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetRange('odd')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer"
                  >
                    Odd Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetRange('even')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer"
                  >
                    Even Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetRange('all')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer"
                  >
                    All Pages (1-{pageCount})
                  </button>
                </div>
              )}
            </div>

            {/* Result Area */}
            {splitResult && (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Split PDF Ready!
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Extracted {splitResult.pageCount} page(s) • {formatBytes(splitResult.size)}
                    </p>
                  </div>
                </div>
                <a
                  href={splitResult.url}
                  download={`${file.name.replace(/\.[^/.]+$/, '')}_split.pdf`}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Extracted PDF</span>
                </a>
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
