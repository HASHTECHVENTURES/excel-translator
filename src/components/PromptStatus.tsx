import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { PromptTemplate } from './PromptEditor';
import { testCustomPrompt } from '../utils/translation';

interface PromptStatusProps {
  currentTemplate: PromptTemplate | null;
  onTemplateChange: (template: PromptTemplate | null) => void;
}

const PromptStatus: React.FC<PromptStatusProps> = ({ currentTemplate, onTemplateChange }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | 'pending' | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const testCurrentTemplate = async () => {
    if (!currentTemplate) return;
    
    setIsTesting(true);
    setTestResult('pending');
    setShowNotification(true);
    
    try {
      const success = await testCustomPrompt(currentTemplate);
      setTestResult(success ? 'success' : 'error');
      
      // Auto-hide success notification after 3 seconds
      if (success) {
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (error) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (!currentTemplate) return <Info className="w-4 h-4 text-gray-400" />;
    if (testResult === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (testResult === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (testResult === 'pending') return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  const getStatusText = () => {
    if (!currentTemplate) return 'Using default prompts';
    if (testResult === 'success') return 'Template verified and working';
    if (testResult === 'error') return 'Template test failed';
    if (testResult === 'pending') return 'Testing template...';
    return 'Template ready (not tested)';
  };

  const getStatusColor = () => {
    if (!currentTemplate) return 'text-gray-600';
    if (testResult === 'success') return 'text-green-600';
    if (testResult === 'error') return 'text-red-600';
    if (testResult === 'pending') return 'text-blue-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-3">
      {/* Status Bar */}
      <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
        currentTemplate 
          ? 'bg-green-50 border-green-200 shadow-sm' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            {currentTemplate && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  Template: {currentTemplate.name}
                </span>
                <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                  Active
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {currentTemplate && (
            <button
              onClick={testCurrentTemplate}
              disabled={isTesting}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Test Now'}
            </button>
          )}
          {currentTemplate && (
            <button
              onClick={() => onTemplateChange(null)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
            >
              <XCircle className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className={`p-3 rounded-lg border ${
          testResult === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : testResult === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {testResult === 'success' && <CheckCircle className="w-4 h-4" />}
              {testResult === 'error' && <AlertCircle className="w-4 h-4" />}
              {testResult === 'pending' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
              <span className="text-sm font-medium">
                {testResult === 'success' && '✅ Template Test Successful!'}
                {testResult === 'error' && '❌ Template Test Failed'}
                {testResult === 'pending' && '🔄 Testing Template...'}
              </span>
            </div>
                         <button
               onClick={() => setShowNotification(false)}
               className="text-gray-400 hover:text-gray-600"
               aria-label="Close notification"
             >
               <XCircle className="w-4 h-4" />
             </button>
          </div>
          {testResult === 'success' && (
            <p className="text-xs mt-1">
              Your custom prompt is working correctly and will be used for translations.
            </p>
          )}
          {testResult === 'error' && (
            <p className="text-xs mt-1">
              There was an issue with your template. Check the console for details.
            </p>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {currentTemplate && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 mb-2">
            <strong>Quick Actions:</strong>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={testCurrentTemplate}
              disabled={isTesting}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Verify Template'}
            </button>
            <span className="text-xs text-blue-600">
              • Test with real API call
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptStatus;
