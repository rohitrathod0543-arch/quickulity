import React, { useState, useEffect } from 'react';
import { Download, Sliders, RefreshCw, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { FileDropzone } from '../../components/FileDropzone';
import { compressImage, formatBytes, fileToDataUrl, ImageProcessingResult } from '../../utils/imageUtils';
import { TOOLS } from '../../data/tools';

export const ImageCompressorPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'image-compressor')!;
  const [file, setFile] = useState<File | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string>('');
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImageProcessingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setResult(null);
      setErrorMessage(null);
      const url = await fileToDataUrl(selected);
      setOriginalDataUrl(url);
    }
  };

  const runCompression = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await compressImage(file, quality / 100, format);
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Compression failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (file) {
      const timer = setTimeout(() => {
        runCompression();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [file, quality, format]);

  const handleReset = () => {
    setFile(null);
    setOriginalDataUrl('');
    setResult(null);
    setErrorMessage(null);
  };

  const getExtension = () => {
    if (format === 'image/webp') return 'webp';
    if (format === 'image/png') return 'png';
    return 'jpg';
  };

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Upload your image (JPG, PNG, or WebP).',
        'Adjust the quality slider to find your desired balance between file size and sharpness.',
        'Choose output format (JPEG or WebP for optimal compression).',
        'Compare before and after previews and click "Download Compressed Image".',
      ]}
    >
      <div className="space-y-6">
        {!file ? (
          <FileDropzone
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            maxSizeMb={30}
            multiple={false}
            onFilesSelected={handleFilesSelected}
            title="Select or drop an image to compress"
            subtitle="JPG, PNG, or WebP up to 30 MB • Live visual preview"
          />
        ) : (
          <div className="space-y-6">
            {/* Controls Bar */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label htmlFor="quality-slider" className="text-slate-800">Compression Quality: {quality}%</label>
                  <span className="text-slate-500">
                    {quality >= 80 ? 'High Fidelity' : quality >= 50 ? 'Balanced' : 'Max Compression'}
                  </span>
                </div>
                <input
                  id="quality-slider"
                  type="range"
                  min="5"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Smallest File (5%)</span>
                  <span>Recommended (80%)</span>
                  <span>Best Quality (100%)</span>
                </div>
              </div>

              {/* Format Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-800 block">Output Format</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('image/jpeg')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      format === 'image/jpeg'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    JPEG
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('image/webp')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      format === 'image/webp'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    WebP (Modern)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('image/png')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      format === 'image/png'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    PNG
                  </button>
                </div>
              </div>
            </div>

            {/* Live Size Metrics */}
            {result && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-6 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Original</span>
                    <span className="font-bold text-slate-800 line-through">
                      {formatBytes(result.originalBytes)}
                    </span>
                  </div>
                  <div className="text-slate-400 font-bold">→</div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Compressed</span>
                    <span className="font-bold text-emerald-700 text-base">
                      {formatBytes(result.sizeBytes)}
                    </span>
                  </div>
                  {result.savedPercent > 0 && (
                    <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-extrabold text-xs">
                      -{result.savedPercent}%
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <a
                    href={result.dataUrl}
                    download={`${file.name.replace(/\.[^/.]+$/, '')}_compressed.${getExtension()}`}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Image</span>
                  </a>
                  <button
                    onClick={handleReset}
                    className="px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Visual Side-by-Side Comparison */}
            {result && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Original ({formatBytes(file.size)})
                  </span>
                  <div className="w-full h-64 flex items-center justify-center overflow-hidden rounded-lg bg-white">
                    <img
                      src={originalDataUrl}
                      alt="Original"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex flex-col items-center">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                    Compressed ({formatBytes(result.sizeBytes)})
                  </span>
                  <div className="w-full h-64 flex items-center justify-center overflow-hidden rounded-lg bg-white">
                    <img
                      src={result.dataUrl}
                      alt="Compressed preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
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
