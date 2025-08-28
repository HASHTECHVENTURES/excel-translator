import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = ['.xlsx', '.xls'],
  maxSize = 20
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `Please select a valid Excel file (${acceptedTypes.join(', ')})`;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileSelect(file);
  }, [onFileSelect, acceptedTypes, maxSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200",
          isDragOver
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 hover:border-gray-400",
          error && "border-red-300 bg-red-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload Excel file"
          title="Upload Excel file"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className={cn(
              "p-3 rounded-full",
              isDragOver ? "bg-primary-100" : "bg-gray-100"
            )}>
              <FileSpreadsheet className={cn(
                "w-8 h-8",
                isDragOver ? "text-primary-600" : "text-gray-600"
              )} />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Excel File
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your Excel file here, or click to browse
            </p>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>Supported formats: {acceptedTypes.join(', ')}</p>
              <p>Maximum size: {maxSize}MB</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <X className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};
