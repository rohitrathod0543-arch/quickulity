import React, { useState } from 'react';
import { Download, RefreshCw, Layers, ArrowUp, ArrowDown, Trash2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { FileDropzone } from '../../components/FileDropzone';
import { mergePdfFiles, getPdfInfo, PdfFileInfo } from '../../utils/pdfUtils';
import { formatBytes } from '../../utils/imageUtils';
import { TOOLS } from '../../data/tools';

export const MergePdfPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'merge-pdf')!;
  const [files, setFiles] = useState<Array<{ file: File; info?: PdfFileInfo }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdf, setMergedPdf] = useState<{ url: string; size: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    setMergedPdf(null);
    setErrorMessage(null);

    const loaded = await Promise.all(
      newFiles.map(async (file) => {
        try {
          const info = await getPdfInfo(file);
          return { file, info };
        } catch {
          return { file };
        }
      })
    );

    setFiles((prev) => [...prev, ...loaded]);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const copy = [...files];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setFiles(copy);
    setMergedPdf(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedPdf(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setErrorMessage('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const mergedBytes = await mergePdfFiles(files.map((f) => f.file));
      const blob = new Blob([mergedBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdf({
        url,
        size: blob.size,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to merge PDF files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPagesCount = files.reduce((acc, f) => acc + (f.info?.pageCount || 0), 0);

  const handleReset = () => {
    if (mergedPdf?.url) URL.revokeObjectURL(mergedPdf.url);
    setFiles([]);
    setMergedPdf(null);
    setErrorMessage(null);
  };

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Upload 2 or more PDF documents.',
        'Arrange the files into your preferred order with the up and down arrows.',
        'Click "Merge PDFs" to combine all pages into a single document.',
        'Download your merged PDF directly to your device.',
      ]}
    >
      <div className="space-y-6">
        <FileDropzone
          accept=".pdf"
          maxSizeMb={50}
          multiple={true}
          onFilesSelected={handleFilesSelected}
          title="Select or drop multiple PDF files to merge"
          subtitle="Add 2 or more PDF files • Supports reordering"
        />

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Document Sequence ({files.length} Files{totalPagesCount > 0 ? ` • ${totalPagesCount} Total Pages` : ''}):
              </span>
              <button
                onClick={handleReset}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2">
              {files.map((item, idx) => (
                <div
                  key={`${item.file.name}-${idx}`}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.file.name}</p>
                      <p className="text-xs text-slate-400">
                        {formatBytes(item.file.size)}
                        {item.info?.pageCount ? ` • ${item.info.pageCount} page(s)` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => moveFile(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-25 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveFile(idx, 'down')}
                      disabled={idx === files.length - 1}
                      className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-25 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={handleMerge}
                disabled={isProcessing || files.length < 2}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Merging PDF Documents...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Merge {files.length} PDF Documents</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {mergedPdf && (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Merged PDF Document Ready!
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Combined {files.length} files • {formatBytes(mergedPdf.size)}
                </p>
              </div>
            </div>
            <a
              href={mergedPdf.url}
              download="merged-document.pdf"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Merged PDF</span>
            </a>
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
