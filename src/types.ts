export type Cell = {
  v: string | number | Date | null;
  t: 's' | 'n' | 'd' | 'f' | 'h' | 'b'; // string, number, date, formula, hyperlink, boolean
  note?: string;
  style?: any;
  translated?: string;
  skip?: boolean;
};

export type Sheet = {
  name: string;
  include: boolean;
  columns: string[];
  protectedColumns: string[];
  rows: Array<Array<Cell>>;
  translatedRows?: Array<Array<Cell>>;
};

export type GlossaryTerm = {
  term: string;
  keepAs?: string;
};

export type TranslationSettings = {
  target: 'hi-IN' | 'mr-IN';
  tone: 'formal' | 'neutral' | 'conversational';
  quality: 'fast' | 'balanced' | 'high';
};

export type TranslationStats = {
  total: number;
  translated: number;
  skipped: number;
  conflicts: number;
};

export type WorkbookState = {
  fileName: string;
  sheets: Sheet[];
  glossary: GlossaryTerm[];
  settings: TranslationSettings;
  stats: TranslationStats;
  isProcessing: boolean;
  currentSheet?: string;
  currentPromptTemplate?: any;
};

export type LanguageOption = {
  code: 'hi-IN' | 'mr-IN';
  name: string;
  nativeName: string;
};

export type ToneOption = {
  value: 'formal' | 'neutral' | 'conversational';
  label: string;
  description: string;
};




