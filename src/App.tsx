import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { TranslationSettings } from './components/TranslationSettings';
import { SheetSelector } from './components/SheetSelector';
import { PreviewTable } from './components/PreviewTable';
import { ProgressModal } from './components/ProgressModal';
import { 
  WorkbookState, 
  TranslationSettings as Settings, 
  Sheet, 
  GlossaryTerm,
  TranslationStats 
} from './types';
import { parseExcelFile, exportToExcel, shouldSkipCell } from './utils/excel';
import { translateCells } from './utils/translation';
import { Download, RotateCcw, FileSpreadsheet } from 'lucide-react';

const initialState: WorkbookState = {
  fileName: '',
  sheets: [],
  glossary: [],
  settings: {
    target: 'hi-IN',
    tone: 'neutral',
    domain: 'admin',
    quality: 'balanced'
  },
  stats: {
    total: 0,
    translated: 0,
    skipped: 0,
    conflicts: 0
  },
  isProcessing: false
};

function App() {
  const [state, setState] = useState<WorkbookState>(initialState);
  const [currentStep, setCurrentStep] = useState<'upload' | 'settings' | 'preview'>('upload');
  const [showOriginal, setShowOriginal] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }));
      const { sheets, fileName } = await parseExcelFile(file);
      
      // Calculate initial stats
      const stats = calculateStats(sheets, state.glossary);
      
      setState(prev => ({
        ...prev,
        fileName,
        sheets,
        stats,
        isProcessing: false
      }));
      
      setCurrentStep('settings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse Excel file');
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [state.glossary]);

  const handleSettingsChange = useCallback((settings: Settings) => {
    setState(prev => ({ ...prev, settings }));
  }, []);

  const handleGlossaryChange = useCallback((glossary: GlossaryTerm[]) => {
    setState(prev => ({ 
      ...prev, 
      glossary,
      stats: calculateStats(prev.sheets, glossary)
    }));
  }, []);

  const handleSheetToggle = useCallback((sheetName: string, include: boolean) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.name === sheetName ? { ...sheet, include } : sheet
      )
    }));
  }, []);

  const handleProtectedColumnsChange = useCallback((sheetName: string, columns: string[]) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.name === sheetName ? { ...sheet, protectedColumns: columns } : sheet
      )
    }));
  }, []);

  const calculateStats = (sheets: Sheet[], glossary: GlossaryTerm[]): TranslationStats => {
    let total = 0;
    let skipped = 0;

    sheets.forEach(sheet => {
      if (sheet.include) {
        sheet.rows.forEach(row => {
          row.forEach(cell => {
            if (cell.v && (typeof cell.v === 'string' || typeof cell.v === 'number')) {
              total++;
              if (shouldSkipCell(cell, glossary)) {
                skipped++;
              }
            }
          });
        });
      }
    });

    return {
      total,
      translated: 0,
      skipped,
      conflicts: 0
    };
  };

  const handleTranslate = useCallback(async () => {
    const sheetsToTranslate = state.sheets.filter(sheet => sheet.include);
    
    if (sheetsToTranslate.length === 0) {
      setError('Please select at least one sheet to translate');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true }));
    setProgress(0);
    setCurrentSheetIndex(0);
    setError(null);

    try {
      const updatedSheets = [...state.sheets];

      for (let i = 0; i < sheetsToTranslate.length; i++) {
        const sheet = sheetsToTranslate[i];
        const sheetIndex = updatedSheets.findIndex(s => s.name === sheet.name);
        
        setCurrentSheetIndex(i);
        setProgress(i / sheetsToTranslate.length);

        // Process each row in the sheet
        const updatedRows = [];
        for (let rowIndex = 0; rowIndex < sheet.rows.length; rowIndex++) {
          const row = sheet.rows[rowIndex];
          const updatedRow = [];

          for (let colIndex = 0; colIndex < row.length; colIndex++) {
            const cell = row[colIndex];
            const columnName = sheet.columns[colIndex];

            // Check if column is protected
            if (sheet.protectedColumns.includes(columnName)) {
              updatedRow.push({ ...cell, skip: true });
              continue;
            }

            // Check if cell should be skipped
            if (shouldSkipCell(cell, state.glossary)) {
              updatedRow.push({ ...cell, skip: true });
              continue;
            }

            updatedRow.push(cell);
          }

          updatedRows.push(updatedRow);
        }

        // Collect cells that need translation with their positions
        const cellsToTranslate: Array<{ cell: Cell; rowIndex: number; colIndex: number }> = [];
        
        for (let rowIndex = 0; rowIndex < updatedRows.length; rowIndex++) {
          const row = updatedRows[rowIndex];
          for (let colIndex = 0; colIndex < row.length; colIndex++) {
            const cell = row[colIndex];
            if (cell.v && (typeof cell.v === 'string' || typeof cell.v === 'number') && !cell.skip) {
              cellsToTranslate.push({ cell, rowIndex, colIndex });
            }
          }
        }

        if (cellsToTranslate.length > 0) {
          console.log(`🔄 Translating ${cellsToTranslate.length} cells for sheet "${sheet.name}"`);
          const cellsForTranslation = cellsToTranslate.map(item => item.cell);
          
          // Log what we're sending for translation
          console.log('📤 Sending for translation:', cellsForTranslation.map(cell => cell.v));
          
          const translatedCells = await translateCells(
            cellsForTranslation,
            state.settings,
            state.glossary,
            (progress) => {
              const overallProgress = (i + progress) / sheetsToTranslate.length;
              setProgress(overallProgress);
            }
          );
          
          console.log('✅ Translation results:', translatedCells.map(cell => ({
            original: cell.v,
            translated: cell.translated,
            hasTranslation: !!cell.translated
          })));
          
          // Check for cells without translations
          const cellsWithoutTranslation = translatedCells.filter(cell => !cell.translated);
          if (cellsWithoutTranslation.length > 0) {
            console.log('❌ Cells without translation:', cellsWithoutTranslation.map(cell => cell.v));
          }

          // Create a deep copy of updatedRows
          const finalRows = updatedRows.map(row => [...row]);

          // Place translated cells back in their original positions
          cellsToTranslate.forEach((item) => {
            // Find the translated cell by matching the original cell
            const translatedCell = translatedCells.find(cell => 
              cell.v === item.cell.v && 
              cell.row === item.rowIndex && 
              cell.col === item.colIndex
            );
            
            if (translatedCell && finalRows[item.rowIndex]) {
              finalRows[item.rowIndex][item.colIndex] = translatedCell;
            } else {
              // Try alternative matching - just by value and position
              const alternativeMatch = translatedCells.find(cell => 
                cell.v === item.cell.v
              );
              
              if (alternativeMatch && finalRows[item.rowIndex]) {
                // Create a new cell with the correct position and translation
                const positionedCell = {
                  ...alternativeMatch,
                  row: item.rowIndex,
                  col: item.colIndex,
                  translated: alternativeMatch.translated
                };
                
                finalRows[item.rowIndex][item.colIndex] = positionedCell;
              }
            }
          });

          updatedSheets[sheetIndex] = {
            ...sheet,
            translatedRows: finalRows
          };
          

        } else {
          updatedSheets[sheetIndex] = {
            ...sheet,
            translatedRows: updatedRows
          };
        }
      }

      // Calculate final stats
      const finalStats = calculateStats(updatedSheets, state.glossary);
      finalStats.translated = finalStats.total - finalStats.skipped;

      setState(prev => ({
        ...prev,
        sheets: updatedSheets,
        stats: finalStats,
        isProcessing: false
      }));

      setProgress(1);
      setCurrentStep('preview');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [state.sheets, state.settings, state.glossary]);

  const handleDownload = useCallback(() => {
    const sheetsWithTranslations = state.sheets.filter(sheet => 
      sheet.include && sheet.translatedRows
    );
    
    if (sheetsWithTranslations.length === 0) {
      setError('No translated sheets available for download');
      return;
    }

    try {
      exportToExcel(sheetsWithTranslations, state.fileName);
    } catch (err) {
      setError('Failed to export Excel file');
    }
  }, [state.sheets, state.fileName]);

  const handleReset = useCallback(() => {
    setState(initialState);
    setCurrentStep('upload');
    setShowOriginal(true);
    setProgress(0);
    setCurrentSheetIndex(0);
    setError(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setState(prev => ({ ...prev, isProcessing: false }));
    setError(null);
  }, []);

  const currentSheet = state.sheets.find(sheet => sheet.include && sheet.translatedRows) || 
                      state.sheets.find(sheet => sheet.include);
  


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Excel Translator (Hindi • Marathi)
              </h1>
              <p className="text-gray-600 mt-1">
                Upload → Select Language → Translate → Download
              </p>
            </div>
            
            {state.fileName && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileSpreadsheet className="w-4 h-4" />
                  {state.fileName}
                </div>
                
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Step 1: File Upload */}
          {currentStep === 'upload' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Excel File</h2>
              <FileUpload onFileSelect={handleFileUpload} />
            </div>
          )}

          {/* Step 2: Settings */}
          {currentStep === 'settings' && state.sheets.length > 0 && (
            <>
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Language</h2>
                <TranslationSettings
                  settings={state.settings}
                  glossary={state.glossary}
                  onSettingsChange={handleSettingsChange}
                  onGlossaryChange={handleGlossaryChange}
                />
              </div>

              <div className="card">
                <SheetSelector
                  sheets={state.sheets}
                  onSheetToggle={handleSheetToggle}
                  onProtectedColumnsChange={handleProtectedColumnsChange}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {state.stats.total} cells to process • {state.stats.skipped} will be skipped
                </div>
                
                <button
                  onClick={handleTranslate}
                  disabled={state.isProcessing || state.sheets.filter(s => s.include).length === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isProcessing ? 'Translating...' : 'Translate'}
                </button>
              </div>
            </>
          )}

          {/* Step 3: Preview */}
          {currentStep === 'preview' && currentSheet && (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Translation Preview</h2>
                  
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 btn-primary"
                  >
                    <Download className="w-4 h-4" />
                    Download Excel
                  </button>
                </div>

                <PreviewTable
                  sheet={currentSheet}
                  showOriginal={showOriginal}
                  onToggleView={() => setShowOriginal(!showOriginal)}
                />
              </div>

              {/* Stats */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Translation Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{state.stats.total}</div>
                    <div className="text-sm text-gray-600">Total Cells</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{state.stats.translated}</div>
                    <div className="text-sm text-gray-600">Translated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{state.stats.skipped}</div>
                    <div className="text-sm text-gray-600">Skipped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{state.stats.conflicts}</div>
                    <div className="text-sm text-gray-600">Conflicts</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>All processing is done in your browser. No data is stored on our servers.</p>
            <p className="mt-1">Powered by AI translation technology</p>
          </div>
        </div>
      </footer>

      {/* Progress Modal */}
      <ProgressModal
        isOpen={state.isProcessing}
        progress={progress}
        currentSheet={state.sheets[currentSheetIndex]?.name}
        totalSheets={state.sheets.filter(s => s.include).length}
        currentSheetIndex={currentSheetIndex}
        error={error}
        onCancel={handleCloseModal}
      />
    </div>
  );
}

export default App;
