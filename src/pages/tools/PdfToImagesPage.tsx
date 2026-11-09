import React, { useState } from 'react';
import { Download, RefreshCw, Image as ImageIcon, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { FileDropzone } from '../../components/FileDropzone';
import { renderPdfPagesToImages, getPdfInfo } from '../../utils/pdfUtils';
import { formatBytes } from '../../utils/imageUtils';
import { TOOLS } from '../../data/tools';

export const PdfToImagesPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'pdf-to-images')!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [scale, setScale] = useState<number>(2.0); // 2x for sharp 150-200 DPI

  const [isProcessing, setIsProcessing] = useState(false);
  const [renderedPages, setRenderedPages] = useState<
    Array<{ pageNumber: number; dataUrl: string; blob: Blob; width: number; height: number }>
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setRenderedPages([]);
      setErrorMessage(null);
      try {
        const info = await getPdfInfo(selected);
        setPageCount(info.pageCount);
      } catch (err: any) {
        setErrorMessage(err.message || 'Could not read PDF metadata.');
      }
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const pages = await renderPdfPagesToImages(file, format, scale);
      setRenderedPages(pages);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to render PDF pages to images.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAllPages = () => {
    renderedPages.forEach((p, idx) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = p.dataUrl;
        a.download = `${file?.name.replace(/\.[^/.]+$/, '')}_page_${p.pageNumber}.${format === 'jpeg' ? 'jpg' : 'png'}`;
        a.click();
      }, idx * 250);
    });
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(null);
    setRenderedPages([]);
    setErrorMessage(null);
  };

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Upload your PDF file.',
        'Choose output format (crisp PNG or smaller JPG) and rendering sharpness.',
        'Click "Convert All Pages to Images".',
        'Preview pages in the visual gallery and download individually or all at once.',
      ]}
    >
      <div className="space-y-6">
        {!file ? (
          <FileDropzone
            accept=".pdf"
            maxSizeMb={35}
            multiple={false}
            onFilesSelected={handleFilesSelected}
            title="Select or drop your PDF document"
            subtitle="Renders every page into standalone high-res images"
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
                    {formatBytes(file.size)} {pageCount ? `• ${pageCount} Pages` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 px-3 py-1.5 rounded-lg"
              >
                Change PDF
              </button>
            </div>

            {/* Options */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Image Format</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setFormat('png')}
                    className={`flex-1 py-2 px-3 rounded-lg border font-semibold ${
                      format === 'png'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    PNG (Lossless & Crisp)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('jpeg')}
                    className={`flex-1 py-2 px-3 rounded-lg border font-semibold ${
                      format === 'jpeg'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    JPG (Smaller File Size)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Render Resolution</label>
                <select
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="1.0">Standard 72 DPI (Fastest)</option>
                  <option value="1.5">Medium 110 DPI</option>
                  <option value="2.0">High Definition 150 DPI (Recommended)</option>
                  <option value="3.0">Ultra 220 DPI (Print Quality)</option>
                </select>
              </div>
            </div>

            {renderedPages.length === 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Rendering Pages to Images...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>Extract & Convert All Pages</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Rendered Gallery */
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center space-x-2 text-emerald-800 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Successfully converted all {renderedPages.length} pages to {format.toUpperCase()}!</span>
                  </div>
                  <button
                    onClick={downloadAllPages}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All Pages</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {renderedPages.map((page) => (
                    <div
                      key={page.pageNumber}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      <div className="relative bg-slate-100 aspect-[3/4] flex items-center justify-center overflow-hidden border-b border-slate-100">
                        <img
                          src={page.dataUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="max-h-full max-w-full object-contain"
                        />
                        <span className="absolute top-2 left-2 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Page {page.pageNumber}
                        </span>
                      </div>
                      <div className="p-3 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          {page.width} × {page.height} px
                        </span>
                        <a
                          href={page.dataUrl}
                          download={`${file.name.replace(/\.[^/.]+$/, '')}_page_${page.pageNumber}.${format === 'jpeg' ? 'jpg' : 'png'}`}
                          className="text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ))}
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
