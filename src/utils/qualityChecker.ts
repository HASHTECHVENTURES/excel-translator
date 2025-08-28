export interface QualityIssue {
  type: 'formal_word' | 'literal_translation' | 'grammar' | 'tone' | 'structure';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
  originalText: string;
  translatedText: string;
}

export interface QualityReport {
  issues: QualityIssue[];
  score: number; // 0-100
  summary: {
    totalIssues: number;
    criticalIssues: number;
    formalWordIssues: number;
    literalTranslationIssues: number;
    grammarIssues: number;
  };
}

// Formal words that should be replaced with colloquial alternatives
const HINDI_FORMAL_WORDS_MAP: Record<string, string[]> = {
  'औपचारिक': ['ज़रूरी', 'सरकारी'],
  'प्रस्ताव': ['योजना'],
  'स्पष्टता': ['साफ़ समझ'],
  'प्रशिक्षण': ['सीखने की पहल'],
  'प्रक्रिया': ['तरीका'],
  'संदर्भ': ['साथ', 'स्थिति के अनुसार'],
  'विश्लेषण': ['जांच', 'समझ'],
  'सुलभ': ['आसान', 'सरल'],
  'स्थापित': ['मज़बूत करना', 'बनाना'],
  'सहभागिता': ['भागीदारी', 'हिस्सा लेना'],
  'कार्यान्वयन': ['लागू करना', 'शुरू करना'],
  'परिणाम': ['नतीजा', 'फल'],
  'उद्देश्य': ['लक्ष्य', 'मकसद'],
  'प्राप्ति': ['हासिल करना', 'पाना'],
  'व्यवस्था': ['इंतज़ाम', 'बंदोबस्त'],
  'प्रबंधन': ['संचालन', 'प्रबंध'],
  'विकास': ['बढ़ावा', 'उन्नति'],
  'सुधार': ['बेहतर बनाना', 'सुधारना'],
  'निरीक्षण': ['जांच', 'देखना'],
  'परीक्षण': ['टेस्ट', 'जांच']
};

const MARATHI_FORMAL_WORDS_MAP: Record<string, string[]> = {
  'औपचारिक': ['आवश्यक', 'सरकारी'],
  'प्रस्ताव': ['योजना'],
  'स्पष्टता': ['स्पष्ट समज'],
  'प्रशिक्षण': ['शिकण्याची सुरुवात'],
  'प्रक्रिया': ['पद्धत'],
  'संदर्भ': ['स्थिती', 'परिस्थितीनुसार'],
  'विश्लेषण': ['तपासणी', 'समज'],
  'सुलभ': ['सोपे', 'सरळ'],
  'स्थापित': ['मजबूत करणे', 'तयार करणे'],
  'सहभागिता': ['सहभाग', 'भाग घेणे']
};

// Common literal translations to avoid
const LITERAL_TRANSLATIONS: Record<string, string> = {
  'समय प्रबंधन': 'टाइम मैनेजमेंट',
  'कौशल विकास': 'स्किल डेवलपमेंट',
  'ज्ञान प्रबंधन': 'नॉलेज मैनेजमेंट',
  'गुणवत्ता आश्वासन': 'क्वालिटी एश्योरेंस',
  'प्रदर्शन मूल्यांकन': 'परफॉरमेंस इवैल्यूएशन'
};

// Grammar patterns to check
const GRAMMAR_PATTERNS = {
  mixedPronouns: /(आप|तुम)/g,
  genderMismatch: /(लड़का|लड़की|छात्र|छात्रा).*(करता|करती)/g,
  postpositionErrors: /(के लिए|को|से|में|पर).*(के लिए|को|से|में|पर)/g
};

export const checkTranslationQuality = (
  originalText: string,
  translatedText: string,
  context: 'marketing' | 'technical' = 'technical',
  language: 'hi-IN' | 'mr-IN' = 'hi-IN'
): QualityReport => {
  const issues: QualityIssue[] = [];
  
  // Check for formal words
  const formalWordIssues = checkFormalWords(translatedText, language);
  issues.push(...formalWordIssues);
  
  // Check for literal translations
  const literalIssues = checkLiteralTranslations(translatedText);
  issues.push(...literalIssues);
  
  // Check grammar consistency
  const grammarIssues = checkGrammar(translatedText);
  issues.push(...grammarIssues);
  
  // Check tone consistency
  const toneIssues = checkTone(translatedText, context);
  issues.push(...toneIssues);
  
  // Check structure alignment
  const structureIssues = checkStructure(originalText, translatedText);
  issues.push(...structureIssues);
  
  // Calculate quality score
  const score = calculateQualityScore(issues, originalText.length);
  
  // Generate summary
  const summary = {
    totalIssues: issues.length,
    criticalIssues: issues.filter(issue => issue.severity === 'high').length,
    formalWordIssues: formalWordIssues.length,
    literalTranslationIssues: literalIssues.length,
    grammarIssues: grammarIssues.length
  };
  
  return {
    issues,
    score,
    summary
  };
};

const checkFormalWords = (text: string, language: 'hi-IN' | 'mr-IN' = 'hi-IN'): QualityIssue[] => {
  const issues: QualityIssue[] = [];
  
  const formalWordsMap = language === 'hi-IN' ? HINDI_FORMAL_WORDS_MAP : MARATHI_FORMAL_WORDS_MAP;
  
  for (const [formalWord, alternatives] of Object.entries(formalWordsMap)) {
    if (text.includes(formalWord)) {
      // Check if this is a column header or standalone term
      const isColumnHeader = /^(Question|Option\d+|Correct ans|Answer|Explanation)$/i.test(text);
      const severity = isColumnHeader ? 'low' : 'medium';
      
      issues.push({
        type: 'formal_word',
        severity,
        message: `Formal word "${formalWord}" detected. Consider using more colloquial alternatives.`,
        suggestion: `Replace "${formalWord}" with: ${alternatives.join(', ')}`,
        originalText: '',
        translatedText: text
      });
    }
  }
  
  return issues;
};

const checkLiteralTranslations = (text: string): QualityIssue[] => {
  const issues: QualityIssue[] = [];
  
  for (const [literal, suggestion] of Object.entries(LITERAL_TRANSLATIONS)) {
    if (text.includes(literal)) {
      issues.push({
        type: 'literal_translation',
        severity: 'high',
        message: `Literal translation "${literal}" detected. This may not sound natural in Hindi.`,
        suggestion: `Consider using a more natural Hindi expression instead of "${literal}"`,
        originalText: '',
        translatedText: text
      });
    }
  }
  
  return issues;
};

const checkGrammar = (text: string): QualityIssue[] => {
  const issues: QualityIssue[] = [];
  
  // Check for mixed pronouns
  const pronounMatches = text.match(GRAMMAR_PATTERNS.mixedPronouns);
  if (pronounMatches && pronounMatches.length > 1) {
    const uniquePronouns = [...new Set(pronounMatches)];
    if (uniquePronouns.length > 1) {
      issues.push({
        type: 'grammar',
        severity: 'medium',
        message: 'Mixed pronoun usage detected. Maintain consistent honorific usage.',
        suggestion: 'Choose either आप (formal) or तुम (informal) and use consistently throughout.',
        originalText: '',
        translatedText: text
      });
    }
  }
  
  // Check for gender agreement issues
  if (GRAMMAR_PATTERNS.genderMismatch.test(text)) {
    issues.push({
      type: 'grammar',
      severity: 'high',
      message: 'Potential gender agreement issue detected.',
      suggestion: 'Ensure proper gender agreement between nouns and verbs.',
      originalText: '',
      translatedText: text
    });
  }
  
  return issues;
};

const checkTone = (text: string, context: string): QualityIssue[] => {
  const issues: QualityIssue[] = [];
  
  // Check for overly formal tone in technical context
  if (context === 'technical') {
    const formalIndicators = [
      'कृपया ध्यान दें',
      'सावधानीपूर्वक',
      'अत्यंत महत्वपूर्ण',
      'निम्नलिखित बिंदुओं पर ध्यान दें'
    ];
    
    for (const indicator of formalIndicators) {
      if (text.includes(indicator)) {
        issues.push({
          type: 'tone',
          severity: 'low',
          message: 'Overly formal tone detected for technical context.',
          suggestion: 'Use more accessible, clear language.',
          originalText: '',
          translatedText: text
        });
        break;
      }
    }
  }
  
  return issues;
};

const checkStructure = (originalText: string, translatedText: string): QualityIssue[] => {
  const issues: QualityIssue[] = [];
  
  // Check for serial number stripping
  const serialNumberPattern = /^\d+\.\s*/;
  if (serialNumberPattern.test(originalText) && !serialNumberPattern.test(translatedText)) {
    issues.push({
      type: 'structure',
      severity: 'low',
      message: 'Serial number was stripped from translation.',
      suggestion: 'Ensure consistent formatting with original text.',
      originalText,
      translatedText
    });
  }
  
  // Check for column header consistency
  const columnMappings = {
    'Question': 'प्रश्न',
    'Option1': 'विकल्प 1',
    'Option2': 'विकल्प 2',
    'Option3': 'विकल्प 3',
    'Option4': 'विकल्प 4',
    'Correct ans': 'सही उत्तर',
    'Answer': 'उत्तर',
    'Explanation': 'व्याख्या'
  };
  
  for (const [english, hindi] of Object.entries(columnMappings)) {
    if (originalText.trim() === english) {
      // Remove serial numbers and extra formatting from translated text for comparison
      const cleanTranslatedText = translatedText
        .replace(/^[०-९0-9]+\.\s*/, '') // Remove leading serial numbers (both Arabic and Hindi numerals)
        .trim();
      
      if (cleanTranslatedText !== hindi) {
        issues.push({
          type: 'structure',
          severity: 'high',
          message: `Inconsistent column header translation. Expected "${hindi}" for "${english}".`,
          suggestion: `Use "${hindi}" for consistent column mapping. Remove serial numbers from column headers.`,
          originalText,
          translatedText
        });
      }
    }
  }
  
  return issues;
};

const calculateQualityScore = (issues: QualityIssue[], textLength: number): number => {
  if (issues.length === 0) return 100;
  
  let totalPenalty = 0;
  
  for (const issue of issues) {
    switch (issue.severity) {
      case 'high':
        totalPenalty += 15;
        break;
      case 'medium':
        totalPenalty += 8;
        break;
      case 'low':
        totalPenalty += 3;
        break;
    }
  }
  
  // Normalize by text length (longer texts get more lenient scoring)
  const lengthFactor = Math.min(textLength / 100, 2);
  const normalizedPenalty = totalPenalty / lengthFactor;
  
  return Math.max(0, Math.round(100 - normalizedPenalty));
};

export const getQualitySuggestions = (issues: QualityIssue[]): string[] => {
  const suggestions: string[] = [];
  
  const formalWordCount = issues.filter(i => i.type === 'formal_word').length;
  const literalCount = issues.filter(i => i.type === 'literal_translation').length;
  const grammarCount = issues.filter(i => i.type === 'grammar').length;
  
  if (formalWordCount > 0) {
    suggestions.push(`Consider replacing ${formalWordCount} formal word(s) with more colloquial alternatives.`);
  }
  
  if (literalCount > 0) {
    suggestions.push(`Avoid ${literalCount} literal translation(s) for more natural Hindi expressions.`);
  }
  
  if (grammarCount > 0) {
    suggestions.push(`Review ${grammarCount} grammar issue(s) for consistency and accuracy.`);
  }
  
  return suggestions;
};
