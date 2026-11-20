'use client';

import { useState, useRef } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  loading?: boolean;
  title: string;
  description: string;
  subDescription?: string;
  uploadingText?: string;
  className?: string;
}

export function UploadZone({
  onUpload,
  accept = '.csv,.xlsx,.xls',
  loading = false,
  title,
  description,
  subDescription,
  uploadingText = 'Uploading & Parsing...',
  className = '',
}: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative border-2 border-dashed border-neutral-300 bg-white hover:border-neutral-900 transition-colors duration-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative min-h-[140px] ${className} ${isDragActive ? 'border-neutral-900 bg-neutral-50' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const file = e.dataTransfer.files[0];
        if (file) {
          onUpload(file);
        }
      }}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
          <span className="text-sm font-bold font-clash text-neutral-900">
            Uploading & Parsing...
          </span>
        </div>
      ) : (
        <>
          <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-900">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="mt-3">
            <span className="text-sm font-bold font-clash text-neutral-900 block">
              {title}
            </span>
            <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
              {description}
            </span>
            {subDescription && (
              <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                {subDescription}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default UploadZone;