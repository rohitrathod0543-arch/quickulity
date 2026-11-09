import React, { useState } from 'react';
import { Download, RefreshCw, FileText, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { FileDropzone } from '../../components/FileDropzone';
import { pdfToDocx } from '../../utils/pdfUtils';
import { formatBytes } from '../../utils/imageUtils';
import { TOOLS } from '../../data/tools';

export const PdfToWordPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'pdf-to-word')!;
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [convertedDocx, setConvertedDocx] = useState<{
    blob: Blob;
    url: string;
    textFound: boolean;
    extractedCharacters: number;
    fileName: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setConvertedDocx(null);
      setErrorMessage(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await pdfToDocx(file, (msg) => setStatusMessage(msg));
      const url = URL.createObjectURL(result.docxBlob);
      const outName = file.name.replace(/\.[^/.]+$/, '') + '.docx';

      setConvertedDocx({
        blob: result.docxBlob,
        url,
        textFound: result.textFound,
        extractedCharacters: result.extractedCharacters,
        fileName: outName,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to convert PDF to DOCX.');
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleReset = () => {
    if (convertedDocx?.url) URL.revokeObjectURL(convertedDocx.url);
    setFile(null);
    setConvertedDocx(null);
    setErrorMessage(null);
  };

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Upload your PDF document using the file dropzone.',
        'Click "Convert to Word (DOCX)" to extract text and structure.',
        'Review the conversion summary and download your clean .docx file.',
      ]}
      limitations={[
        'Scanned PDFs (photos or flat scans without selectable text) require optical character recognition (OCR). If your document has no selectable text, an informative notice will be included in the converted Word document.',
        'Form fields and custom proprietary vector graphic decorations are converted into editable standard paragraphs and headers.',
      ]}
    >
      <div className="space-y-6">
        {!convertedDocx ? (
          <>
            {!file ? (
              <FileDropzone
                accept=".pdf"
                maxSizeMb={35}
                multiple={false}
                onFilesSelected={handleFilesSelected}
                title="Select or drop your PDF document"
                subtitle="Accepts standard PDF files up to 35 MB"
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
                    <strong>High-Fidelity Engine:</strong> Generates a real Microsoft Word (.docx) document with standard Word paragraphs, headers, and runs. Processing takes place in your local memory.
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
                        <span>{statusMessage || 'Converting to Word...'}</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Convert to Word (DOCX)</span>
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
                    Word (.docx) Document Ready!
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Extracted {convertedDocx.extractedCharacters.toLocaleString()} characters into editable Word format.
                  </p>
                </div>
              </div>
              <a
                href={convertedDocx.url}
                download={convertedDocx.fileName}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Word File</span>
              </a>
            </div>

            {!convertedDocx.textFound && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Scanned Document Detected</p>
                  <p className="mt-0.5">
                    No selectable digital text streams were detected in this PDF. The converted Word file contains our guidance notes on optical character recognition (OCR) and document preservation.
                  </p>
                </div>
              </div>
            )}

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
