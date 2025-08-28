import React, { useState } from 'react';
import { Sheet, Cell } from '../types';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { cn } from '../utils/cn';

interface PreviewTableProps {
  sheet: Sheet;
  showOriginal: boolean;
  onToggleView: () => void;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({
  sheet,
  showOriginal,
  onToggleView
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 20;
  
  // Use translatedRows if available, otherwise use original rows
  const displayRows = sheet.translatedRows || sheet.rows;
  const totalPages = Math.ceil(displayRows.length / rowsPerPage);
  
  const startRow = currentPage * rowsPerPage;
  const endRow = Math.min(startRow + rowsPerPage, displayRows.length);
  const currentRows = displayRows.slice(startRow, endRow);
  

  
  const getCellValue = (cell: Cell): string => {
    if (cell.v === null || cell.v === undefined) return '';
    
    if (showOriginal) {
      return cell.v.toString();
    } else {
      return cell.translated || cell.v.toString();
    }
  };
  
  const getCellClass = (cell: Cell, colIndex: number): string => {
    const baseClass = "px-3 py-2 border-b border-gray-200 text-sm";
    
    // Check if column is protected
    const isProtected = sheet.protectedColumns.includes(sheet.columns[colIndex]);
    
    if (isProtected) {
      return cn(baseClass, "bg-gray-50 text-gray-500 italic");
    }
    
    if (cell.translated && !showOriginal) {
      return cn(baseClass, "bg-green-50");
    }
    
    if (cell.skip) {
      return cn(baseClass, "bg-yellow-50 text-gray-500");
    }
    
    return baseClass;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {sheet.name} - {showOriginal ? 'Original' : 'Translated'} View
        </h3>
        
        <button
          onClick={onToggleView}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {showOriginal ? (
            <>
              <Eye className="w-4 h-4" />
              Show Translated
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              Show Original
            </>
          )}
        </button>
      </div>
      
      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {sheet.columns.map((column, index) => (
                  <th
                    key={column}
                    className={cn(
                      "px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200",
                      sheet.protectedColumns.includes(column) && "bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {column}
                      {sheet.protectedColumns.includes(column) && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-1 py-0.5 rounded">
                          Protected
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRows.map((row, rowIndex) => (
                <tr key={startRow + rowIndex} className="hover:bg-gray-50">
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className={getCellClass(cell, colIndex)}
                      title={cell.note || undefined}
                    >
                      <div className="max-w-xs truncate">
                        {getCellValue(cell)}
                      </div>
                    </td>
                  ))}
                  {/* Fill empty cells if row is shorter than columns */}
                  {Array.from({ length: Math.max(0, sheet.columns.length - row.length) }).map((_, colIndex) => (
                    <td key={`empty-${colIndex}`} className="px-3 py-2 border-b border-gray-200 text-sm">
                      <div className="max-w-xs truncate text-gray-400">
                        &nbsp;
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startRow + 1} to {endRow} of {sheet.rows.length} rows
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
