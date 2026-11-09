import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, UserCheck, CheckCircle2, AlertCircle, ZoomIn, RotateCw, Grid, Printer } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { FileDropzone } from '../../components/FileDropzone';
import {
  PASSPORT_PRESETS,
  PassportPreset,
  renderPassportPhoto,
  generatePrintablePassportSheet,
  formatBytes,
  ImageProcessingResult,
} from '../../utils/imageUtils';
import { TOOLS } from '../../data/tools';

export const PassportPhotoPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'passport-photo')!;
  const [file, setFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(PASSPORT_PRESETS[0]);

  // Transform controls
  const [zoom, setZoom] = useState<number>(1.1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [showGuidelines, setShowGuidelines] = useState<boolean>(true);
  const [backgroundColor, setBackgroundColor] = useState<string>('original');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ImageProcessingResult | null>(null);
  const [sheetBlobUrl, setSheetBlobUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setSheetBlobUrl(null);
      setErrorMessage(null);
      setZoom(1.1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
    }
  };

  const generatePhoto = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await renderPassportPhoto(
        file,
        selectedPreset,
        { x: panX, y: panY, zoom, rotation },
        backgroundColor
      );
      setResult(res);

      // Also pre-generate 4x6 print sheet
      const sheetBlob = await generatePrintablePassportSheet(res.dataUrl, selectedPreset);
      const sUrl = URL.createObjectURL(sheetBlob);
      setSheetBlobUrl(sUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to render passport photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (file) {
      const timer = setTimeout(() => {
        generatePhoto();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [file, selectedPreset, zoom, panX, panY, rotation, backgroundColor]);

  const handleReset = () => {
    if (sheetBlobUrl) URL.revokeObjectURL(sheetBlobUrl);
    setFile(null);
    setResult(null);
    setSheetBlobUrl(null);
    setErrorMessage(null);
  };

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Upload a clear, front-facing portrait photo.',
        'Select the target standard (US 2x2 in, UK/Schengen 35x45mm, India, etc.).',
        'Use the zoom, pan, and rotation sliders to align eyes and chin to the biometric guidelines.',
        'Choose your desired background color (white, light-blue, gray, or original).',
        'Download your individual passport photo or a printable 4x6 inch multi-photo sheet.',
      ]}
      limitations={[
        'Biometric requirements typically require neutral facial expressions, eyes open, and no hats or non-religious head coverings.',
        'Background color options apply a solid canvas backdrop. If your original photo has a busy textured background, we recommend taking your photo in front of a plain wall.',
      ]}
    >
      <div className="space-y-6">
        {!file ? (
          <FileDropzone
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            maxSizeMb={30}
            multiple={false}
            onFilesSelected={handleFilesSelected}
            title="Select or drop your portrait photo"
            subtitle="JPG, PNG, or WebP • Interactive biometric crop & print sheet"
          />
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{file.name}</p>
                <p className="text-xs text-slate-500">
                  Target: <span className="font-bold text-blue-600">{selectedPreset.name}</span>
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Change Photo
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Official Country & Size Standards:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {PASSPORT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPreset.id === preset.id
                        ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-900">{preset.name}</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      {preset.widthMm} × {preset.heightMm} mm ({preset.pixelWidth}×{preset.pixelHeight} px)
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Workspace: Preview + Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left: Interactive Canvas Preview */}
              <div className="md:col-span-5 bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[360px]">
                {result ? (
                  <div
                    className="relative border-2 border-white/40 shadow-2xl overflow-hidden rounded-md bg-white"
                    style={{
                      width: selectedPreset.pixelWidth === selectedPreset.pixelHeight ? '240px' : '200px',
                      height: selectedPreset.pixelWidth === selectedPreset.pixelHeight ? '240px' : '260px',
                    }}
                  >
                    <img
                      src={result.dataUrl}
                      alt="Passport preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Biometric Overlay Guide */}
                    {showGuidelines && (
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        {/* Oval for face */}
                        <div className="w-[68%] h-[74%] border border-dashed border-yellow-300/80 rounded-full mt-2" />
                        {/* Eye line */}
                        <div className="absolute top-[42%] w-full border-t border-sky-400/80" />
                        {/* Chin guideline */}
                        <div className="absolute top-[78%] w-16 border-t-2 border-yellow-400/90" />
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono text-yellow-300 bg-black/60 px-1 rounded">
                          Eye & Chin Guide
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-white/60 text-xs flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Rendering preview...</span>
                  </div>
                )}

                <div className="mt-4 flex items-center space-x-3 text-xs text-white/80">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGuidelines}
                      onChange={(e) => setShowGuidelines(e.target.checked)}
                      className="accent-blue-500 rounded cursor-pointer"
                    />
                    <span>Biometric Face Guidelines</span>
                  </label>
                </div>
              </div>

              {/* Right: Fine-Tuning Controls */}
              <div className="md:col-span-7 bg-white p-5 border border-slate-200 rounded-2xl space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <ZoomIn className="w-4 h-4 text-blue-600" />
                  <span>Face Alignment & Framing Controls</span>
                </h3>

                {/* Zoom Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="passport-zoom-slider">Zoom Factor</label>
                    <span className="font-mono">{zoom.toFixed(2)}x</span>
                  </div>
                  <input
                    id="passport-zoom-slider"
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Pan X Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="passport-pan-x-slider">Horizontal Position (Left / Right)</label>
                    <span className="font-mono">{panX}px</span>
                  </div>
                  <input
                    id="passport-pan-x-slider"
                    type="range"
                    min="-250"
                    max="250"
                    step="2"
                    value={panX}
                    onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Pan Y Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="passport-pan-y-slider">Vertical Position (Up / Down)</label>
                    <span className="font-mono">{panY}px</span>
                  </div>
                  <input
                    id="passport-pan-y-slider"
                    type="range"
                    min="-250"
                    max="250"
                    step="2"
                    value={panY}
                    onChange={(e) => setPanY(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Rotation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="passport-rotation-slider">Rotate / Level Head</label>
                    <span className="font-mono">{rotation}°</span>
                  </div>
                  <input
                    id="passport-rotation-slider"
                    type="range"
                    min="-20"
                    max="20"
                    step="0.5"
                    value={rotation}
                    onChange={(e) => setRotation(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Background Option */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="text-xs font-semibold text-slate-800 block">
                    Background Color Option:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setBackgroundColor('original')}
                      className={`p-2 rounded-lg border font-medium cursor-pointer ${
                        backgroundColor === 'original'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      type="button"
                      onClick={() => setBackgroundColor('#FFFFFF')}
                      className={`p-2 rounded-lg border font-medium flex items-center justify-center space-x-1 cursor-pointer ${
                        backgroundColor === '#FFFFFF'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-white border border-slate-300" />
                      <span>White</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBackgroundColor('#E0F2FE')}
                      className={`p-2 rounded-lg border font-medium flex items-center justify-center space-x-1 cursor-pointer ${
                        backgroundColor === '#E0F2FE'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-sky-200 border border-sky-400" />
                      <span>Light Blue</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBackgroundColor('#E5E7EB')}
                      className={`p-2 rounded-lg border font-medium flex items-center justify-center space-x-1 cursor-pointer ${
                        backgroundColor === '#E5E7EB'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-400" />
                      <span>Light Gray</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Buttons Bar */}
            {result && (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Passport Photo Ready at 300 DPI</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {selectedPreset.name} • {selectedPreset.pixelWidth} × {selectedPreset.pixelHeight} px
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <a
                    href={result.dataUrl}
                    download={`passport_photo_${selectedPreset.id}.jpg`}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Single Photo</span>
                  </a>

                  {sheetBlobUrl && (
                    <a
                      href={sheetBlobUrl}
                      download={`passport_print_sheet_4x6_${selectedPreset.id}.jpg`}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                      title="Download 4x6 inch printable photo sheet"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Printable 4x6" Sheet (Multi-Photo)</span>
                    </a>
                  )}
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
