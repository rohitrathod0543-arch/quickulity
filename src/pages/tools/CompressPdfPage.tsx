import React, { useState } from 'react';
import { Download, RefreshCw, Minimize2, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { FileDropzone } from '../../components/FileDropzone';
import { compressPdf, getPdfInfo } from '../../utils/pdfUtils';
import { formatBytes } from '../../utils/imageUtils';
import { TOOLS } from '../../data/tools';

export const CompressPdfPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'compress-pdf')!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [compressResult, setCompressResult] = useState<{
    url: string;
    originalSize: number;
    compressedSize: number;
    savedPercent: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setCompressResult(null);
      setErrorMessage(null);
      try {
        const info = await getPdfInfo(selected);
        setPageCount(info.pageCount);
      } catch (err: any) {
        setErrorMessage(err.message || 'Could not inspect PDF.');
      }
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await compressPdf(file);
      const blob = new Blob([result.pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setCompressResult({
        url,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        savedPercent: result.savedPercent,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to compress PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (compressResult?.url) URL.revokeObjectURL(compressResult.url);
    setFile(null);
    setPageCount(null);
    setCompressResult(null);
    setErrorMessage(null);
  };

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Upload your PDF file.',
        'Click "Compress PDF Document" to rewrite object streams and strip redundant metadata.',
        'Review the before and after file size comparison.',
        'Download your optimized PDF file.',
      ]}
      limitations={[
        'PDF documents that already contain highly compressed JBIG2 or JPEG2000 images may see modest reductions, as their internal media is already packed.',
        'Text content and vector line art remain 100% vector-crisp and uncompromised.',
      ]}
    >
      <div className="space-y-6">
        {!file ? (
          <FileDropzone
            accept=".pdf"
            maxSizeMb={50}
            multiple={false}
            onFilesSelected={handleFilesSelected}
            title="Select or drop your PDF to compress"
            subtitle="Optimizes internal PDF streams and removes redundant object trees"
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
                    Original Size: <span className="font-bold">{formatBytes(file.size)}</span>{' '}
                    {pageCount ? `• ${pageCount} pages` : ''}
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

            {!compressResult ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Optimizing PDF Streams...</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      <span>Compress PDF Document</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Compression Result Metrics Card */
              <div className="space-y-6 animate-in fade-in">
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold text-lg">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Compression Complete!</span>
                    </div>

                    <div className="flex items-center space-x-6 text-xs sm:text-sm">
                      <div>
                        <span className="text-slate-500 block">Original</span>
                        <span className="font-bold text-slate-800 line-through">
                          {formatBytes(compressResult.originalSize)}
                        </span>
                      </div>
                      <div className="text-slate-400 font-bold">→</div>
                      <div>
                        <span className="text-slate-500 block">Compressed</span>
                        <span className="font-bold text-emerald-700">
                          {formatBytes(compressResult.compressedSize)}
                        </span>
                      </div>
                      {compressResult.savedPercent > 0 && (
                        <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-extrabold text-xs">
                          Saved {compressResult.savedPercent}%
                        </div>
                      )}
                    </div>
                  </div>

                  <a
                    href={compressResult.url}
                    download={`${file.name.replace(/\.[^/.]+$/, '')}_compressed.pdf`}
                    className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Compressed PDF</span>
                  </a>
                </div>

                {compressResult.savedPercent <= 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p>
                      <strong>Already Highly Optimized:</strong> This PDF was already tightly packed with minimal redundant metadata. We preserved 100% of the stream integrity without altering your file.
                    </p>
                  </div>
                )}
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
