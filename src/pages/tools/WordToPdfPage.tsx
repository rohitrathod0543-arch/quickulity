import React, { useState } from 'react';
import { Download, RefreshCw, FileCheck, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { FileDropzone } from '../../components/FileDropzone';
import { wordDocxToPdf } from '../../utils/pdfUtils';
import { formatBytes } from '../../utils/imageUtils';
import { TOOLS } from '../../data/tools';

export const WordToPdfPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'word-to-pdf')!;
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedPdf, setConvertedPdf] = useState<{
    url: string;
    size: number;
    fileName: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setConvertedPdf(null);
      setErrorMessage(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const pdfBytes = await wordDocxToPdf(file);
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';

      setConvertedPdf({
        url,
        size: blob.size,
        fileName: outName,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to convert Word document to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (convertedPdf?.url) URL.revokeObjectURL(convertedPdf.url);
    setFile(null);
    setConvertedPdf(null);
    setErrorMessage(null);
  };

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Upload your Microsoft Word (.docx) document.',
        'Click "Convert to PDF" to generate a standardized A4 document.',
        'Download your print-ready PDF with preserved headings and pagination.',
      ]}
      limitations={[
        'Supports standard .docx documents. Old binary .doc format (Word 97-2003) is not supported; please save as .docx in Word before uploading.',
        'Preserves paragraphs, headers, and lists with standard typography (Helvetica). Embedded Word macros and active SmartArt diagrams are flattened.',
      ]}
    >
      <div className="space-y-6">
        {!convertedPdf ? (
          <>
            {!file ? (
              <FileDropzone
                accept=".docx"
                maxSizeMb={30}
                multiple={false}
                onFilesSelected={handleFilesSelected}
                title="Select or drop your Word (.docx) document"
                subtitle="Accepts Microsoft Word (.docx) files up to 30 MB"
              />
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      DOCX
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 px-3 py-1.5 rounded-lg"
                  >
                    Change File
                  </button>
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-900 flex items-start space-x-2.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Standardized Typography:</strong> Converts DOCX markup into A4 paginated PDF sheets with professional line wraps and running page numbers.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rendering PDF Document...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        <span>Convert Word to PDF</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Converted Result */
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    PDF Document Generated!
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {convertedDocxFileName(convertedPdf.fileName)} • {formatBytes(convertedPdf.size)}
                  </p>
                </div>
              </div>
              <a
                href={convertedPdf.url}
                download={convertedPdf.fileName}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF File</span>
              </a>
            </div>

            {/* Embedded PDF Viewer preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs h-[480px]">
              <iframe
                src={convertedPdf.url}
                className="w-full h-full"
                title="Converted PDF Preview"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Convert Another Document
              </button>
            </div>
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

function convertedDocxFileName(name: string) {
  return name;
}
