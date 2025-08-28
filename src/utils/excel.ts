import * as XLSX from 'xlsx';
import { Cell, Sheet, GlossaryTerm } from '../types';

export const parseExcelFile = (file: File): Promise<{ sheets: Sheet[]; fileName: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheets: Sheet[] = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
          
          // Convert to our Cell format
          const rows: Array<Array<Cell>> = jsonData.map((row: any[]) => 
            row.map((cell: any) => {
              if (cell === null || cell === undefined) {
                return { v: null, t: 's' };
              }
              
              const cellType = typeof cell;
              let type: Cell['t'] = 's';
              
              if (cellType === 'number') {
                type = 'n';
              } else if (cell instanceof Date) {
                type = 'd';
              } else if (typeof cell === 'string') {
                // Check for formulas, emails, URLs
                if (cell.startsWith('=')) {
                  type = 'f';
                } else if (isEmail(cell)) {
                  type = 'h';
                } else if (isUrl(cell)) {
                  type = 'h';
                }
              }
              
              return { v: cell, t: type };
            })
          );
          
          // Generate column headers
          const maxCols = Math.max(...rows.map(row => row.length));
          const columns = Array.from({ length: maxCols }, (_, i) => 
            XLSX.utils.encode_col(i)
          );
          
          return {
            name: sheetName,
            include: true,
            columns,
            protectedColumns: [],
            rows
          };
        });
        
        resolve({ sheets, fileName: file.name });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (sheets: Sheet[], fileName: string): void => {
  const workbook = XLSX.utils.book_new();
  
  sheets.forEach(sheet => {
    if (sheet.translatedRows) {
      // Convert translated rows back to worksheet format
      const worksheetData = sheet.translatedRows.map(row =>
        row.map(cell => cell.translated || cell.v)
      );
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    }
  });
  
  // Generate filename
  const baseName = fileName.replace(/\.(xlsx|xls)$/i, '');
  const newFileName = `${baseName}_translated.xlsx`;
  
  XLSX.writeFile(workbook, newFileName);
};

export const shouldSkipCell = (cell: Cell, glossary: GlossaryTerm[]): boolean => {
  if (!cell.v) return true;
  
  const value = cell.v.toString().trim();
  
  // Skip empty cells
  if (!value) return true;
  
  // Skip formulas
  if (cell.t === 'f') return true;
  
  // Skip dates
  if (cell.t === 'd') return true;
  
  // Skip emails
  if (isEmail(value)) return true;
  
  // Skip URLs
  if (isUrl(value)) return true;
  
  // Skip if it's in glossary (should be preserved as-is)
  if (glossary.some(term => 
    value.toLowerCase().includes(term.term.toLowerCase())
  )) return true;
  
  // Skip if it's just codes, IDs (but allow numbers and mixed content)
  if (/^[A-Z\-_]+$/.test(value) && value.length <= 10) return true;
  
  // DO NOT skip numbers - they should be translated to Hindi numerals
  // Numbers like 3, 9, 18, 4 should be converted to ३, ९, १८, ४
  
  return false;
};

export const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const isUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const parseGlossary = (text: string): GlossaryTerm[] => {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const [term, keepAs] = line.split(',').map(s => s.trim());
      return { term, keepAs: keepAs || term };
    });
};
