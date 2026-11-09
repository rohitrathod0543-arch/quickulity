import React, { useState } from 'react';
import { Download, RefreshCw, HardDrive, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { FileDropzone } from '../../components/FileDropzone';
import { reduceImageToTargetKb, formatBytes, ImageProcessingResult } from '../../utils/imageUtils';
import { TOOLS } from '../../data/tools';

export const ImageKbReducerPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'image-kb-reducer')!;
  const [file, setFile] = useState<File | null>(null);
  const [targetKb, setTargetKb] = useState<number>(50);
  const [customKb, setCustomKb] = useState<string>('50');

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ res: ImageProcessingResult; iterations: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setErrorMessage(null);
    }
  };

  const handleSelectPreset = (kb: number) => {
    setTargetKb(kb);
    setCustomKb(kb.toString());
  };

  const handleCustomChange = (val: string) => {
    setCustomKb(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setTargetKb(parsed);
    }
  };

  const handleReduce = async () => {
    if (!file || targetKb <= 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const output = await reduceImageToTargetKb(file, targetKb, 'image/jpeg');
      setResult({
        res: output.result,
        iterations: output.iterations,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to reach target file size.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setErrorMessage(null);
  };

  const actualKb = result ? (result.res.sizeBytes / 1024).toFixed(1) : null;
  const isStrictlyUnderTarget = result ? result.res.sizeBytes <= targetKb * 1024 : false;

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Upload your image (photo, signature, scanned document, or graphic).',
        'Select a target preset (20 KB, 50 KB, 100 KB) or enter a custom KB limit.',
        'Click "Compress to Exact KB Target". Our binary search algorithm iteratively optimizes quality and dimensions to hit your target.',
        'Review the measured resulting size in bytes and download the file.',
      ]}
      limitations={[
        'To reach extreme targets (such as 20 KB on large multi-megapixel photos), dimensions may be scaled down in tandem with compression to preserve image integrity without severe artifacting.',
        'Files are output in JPEG format for maximum standards compliance across application and government portals.',
      ]}
    >
      <div className="space-y-6">
        {!file ? (
          <FileDropzone
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            maxSizeMb={30}
            multiple={false}
            onFilesSelected={handleFilesSelected}
            title="Select or drop image to reduce to exact KB"
            subtitle="Hit strict portal upload requirements (20 KB, 50 KB, 100 KB)"
          />
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{file.name}</p>
                <p className="text-xs text-slate-500">
                  Current Size: <span className="font-bold text-slate-700">{formatBytes(file.size)}</span>
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Change Image
              </button>
            </div>

            {/* Target KB Selector */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Target Maximum File Size:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[20, 50, 100, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`py-3 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                        targetKb === preset && customKb === preset.toString()
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span className="block text-base font-extrabold">{preset} KB</span>
                      <span className="block text-[10px] text-slate-400">
                        {preset === 20 ? 'Government Portals' : preset === 50 ? 'Application Forms' : 'Standard Web'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="pt-2 border-t border-slate-100 flex items-center space-x-3">
                <label htmlFor="custom-kb-input" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                  Custom Target Size:
                </label>
                <div className="relative w-36">
                  <input
                    id="custom-kb-input"
                    type="number"
                    min="5"
                    max="5000"
                    value={customKb}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 pr-10"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">KB</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleReduce}
                disabled={isProcessing || targetKb <= 0}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Optimizing to Target KB...</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-4 h-4" />
                    <span>Compress to Target ({targetKb} KB)</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Area */}
            {result && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold text-lg">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>
                        Target Reached: {actualKb} KB (Target: ≤ {targetKb} KB)
                      </span>
                    </div>

                    <div className="flex items-center space-x-6 text-xs sm:text-sm">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Original</span>
                        <span className="font-bold text-slate-800 line-through">
                          {formatBytes(result.res.originalBytes)}
                        </span>
                      </div>
                      <div className="text-slate-400 font-bold">→</div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Actual Measured</span>
                        <span className="font-extrabold text-emerald-700 text-base">
                          {formatBytes(result.res.sizeBytes)} ({actualKb} KB)
                        </span>
                      </div>
                      <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-extrabold text-xs">
                        -{result.res.savedPercent}%
                      </div>
                    </div>
                  </div>

                  <a
                    href={result.res.dataUrl}
                    download={`${file.name.replace(/\.[^/.]+$/, '')}_${actualKb}kb.jpg`}
                    className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {actualKb} KB Image</span>
                  </a>
                </div>

                {/* Preview Thumbnail */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center">
                  <span className="text-xs font-semibold text-slate-500 mb-2">
                    Verified Output Dimensions: {result.res.width} × {result.res.height} px
                  </span>
                  <div className="max-h-60 overflow-hidden rounded-lg bg-white p-2 border border-slate-200">
                    <img
                      src={result.res.dataUrl}
                      alt="Target preview"
                      className="max-h-56 object-contain"
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
