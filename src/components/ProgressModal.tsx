import React from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  progress: number;
  currentSheet?: string;
  totalSheets: number;
  currentSheetIndex: number;
  error?: string;
  onCancel: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  progress,
  currentSheet,
  totalSheets,
  currentSheetIndex,
  error,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-center space-y-4">
          {error ? (
            <>
              <div className="flex justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Translation Failed</h3>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={onCancel}
                className="btn-primary w-full"
              >
                Close
              </button>
            </>
          ) : progress >= 1 ? (
            <>
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Translation Complete!</h3>
              <p className="text-gray-600">Your Excel file has been successfully translated.</p>
              <button
                onClick={onCancel}
                className="btn-primary w-full"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Translating...</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sheet {currentSheetIndex + 1} of {totalSheets}</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                
                {currentSheet && (
                  <p className="text-sm text-gray-500">
                    Currently translating: {currentSheet}
                  </p>
                )}
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
              
              <button
                onClick={onCancel}
                className="btn-secondary w-full"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


