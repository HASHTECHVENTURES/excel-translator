import React from 'react';
import { TranslationSettings as Settings, GlossaryTerm } from '../types';
import { getLanguageOptions, getToneOptions, getDomainOptions } from '../utils/translation';

interface TranslationSettingsProps {
  settings: Settings;
  glossary: GlossaryTerm[];
  onSettingsChange: (settings: Settings) => void;
  onGlossaryChange: (glossary: GlossaryTerm[]) => void;
}

export const TranslationSettings: React.FC<TranslationSettingsProps> = ({
  settings,
  glossary,
  onSettingsChange,
  onGlossaryChange
}) => {
  const languageOptions = getLanguageOptions();

  const handleSettingChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Language
        </label>
        <select
          value={settings.target}
          onChange={(e) => handleSettingChange('target', e.target.value as Settings['target'])}
          className="input-field"
          aria-label="Select target language"
        >
          {languageOptions.map(option => (
            <option key={option.code} value={option.code}>
              {option.name} ({option.nativeName})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
