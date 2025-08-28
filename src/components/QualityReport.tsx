import React from 'react';
import { QualityReport, QualityIssue } from '../utils/qualityChecker';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface QualityReportProps {
  report: QualityReport;
  onClose?: () => void;
}

const QualityReportComponent: React.FC<QualityReportProps> = ({ report, onClose }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <XCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getIssueTypeLabel = (type: string) => {
    switch (type) {
      case 'formal_word':
        return 'Formal Word Usage';
      case 'literal_translation':
        return 'Literal Translation';
      case 'grammar':
        return 'Grammar Issue';
      case 'tone':
        return 'Tone Inconsistency';
      case 'structure':
        return 'Structure Issue';
      default:
        return 'Quality Issue';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Translation Quality Report</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close quality report"
          >
            <XCircle className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Quality Score */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-bold ${getScoreColor(report.score)}`}>
            {report.score}/100
          </div>
          <div>
            <div className={`text-lg font-semibold ${getScoreColor(report.score)}`}>
              {getScoreLabel(report.score)}
            </div>
            <div className="text-sm text-gray-600">
              {report.summary.totalIssues} issue(s) found
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{report.summary.totalIssues}</div>
          <div className="text-sm text-gray-600">Total Issues</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{report.summary.criticalIssues}</div>
          <div className="text-sm text-red-600">Critical</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{report.summary.formalWordIssues}</div>
          <div className="text-sm text-yellow-600">Formal Words</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{report.summary.literalTranslationIssues}</div>
          <div className="text-sm text-orange-600">Literal</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{report.summary.grammarIssues}</div>
          <div className="text-sm text-blue-600">Grammar</div>
        </div>
      </div>

      {/* Issues List */}
      {report.issues.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Quality Issues</h3>
          {report.issues.map((issue, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(issue.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium uppercase tracking-wide">
                      {getIssueTypeLabel(issue.type)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                      issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{issue.message}</p>
                  {issue.suggestion && (
                    <div className="bg-white bg-opacity-50 rounded p-3">
                      <p className="text-sm font-medium mb-1">Suggestion:</p>
                      <p className="text-sm">{issue.suggestion}</p>
                    </div>
                  )}
                  {issue.originalText && issue.translatedText && (
                    <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium mb-1">Original:</p>
                        <p className="bg-white bg-opacity-50 rounded p-2">{issue.originalText}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Translated:</p>
                        <p className="bg-white bg-opacity-50 rounded p-2">{issue.translatedText}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Excellent Quality!</h3>
          <p className="text-gray-600">No quality issues detected in the translation.</p>
        </div>
      )}

      {/* Recommendations */}
      {report.issues.length > 0 && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Recommendations</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            {report.summary.formalWordIssues > 0 && (
              <li>• Replace formal words with more colloquial alternatives for better readability</li>
            )}
            {report.summary.literalTranslationIssues > 0 && (
              <li>• Avoid literal translations and use natural Hindi expressions</li>
            )}
            {report.summary.grammarIssues > 0 && (
              <li>• Review grammar consistency, especially pronoun usage and gender agreement</li>
            )}
            {report.summary.criticalIssues > 0 && (
              <li>• Address critical issues first as they may affect comprehension</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QualityReportComponent;
