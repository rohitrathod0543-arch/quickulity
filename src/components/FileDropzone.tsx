import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, File as FileIcon, X } from 'lucide-react';
import { formatBytes } from '../utils/imageUtils';

interface FileDropzoneProps {
  accept: string; // e.g. ".pdf", ".docx", "image/*"
  maxSizeMb?: number;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  maxSizeMb = 50,
  multiple = false,
  onFilesSelected,
  title = 'Click to upload or drag and drop',
  subtitle,
  selectedFiles = [],
  onRemoveFile,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const validateAndPassFiles = (fileList: FileList | null) => {
    setErrorMessage(null);
    if (!fileList || fileList.length === 0) return;

    const acceptedList: File[] = [];
    const validExtensions = accept
      .split(',')
      .map((ext) => ext.trim().toLowerCase());

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileNameLower = file.name.toLowerCase();
      const fileExt = '.' + fileNameLower.split('.').pop();

      // Check extension / MIME
      const isExtAllowed = validExtensions.some((ext) => {
        if (ext === '*/*') return true;
        if (ext.startsWith('.')) return fileNameLower.endsWith(ext);
        if (ext.endsWith('/*')) {
          const typePrefix = ext.replace('/*', '');
          return file.type.startsWith(typePrefix);
        }
        return file.type === ext;
      });

      if (!isExtAllowed) {
        setErrorMessage(`Unsupported file format "${file.name}". Accepted formats: ${accept}`);
        return;
      }

      if (file.size > maxSizeBytes) {
        setErrorMessage(`File "${file.name}" exceeds the maximum size limit of ${maxSizeMb} MB.`);
        return;
      }

      acceptedList.push(file);
      if (!multiple) break;
    }

    if (acceptedList.length > 0) {
      onFilesSelected(acceptedList);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndPassFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndPassFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 group ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/60 ring-4 ring-blue-500/10 scale-[1.005]'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/80 shadow-sm'
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload file area"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              isDragOver
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:scale-105'
            }`}
          >
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <p className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              {title}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {subtitle || `Supported: ${accept} • Max file size: ${maxSizeMb} MB`}
            </p>
          </div>

          <div className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            Select {multiple ? 'Files' : 'File'}
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-center space-x-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected File Chips List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Selected {selectedFiles.length === 1 ? 'Document' : `${selectedFiles.length} Documents`}:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 shadow-sm"
              >
                <div className="flex items-center space-x-2 min-w-0 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-400">{formatBytes(file.size)}</p>
                  </div>
                </div>
                {onRemoveFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(idx);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
