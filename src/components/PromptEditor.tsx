import React, { useState, useEffect } from 'react';
import { Save, Edit3, Trash2, Plus, Eye, EyeOff, RotateCcw } from 'lucide-react';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PromptEditorProps {
  onPromptChange: (template: PromptTemplate) => void;
  currentTemplate?: PromptTemplate;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ onPromptChange, currentTemplate }) => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    userPrompt: ''
  });

  // Default templates
  const defaultTemplates: PromptTemplate[] = [
    {
      id: 'default-hindi',
      name: 'Default Hindi (Educational)',
      description: 'Standard Hindi translation with educational context and quality rules',
      systemPrompt: `You are a professional translator for Indian languages. Translate the provided Excel cell texts into Hindi.

MANDATORY NUMBER TRANSLATION RULES:
- ALWAYS convert ALL Arabic numerals (0-9) to Hindi numerals
- 0→०, 1→१, 2→२, 3→३, 4→४, 5→५, 6→६, 7→७, 8→८, 9→९
- This includes standalone numbers, numbers in text, and any numeric content
- NEVER leave Arabic numerals untranslated

HINDI TRANSLATION QUALITY RULES (MANDATORY):

1. TONE AND REGISTER:
- Use colloquial, student-friendly Hindi over overly formal or Sanskritised phrases
- Avoid bureaucratic vocabulary unless contextually required
- Use second-person respectful singular (आप, कीजिए) consistently for professional but friendly tone

2. FORMAL WORDS TO REPLACE:
- औपचारिक → ज़रूरी / सरकारी
- प्रस्ताव → योजना
- स्पष्टता → साफ़ समझ
- प्रशिक्षण → सीखने की पहल
- प्रक्रिया → तरीका
- संदर्भ → साथ / स्थिति के अनुसार
- विश्लेषण → जांच / समझ
- सुलभ → आसान / सरल
- स्थापित → मज़बूत करना / बनाना
- सहभागिता → भागीदारी / हिस्सा लेना

3. STRUCTURE & FORMAT:
- Ensure row-wise alignment between English and Hindi
- Use consistent column mappings: "Question" → "प्रश्न", "Option1" → "विकल्प 1", "Correct ans" → "सही उत्तर"
- NEVER add serial numbers to column headers - translate them exactly as specified
- Strip serial numbers or prefix numerals from analysis for content cells only

4. LITERAL TRANSLATION CHECKS:
- Avoid calque translations (literal word-for-word copying of English structure)
- Use natural Hindi idioms where appropriate
- Simplify English-origin phrases like "समय प्रबंधन"

5. GRAMMAR CONSISTENCY:
- Ensure gender agreement and postposition accuracy
- Maintain consistent honorific usage
- Avoid mixing pronouns (don't switch between आप and तुम)

6. CULTURAL & CONTEXTUAL ADAPTATION:
- Use terms familiar to Indian classrooms for educational content
- Use Indian names and scenarios in examples when applicable

EDUCATIONAL CONTEXT RULES:
- Use student-friendly, accessible language
- Prefer simple, clear explanations over complex terminology
- Use examples and analogies familiar to Indian students
- Maintain academic rigor while being approachable

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

Return only the translated strings, one per line, in the exact same order as input.`,
      userPrompt: `Translate these Excel cell contents into Hindi. Translate ALL text content completely:

{texts}

CRITICAL REQUIREMENTS: 
- Translate every word and phrase completely
- Do not leave any English text untranslated
- ALWAYS convert ALL numbers to Hindi numerals (0→०, 1→१, 2→२, 3→३, 4→४, 5→५, 6→६, 7→७, 8→८, 9→९)
- Be consistent with terminology
- Provide complete Hindi translations
- Use colloquial, student-friendly Hindi for educational content
- Avoid overly formal or bureaucratic language
- For column headers (Question, Option1, Option2, etc.), translate exactly without adding serial numbers

Provide translations in the same order, one per line:`,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'formal-hindi',
      name: 'Formal Hindi (Business)',
      description: 'Formal Hindi translation suitable for business and administrative documents',
      systemPrompt: `You are a professional translator for Indian languages. Translate the provided Excel cell texts into formal Hindi suitable for business and administrative contexts.

MANDATORY NUMBER TRANSLATION RULES:
- ALWAYS convert ALL Arabic numerals (0-9) to Hindi numerals
- 0→०, 1→१, 2→२, 3→३, 4→४, 5→५, 6→६, 7→७, 8→८, 9→९

BUSINESS TRANSLATION RULES:
- Use formal, professional Hindi appropriate for business documents
- Maintain bureaucratic and administrative terminology where contextually appropriate
- Use respectful and formal tone throughout
- Preserve technical terms and industry-specific vocabulary
- Ensure consistency in terminology across all translations

Return only the translated strings, one per line, in the exact same order as input.`,
      userPrompt: `Translate these Excel cell contents into formal Hindi suitable for business contexts:

{texts}

CRITICAL REQUIREMENTS: 
- Translate every word and phrase completely
- Use formal, professional Hindi
- ALWAYS convert ALL numbers to Hindi numerals
- Maintain business-appropriate terminology
- Provide complete Hindi translations

Provide translations in the same order, one per line:`,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  useEffect(() => {
    // Load templates from localStorage or use defaults
    const savedTemplates = localStorage.getItem('translation-templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      setTemplates(defaultTemplates);
      localStorage.setItem('translation-templates', JSON.stringify(defaultTemplates));
    }
  }, []);

  useEffect(() => {
    // Set current template if provided
    if (currentTemplate) {
      setSelectedTemplate(currentTemplate);
    } else if (templates.length > 0) {
      setSelectedTemplate(templates[0]);
    }
  }, [currentTemplate, templates]);

  const saveTemplate = () => {
    if (!editForm.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    const newTemplate: PromptTemplate = {
      id: selectedTemplate?.id || `template-${Date.now()}`,
      name: editForm.name,
      description: editForm.description,
      systemPrompt: editForm.systemPrompt,
      userPrompt: editForm.userPrompt,
      isDefault: false,
      createdAt: selectedTemplate?.createdAt || new Date(),
      updatedAt: new Date()
    };

    const updatedTemplates = selectedTemplate
      ? templates.map(t => t.id === selectedTemplate.id ? newTemplate : t)
      : [...templates, newTemplate];

    setTemplates(updatedTemplates);
    localStorage.setItem('translation-templates', JSON.stringify(updatedTemplates));
    setSelectedTemplate(newTemplate);
    setIsEditing(false);
    onPromptChange(newTemplate);
  };

  const deleteTemplate = (template: PromptTemplate) => {
    if (template.isDefault) {
      alert('Cannot delete default templates');
      return;
    }

    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      const updatedTemplates = templates.filter(t => t.id !== template.id);
      setTemplates(updatedTemplates);
      localStorage.setItem('translation-templates', JSON.stringify(updatedTemplates));
      
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(updatedTemplates[0] || null);
      }
    }
  };

  const resetToDefault = () => {
    if (confirm('This will reset all templates to default. Are you sure?')) {
      setTemplates(defaultTemplates);
      localStorage.setItem('translation-templates', JSON.stringify(defaultTemplates));
      setSelectedTemplate(defaultTemplates[0]);
    }
  };

  const startEditing = (template: PromptTemplate) => {
    setEditForm({
      name: template.name,
      description: template.description,
      systemPrompt: template.systemPrompt,
      userPrompt: template.userPrompt
    });
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({
      name: '',
      description: '',
      systemPrompt: '',
      userPrompt: ''
    });
  };

  const createNewTemplate = () => {
    setEditForm({
      name: '',
      description: '',
      systemPrompt: defaultTemplates[0].systemPrompt,
      userPrompt: defaultTemplates[0].userPrompt
    });
    setSelectedTemplate(null);
    setIsEditing(true);
  };

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
          <button
            onClick={createNewTemplate}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Templates</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !isEditing && setSelectedTemplate(template)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {template.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Default
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {!template.isDefault && (
                    <div className="flex items-center gap-1">
                                             <button
                         onClick={(e) => {
                           e.stopPropagation();
                           startEditing(template);
                         }}
                         className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                         aria-label={`Edit template ${template.name}`}
                       >
                         <Edit3 className="w-4 h-4" />
                       </button>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           deleteTemplate(template);
                         }}
                         className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                         aria-label={`Delete template ${template.name}`}
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTemplate}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Template
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of this template"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      System Prompt
                    </label>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </div>
                  {showPreview ? (
                    <div className="p-4 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">{editForm.systemPrompt}</pre>
                    </div>
                  ) : (
                    <textarea
                      value={editForm.systemPrompt}
                      onChange={(e) => setEditForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                      rows={12}
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
              </div>
            </div>
          ) : selectedTemplate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedTemplate.description}</p>
                </div>
                {!selectedTemplate.isDefault && (
                  <button
                    onClick={() => startEditing(selectedTemplate)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Template
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
                  <div className="p-4 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTemplate.systemPrompt}</pre>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Prompt Template</label>
                  <div className="p-4 bg-gray-50 rounded-lg border max-h-48 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTemplate.userPrompt}</pre>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(selectedTemplate.updatedAt).toLocaleString()}
                </div>
                <button
                  onClick={() => onPromptChange(selectedTemplate)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Use This Template
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Select a template to view or edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptEditor;
