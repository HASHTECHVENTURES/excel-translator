import React from 'react';
import { Sheet } from '../types';
import { CheckSquare, Square } from 'lucide-react';

interface SheetSelectorProps {
  sheets: Sheet[];
  onSheetToggle: (sheetName: string, include: boolean) => void;
  onProtectedColumnsChange: (sheetName: string, columns: string[]) => void;
}

export const SheetSelector: React.FC<SheetSelectorProps> = ({
  sheets,
  onSheetToggle,
  onProtectedColumnsChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Sheets to Translate</h3>
      
      <div className="space-y-3">
        {sheets.map((sheet) => (
          <div key={sheet.name} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSheetToggle(sheet.name, !sheet.include)}
                  className="flex items-center gap-2 text-left hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  {sheet.include ? (
                    <CheckSquare className="w-5 h-5 text-primary-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="font-medium text-gray-900">{sheet.name}</span>
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                {sheet.rows.length} rows × {sheet.columns.length} columns
              </div>
            </div>
            
            {sheet.include && (
              <div className="ml-7 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Protected Columns (Skip Translation)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sheet.columns.map((column) => (
                      <label key={column} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sheet.protectedColumns.includes(column)}
                          onChange={(e) => {
                            const newProtected = e.target.checked
                              ? [...sheet.protectedColumns, column]
                              : sheet.protectedColumns.filter(col => col !== column);
                            onProtectedColumnsChange(sheet.name, newProtected);
                          }}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{column}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Check columns that should not be translated (e.g., IDs, codes, formulas)
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {sheets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No sheets found in the uploaded file.
        </div>
      )}
    </div>
  );
};


