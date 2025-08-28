# Excel Translator (Hindi • Marathi)

A modern, responsive web application that translates Excel files into Indian languages using AI while preserving structure, formatting, and meaning.

## Features

### 🚀 Core Functionality
- **Multi-sheet Excel support** - Process entire workbooks with multiple sheets
- **AI-powered translation** - Uses Google's Gemini AI for context-aware translations
- **Language support** - Hindi and Marathi (easily extensible)
- **Preserve structure** - Maintains sheets, merged cells, formatting, formulas, and data validation
- **Smart content detection** - Automatically skips numbers, dates, emails, URLs, and formulas

### 🎛️ Advanced Controls
- **Tone selection** - Formal, Neutral, or Conversational
- **Domain-specific** - Marketing or Technical content
- **Glossary support** - Preserve brand terms and custom replacements
- **Protected columns** - Skip translation for specific columns
- **Sheet selection** - Choose which sheets to translate
- **Quality validation** - Automated checks for formal words, literal translations, and grammar consistency

### 🎯 Custom Prompt System
- **Real-time prompt editing** - Modify AI prompts and see changes immediately reflected
- **Live preview** - See how your prompt changes affect the translation process
- **Template management** - Save, edit, and reuse custom prompt templates
- **Instant application** - Changes to prompts are applied immediately for next translation
- **Visual feedback** - Clear indicators show when custom prompts are active
- **Template testing** - Test your custom prompts before using them in production

### 📊 Preview & Quality
- **Side-by-side preview** - Compare original and translated content
- **Real-time statistics** - Track translated, skipped, and conflicted cells
- **Progress tracking** - Visual progress indicator during translation
- **Quality analysis** - Automated Hindi translation quality checking with detailed reports
- **Error handling** - Graceful error handling with user-friendly messages

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Excel Processing**: SheetJS (xlsx)
- **AI Translation**: Google Gemini API
- **Quality Analysis**: Custom Hindi translation quality checker
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd excel-translator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Step 1: Upload Excel File
- Drag and drop or click to browse for `.xlsx` or `.xls` files
- Maximum file size: 20MB
- Supports multi-sheet workbooks

### Step 2: Configure Translation Settings
- **Target Language**: Choose Hindi or Marathi
- **Tone**: Select formality level (Formal, Neutral, Conversational)
- **Domain**: Specify content type (Marketing or Technical) for better context
- **Glossary**: Add terms to preserve or replace
- **Sheet Selection**: Choose which sheets to translate
- **Protected Columns**: Mark columns that shouldn't be translated

### Step 3: Preview & Download
- Review translations with side-by-side comparison
- Check statistics and quality metrics
- Analyze translation quality with detailed reports (Hindi only)
- Download the translated Excel file

### 🎯 Customizing Translation Prompts

The application includes a powerful prompt editing system that allows you to customize how the AI translates your content:

#### Accessing the Prompt Editor
1. Click the "Customize Prompts" button in the settings step
2. Choose from existing templates or create a new one
3. Edit the system prompt (AI instructions) and user prompt (translation request)

#### How Changes Are Reflected
- **Immediate Application**: When you save or apply a template, it's immediately active
- **Visual Indicators**: The interface shows when a custom prompt is active
- **Real-time Preview**: See exactly how your prompt will be used
- **Template Testing**: Test your prompts before using them in production

#### Prompt Components
- **System Prompt**: Instructions to the AI about translation style, rules, and quality standards
- **User Prompt**: The actual request sent to the AI with your text to translate
- **Template Variables**: Use `{texts}` placeholder in user prompts for dynamic text insertion

#### Best Practices
- Keep system prompts focused on translation rules and style
- Use user prompts to specify the exact format you want
- Test templates with small samples before full translation
- Monitor the character count to avoid performance issues

## API Configuration

The application uses Google's Gemini API for translation. The API key is configured in `src/utils/translation.ts`:

```typescript
const GEMINI_API_KEY = 'your-api-key-here';
```

To use your own API key:
1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Replace the API key in the translation utility file
3. Ensure you have sufficient quota for your translation needs

## Data Privacy

- **Client-side processing**: All Excel parsing and translation happens in the browser
- **No data storage**: Files are not uploaded to any server
- **Secure API calls**: Only text content is sent to the translation API
- **Local processing**: File structure and metadata remain local

## File Format Support

### Supported Input Formats
- `.xlsx` (Excel 2007+)
- `.xls` (Excel 97-2003)

### Preserved Elements
- ✅ Sheet names and structure
- ✅ Cell formatting and styles
- ✅ Formulas and calculations
- ✅ Merged cells
- ✅ Data validation rules
- ✅ Comments and notes
- ✅ Hyperlinks
- ✅ Numbers, dates, and special values

### Translation Rules
- **Translated**: Text content, headers, labels
- **Preserved**: Numbers, dates, formulas, emails, URLs, codes, IDs
- **Skipped**: Empty cells, protected columns, glossary terms

### Quality Standards (Hindi)
- **Tone**: Natural, accessible language over formal Sanskritised phrases
- **Formal Words**: Automatic detection and suggestions for colloquial alternatives
- **Grammar**: Consistent pronoun usage and gender agreement
- **Structure**: Proper column mapping and formatting consistency
- **Cultural Context**: Indian audience-friendly terminology and examples

## Performance

- **Batch processing**: Translates cells in batches of 50 for optimal performance
- **Progress tracking**: Real-time progress updates during translation
- **Memory efficient**: Processes large files without memory issues
- **Fast preview**: Instant switching between original and translated views

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── FileUpload.tsx
│   ├── TranslationSettings.tsx
│   ├── SheetSelector.tsx
│   ├── PreviewTable.tsx
│   └── ProgressModal.tsx
├── utils/              # Utility functions
│   ├── excel.ts        # Excel processing
│   ├── translation.ts  # AI translation
│   └── cn.ts          # CSS utilities
├── types.ts           # TypeScript definitions
├── App.tsx           # Main application
└── main.tsx          # Entry point
```

### Key Components

#### FileUpload
Handles drag-and-drop file upload with validation and error handling.

#### TranslationSettings
Manages translation configuration including language, tone, domain, and glossary.

#### SheetSelector
Allows users to select which sheets to translate and configure protected columns.

#### PreviewTable
Displays Excel data with pagination and side-by-side comparison.

#### ProgressModal
Shows translation progress with real-time updates and error handling.

### Adding New Languages

To add support for additional languages:

1. Update the language options in `src/utils/translation.ts`:
```typescript
export const getLanguageOptions = () => [
  { code: 'hi-IN' as const, name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr-IN' as const, name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu-IN' as const, name: 'Gujarati', nativeName: 'ગુજરાતી' }, // New language
];
```

2. Update the system prompt in the translation utility to include the new language mapping.

3. Update the TypeScript types to include the new language code.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation above
- Review the code comments for implementation details

## Roadmap

- [ ] Support for more Indian languages (Bengali, Tamil, Telugu, etc.)
- [ ] Batch file processing
- [ ] Translation memory and consistency
- [ ] Advanced formatting preservation
- [ ] Cloud storage integration
- [ ] Collaborative translation features


