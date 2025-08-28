import { Cell, TranslationSettings, GlossaryTerm } from '../types';

const GEMINI_API_KEY = 'AIzaSyD_H_MSp1zjV3PFJo4cYIQZLIczD8ROPsA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const translateCells = async (
  cells: Cell[],
  settings: TranslationSettings,
  glossary: GlossaryTerm[],
  onProgress?: (progress: number) => void
): Promise<Cell[]> => {
  const cellsToTranslate = cells.filter(cell => 
    cell.v && (typeof cell.v === 'string' || typeof cell.v === 'number') && !cell.skip
  );
  
  if (cellsToTranslate.length === 0) {
    return cells;
  }
  
  const batchSize = 50; // Process in batches to avoid API limits
  const translatedCells = [...cells];
  
  // Keep track of which cells have been translated
  let translatedCount = 0;
  
  for (let i = 0; i < cellsToTranslate.length; i += batchSize) {
    const batch = cellsToTranslate.slice(i, i + batchSize);
    const texts = batch.map(cell => cell.v.toString());
    
    try {
      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}, cells ${i + 1}-${Math.min(i + batchSize, cellsToTranslate.length)}`);
      
      const translations = await translateBatch(texts, settings, glossary);
      
      console.log(`📊 Batch ${Math.floor(i / batchSize) + 1} results:`, {
        textsSent: texts.length,
        translationsReceived: translations.length,
        translationsWithContent: translations.filter(t => t && t.trim()).length
      });
        
      // Update the translated cells for this batch only
      batch.forEach((batchCell, batchIndex) => {
        if (batchIndex < translations.length) {
          const translation = translations[batchIndex];
          // If translation is empty or undefined, use original text
          const finalTranslation = translation && translation.trim() ? translation : batchCell.v.toString();
          
          // Find the cell in the original array and update it
          const cellIndex = translatedCells.findIndex(cell => 
            cell === batchCell || 
            (cell.v === batchCell.v && cell.row === batchCell.row && cell.col === batchCell.col)
          );
          
          if (cellIndex !== -1) {
            translatedCells[cellIndex] = {
              ...batchCell,
              translated: finalTranslation
            };
            translatedCount++;
            
            // Debug: Log successful translation
            translatedCount++;
          }
        }
      });
      
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} completed. Total cells translated so far: ${translatedCount}`);
      
      // Update progress
      if (onProgress) {
        const progress = Math.min((i + batchSize) / cellsToTranslate.length, 1);
        onProgress(progress);
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Translation batch failed:', error);
      // Continue with next batch
    }
  }
  
  return translatedCells;
};

const translateBatch = async (
  texts: string[],
  settings: TranslationSettings,
  glossary: GlossaryTerm[]
): Promise<string[]> => {
  const systemPrompt = generateSystemPrompt(settings, glossary);
  const userPrompt = generateUserPrompt(texts);
  
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: userPrompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from translation API');
  }
  
  const translatedText = data.candidates[0].content.parts[0].text;
  
  console.log('🎯 Raw API response:', translatedText);
  
  // Parse the response back into individual translations
  const translations = parseTranslationResponse(translatedText, texts.length);
  
  console.log('📝 Parsed translations:', translations);
  
  return translations;
};

const generateSystemPrompt = (settings: TranslationSettings, glossary: GlossaryTerm[]): string => {
  const languageMap = {
    'hi-IN': 'Hindi',
    'mr-IN': 'Marathi'
  };
  
  return `You are a professional translator for Indian languages. Translate the provided Excel cell texts into ${languageMap[settings.target]}.

MANDATORY NUMBER TRANSLATION RULES:
- ALWAYS convert ALL Arabic numerals (0-9) to ${languageMap[settings.target]} numerals
- 0→०, 1→१, 2→२, 3→३, 4→४, 5→५, 6→६, 7→७, 8→८, 9→९
- This includes standalone numbers, numbers in text, and any numeric content
- NEVER leave Arabic numerals untranslated

CRITICAL RULES:
- NEVER change meaning or context
- Preserve placeholders, dates, codes, emails, URLs, formulas exactly as they appear
- For each input cell, return exactly one translated string in the same order
- Use natural, locale-accurate phrasing and idioms
- Maintain professional tone and accuracy
- Preserve any special formatting indicators or placeholders
- Translate ALL text content, including technical terms, proper nouns, and compound words
- Be consistent with terminology throughout the translation
- If a term appears multiple times, translate it consistently
- For educational content, use appropriate academic terminology
- Ensure complete translation - do not leave any English text untranslated

Return only the translated strings, one per line, in the exact same order as input.`;
};

const generateUserPrompt = (texts: string[]): string => {
  return `Translate these Excel cell contents into Hindi. Translate ALL text content completely:

${texts.map((text, index) => `${index + 1}. ${text}`).join('\n')}

CRITICAL REQUIREMENTS: 
- Translate every word and phrase completely
- Do not leave any English text untranslated
- ALWAYS convert ALL numbers to Hindi numerals (0→०, 1→१, 2→२, 3→३, 4→४, 5→५, 6→६, 7→७, 8→८, 9→९)
- Be consistent with terminology
- Provide complete Hindi translations

Provide translations in the same order, one per line:`;
};

const parseTranslationResponse = (response: string, expectedCount: number): string[] => {
  console.log(`🔍 Raw response length: ${response.length}, expected: ${expectedCount}`);
  
  // Split by lines and clean up
  const lines = response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  console.log(`🔍 Found ${lines.length} non-empty lines`);
  
  // Extract translations by removing numbering
  const translations = lines
    .map(line => {
      // Remove numbering like "1. ", "2. " etc.
      const cleaned = line.replace(/^\d+\.\s*/, '');
      return cleaned;
    })
    .filter(translation => translation.length > 0) // Remove empty translations
    .slice(0, expectedCount);
  
  console.log(`🔍 Extracted ${translations.length} translations, expected ${expectedCount}`);
  
  // If we don't have enough translations, pad with empty strings
  while (translations.length < expectedCount) {
    translations.push('');
  }
  
  return translations;
};

export const getLanguageOptions = () => [
  { code: 'hi-IN' as const, name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr-IN' as const, name: 'Marathi', nativeName: 'मराठी' }
];

export const getToneOptions = () => [
  { value: 'formal' as const, label: 'Formal', description: 'Respectful and professional tone' },
  { value: 'neutral' as const, label: 'Neutral', description: 'Standard professional tone' },
  { value: 'conversational' as const, label: 'Conversational', description: 'Friendly and approachable tone' }
];

export const getDomainOptions = () => [
  { value: 'education' as const, label: 'Education', description: 'Educational content and materials' },
  { value: 'admin' as const, label: 'Administrative', description: 'Administrative documents and forms' },
  { value: 'marketing' as const, label: 'Marketing', description: 'Marketing materials and campaigns' },
  { value: 'technical' as const, label: 'Technical', description: 'Technical documentation and manuals' }
];
