import React, { useState, useEffect } from 'react';
import { Download, Maximize, Lock, Unlock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { FileDropzone } from '../../components/FileDropzone';
import { resizeImage, loadImage, formatBytes, ImageProcessingResult } from '../../utils/imageUtils';
import { TOOLS } from '../../data/tools';

export const ImageResizerPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'image-resizer')!;
  const [file, setFile] = useState<File | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);

  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImageProcessingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setResult(null);
      setErrorMessage(null);

      try {
        const img = await loadImage(selected);
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        setOriginalWidth(w);
        setOriginalHeight(h);
        setWidth(w);
        setHeight(h);
      } catch (err: any) {
        setErrorMessage('Failed to decode image dimensions.');
      }
    }
  };

  const handleWidthChange = (newW: number) => {
    setWidth(newW);
    if (lockAspectRatio && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(newW * ratio));
    }
  };

  const handleHeightChange = (newH: number) => {
    setHeight(newH);
    if (lockAspectRatio && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(newH * ratio));
    }
  };

  const applyPreset = (presetW: number, presetH: number) => {
    setWidth(presetW);
    setHeight(presetH);
  };

  const applyPercentScale = (percent: number) => {
    if (originalWidth > 0 && originalHeight > 0) {
      const scale = percent / 100;
      setWidth(Math.round(originalWidth * scale));
      setHeight(Math.round(originalHeight * scale));
    }
  };

  const handleResize = async () => {
    if (!file || width <= 0 || height <= 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await resizeImage(file, width, height, format, 0.92);
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Image resizing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setWidth(0);
    setHeight(0);
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
        'Upload your image.',
        'Enter target width and height in pixels, or choose a popular platform preset.',
        'Toggle aspect-ratio lock on or off depending on whether you want to prevent distortion.',
        'Click "Resize Image" and download the scaled graphic.',
      ]}
    >
      <div className="space-y-6">
        {!file ? (
          <FileDropzone
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            maxSizeMb={30}
            multiple={false}
            onFilesSelected={handleFilesSelected}
            title="Select or drop an image to resize"
            subtitle="Change pixel dimensions with aspect ratio protection"
          />
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{file.name}</p>
                <p className="text-xs text-slate-500">
                  Original Dimensions: <span className="font-bold">{originalWidth} × {originalHeight} px</span> • {formatBytes(file.size)}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Change Image
              </button>
            </div>

            {/* Presets Bar */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Quick Platform Presets:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset(1080, 1080)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium border border-slate-200 cursor-pointer"
                >
                  Instagram Square (1080×1080)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(1080, 1920)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium border border-slate-200 cursor-pointer"
                >
                  Story / Reel (1080×1920)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(1280, 720)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium border border-slate-200 cursor-pointer"
                >
                  YouTube Thumbnail (1280×720)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(1920, 1080)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium border border-slate-200 cursor-pointer"
                >
                  Full HD (1920×1080)
                </button>
              </div>

              {/* Percentage Scaling Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 font-medium">Scale by:</span>
                {[25, 50, 75, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyPercentScale(pct)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-semibold cursor-pointer"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Dimension Inputs */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="target-width-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Width (Pixels)
                </label>
                <input
                  id="target-width-input"
                  type="number"
                  min="1"
                  max="10000"
                  value={width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="target-height-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Height (Pixels)
                </label>
                <input
                  id="target-height-input"
                  type="number"
                  min="1"
                  max="10000"
                  value={height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                    lockAspectRatio
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-300 bg-slate-50 text-slate-600'
                  }`}
                >
                  {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{lockAspectRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}</span>
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleResize}
                disabled={isProcessing || width <= 0 || height <= 0}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resizing Image...</span>
                  </>
                ) : (
                  <>
                    <Maximize className="w-4 h-4" />
                    <span>Apply Resize ({width} × {height} px)</span>
                  </>
                )}
              </button>
            </div>

            {/* Result Area */}
            {result && (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Resized Image Ready!
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      New dimensions: {result.width} × {result.height} px • {formatBytes(result.sizeBytes)}
                    </p>
                  </div>
                </div>
                <a
                  href={result.dataUrl}
                  download={`${file.name.replace(/\.[^/.]+$/, '')}_${result.width}x${result.height}.${getExtension()}`}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resized Image</span>
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
