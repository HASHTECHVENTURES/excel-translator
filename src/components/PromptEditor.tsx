import React, { useState, useEffect } from 'react';
import { Save, Edit3, Eye, EyeOff, RotateCcw } from 'lucide-react';

export interface PromptTemplate {
  id: string;
  name: string;
  systemPrompt: string;
  userPrompt: string;
  updatedAt: Date;
}

interface PromptEditorProps {
  onPromptChange: (template: PromptTemplate) => void;
  currentTemplate?: PromptTemplate;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ onPromptChange, currentTemplate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editForm, setEditForm] = useState({
    systemPrompt: '',
    userPrompt: ''
  });

  // Default general prompt
  const defaultPrompt: PromptTemplate = {
    id: 'general-prompt',
    name: 'General Translation Prompt',
    systemPrompt: `You are a professional translator for Indian languages. Translate the provided Excel cell texts into the target language.

MANDATORY NUMBER TRANSLATION RULES:
- ALWAYS convert ALL Arabic numerals (0-9) to target language numerals
- 0→०, 1→१, 2→२, 3→३, 4→४, 5→५, 6→६, 7→७, 8→८, 9→९
- This includes standalone numbers, numbers in text, and any numeric content
- NEVER leave Arabic numerals untranslated

TRANSLATION QUALITY RULES:
- Use natural, accessible language over overly formal phrases
- Adapt tone to match the content type (formal for business, casual for general content)
- Maintain consistency in terminology throughout the translation
- Preserve the original meaning and context
- Use clear, understandable phrasing
- Adapt to the target language's natural expression patterns

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
- Ensure complete translation - do not leave any English text untranslated

Return only the translated strings, one per line, in the exact same order as input.`,
    userPrompt: `Translate these Excel cell contents into the target language. Translate ALL text content completely:

{texts}

CRITICAL REQUIREMENTS: 
- Translate every word and phrase completely
- Do not leave any English text untranslated
- ALWAYS convert ALL numbers to target language numerals
- Be consistent with terminology
- Provide complete translations
- Use natural, accessible language
- Avoid overly formal or bureaucratic language

Provide translations in the same order, one per line:`,
    updatedAt: new Date()
  };

  useEffect(() => {
    // Load saved prompt from localStorage or use default
    const savedPrompt = localStorage.getItem('translation-prompt');
    if (savedPrompt) {
      const parsed = JSON.parse(savedPrompt);
      setEditForm({
        systemPrompt: parsed.systemPrompt,
        userPrompt: parsed.userPrompt
      });
    } else {
      setEditForm({
        systemPrompt: defaultPrompt.systemPrompt,
        userPrompt: defaultPrompt.userPrompt
      });
    }
  }, []);

  const savePrompt = () => {
    const newPrompt: PromptTemplate = {
      id: 'general-prompt',
      name: 'General Translation Prompt',
      systemPrompt: editForm.systemPrompt,
      userPrompt: editForm.userPrompt,
      updatedAt: new Date()
    };

    // Save to localStorage
    localStorage.setItem('translation-prompt', JSON.stringify(newPrompt));
    
    setIsEditing(false);
    onPromptChange(newPrompt);
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    successMessage.textContent = '✅ Prompt saved and applied!';
    document.body.appendChild(successMessage);
    setTimeout(() => document.body.removeChild(successMessage), 3000);
  };

  const resetToDefault = () => {
    if (confirm('This will reset the prompt to default. Are you sure?')) {
      setEditForm({
        systemPrompt: defaultPrompt.systemPrompt,
        userPrompt: defaultPrompt.userPrompt
      });
      localStorage.removeItem('translation-prompt');
      
      const newPrompt = { ...defaultPrompt, updatedAt: new Date() };
      onPromptChange(newPrompt);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    // Reset form to current values
    const savedPrompt = localStorage.getItem('translation-prompt');
    if (savedPrompt) {
      const parsed = JSON.parse(savedPrompt);
      setEditForm({
        systemPrompt: parsed.systemPrompt,
        userPrompt: parsed.userPrompt
      });
    } else {
      setEditForm({
        systemPrompt: defaultPrompt.systemPrompt,
        userPrompt: defaultPrompt.userPrompt
      });
    }
  };

  const currentPrompt = currentTemplate || defaultPrompt;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Translation Prompt Editor</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </button>
          {!isEditing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Prompt
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Edit Translation Prompt</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEditing}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePrompt}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Prompt
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  System Prompt (AI Instructions)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {editForm.systemPrompt.length} characters
                  </span>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </div>
              </div>
              {showPreview ? (
                <div className="p-4 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{editForm.systemPrompt}</pre>
                </div>
              ) : (
                <textarea
                  value={editForm.systemPrompt}
                  onChange={(e) => setEditForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Enter the system prompt for the AI..."
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Prompt Template
              </label>
              <textarea
                value={editForm.userPrompt}
                onChange={(e) => setEditForm(prev => ({ ...prev, userPrompt: e.target.value }))}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter the user prompt template. Use {texts} as placeholder for the text to translate."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{texts}'} as a placeholder for the text to be translated.
              </p>
            </div>

            {/* Live Preview Section */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-3">Live Preview</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-blue-700 mb-1">Sample Input:</p>
                  <div className="p-2 bg-white rounded border text-xs">
                    Hello, World
                  </div>
                </div>
                <div>
                  <p className="text-xs text-blue-700 mb-1">Generated User Prompt:</p>
                  <div className="p-2 bg-white rounded border text-xs font-mono max-h-32 overflow-y-auto">
                    {editForm.userPrompt.replace('{texts}', '1. Hello, World')}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-blue-700 mb-1">System Prompt Length:</p>
                  <div className="text-xs text-blue-600">
                    {editForm.systemPrompt.length} characters 
                    {editForm.systemPrompt.length > 4000 && (
                      <span className="text-orange-600 ml-2">⚠️ Long prompt may affect performance</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{currentPrompt.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Last updated: {new Date(currentPrompt.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
              <div className="p-4 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{currentPrompt.systemPrompt}</pre>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Prompt Template</label>
              <div className="p-4 bg-gray-50 rounded-lg border max-h-48 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{currentPrompt.userPrompt}</pre>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Prompt is active and will be used for translations
            </div>
            <button
              onClick={() => onPromptChange(currentPrompt)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Apply This Prompt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
