import React, { useState } from 'react';
import { Download, RefreshCw, Images, ArrowUp, ArrowDown, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { FileDropzone } from '../../components/FileDropzone';
import { imagesToPdf } from '../../utils/pdfUtils';
import { formatBytes } from '../../utils/imageUtils';
import { TOOLS } from '../../data/tools';

export const ImagesToPdfPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'images-to-pdf')!;
  const [images, setImages] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(20);

  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<{ url: string; size: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setImages((prev) => [...prev, ...newFiles]);
    setGeneratedPdf(null);
    setErrorMessage(null);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setImages(copy);
    setGeneratedPdf(null);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setGeneratedPdf(null);
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) {
      setErrorMessage('Please add at least one image file.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const pdfBytes = await imagesToPdf(images, {
        pageSize,
        orientation,
        margin,
      });
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setGeneratedPdf({
        url,
        size: blob.size,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate PDF from images.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (generatedPdf?.url) URL.revokeObjectURL(generatedPdf.url);
    setImages([]);
    setGeneratedPdf(null);
    setErrorMessage(null);
  };

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Upload one or more JPG, PNG, or WebP images.',
        'Use the up/down arrows to reorder pages as needed.',
        'Choose page format (A4 or exact image fit) and orientation.',
        'Click "Generate PDF Document" and download your compiled PDF.',
      ]}
    >
      <div className="space-y-6">
        {/* Upload Zone */}
        <FileDropzone
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          maxSizeMb={25}
          multiple={true}
          onFilesSelected={handleFilesSelected}
          title="Select or drag and drop images"
          subtitle="Supports JPG, PNG, and WebP (Add multiple to combine)"
        />

        {images.length > 0 && (
          <div className="space-y-6">
            {/* Options Bar */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="a4">A4 Document Standard</option>
                  <option value="fit">Fit to Image Size</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  disabled={pageSize === 'fit'}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 disabled:opacity-50"
                >
                  <option value="portrait">Portrait (Vertical)</option>
                  <option value="landscape">Landscape (Horizontal)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Margin</label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="0">No Margin (Borderless)</option>
                  <option value="20">Standard Margin (20 pt)</option>
                  <option value="40">Wide Margin (40 pt)</option>
                </select>
              </div>
            </div>

            {/* Reorderable Image Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pages Sequence ({images.length} Image{images.length === 1 ? '' : 's'}):
                </span>
                <button
                  onClick={() => setImages([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{formatBytes(file.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => moveImage(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                        title="Move Page Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveImage(idx, 'down')}
                        disabled={idx === images.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                        title="Move Page Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeImage(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleGeneratePdf}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compiling PDF Document...</span>
                  </>
                ) : (
                  <>
                    <Images className="w-4 h-4" />
                    <span>Generate PDF Document ({images.length} Pages)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Result Area */}
        {generatedPdf && (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Combined PDF Ready!
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Compiled {images.length} image{images.length === 1 ? '' : 's'} • {formatBytes(generatedPdf.size)}
                </p>
              </div>
            </div>
            <a
              href={generatedPdf.url}
              download="images-combined.pdf"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
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
