import React, { useState } from 'react';
import { 
  Search, AlertCircle, CheckCircle, Info, AlertTriangle,
  Globe, Zap, Shield, Code, FileText, Settings, TrendingUp,
  Loader2, Download, ExternalLink
} from 'lucide-react';

interface SEOIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  location: {
    type: string;
    url: string;
    name: string;
  };
  impact: number;
  recommendation: string;
}

interface AnalysisResult {
  url: string;
  analyzedAt: string;
  wordpress: {
    isWordPress: boolean;
    version?: string;
    theme?: string;
    activePlugins?: string[];
    restApiEnabled: boolean;
    xmlrpcEnabled: boolean;
    debugMode: boolean;
    permalink_structure?: string;
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
    fcp: number;
    lcp: number;
    cls: number;
    tti: number;
  };
  score: {
    overall: number;
  };
  issues: SEOIssue[];
  pagesAnalyzed: any[];
  recommendations: string[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    warningIssues: number;
    infoIssues: number;
    categoryBreakdown: Record<string, number>;
  };
}

interface ProgressUpdate {
  stage: string;
  progress: number;
  message: string;
}

export default function SEOAnalyzer() {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setProgress(null);
    setResult(null);
    setSelectedIssues(new Set());

    try {
      const response = await fetch('/api/seo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('Stream not available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'complete') {
              setResult(data.result);
              setProgress(null);
            } else if (data.type === 'error') {
              setError(data.message);
            } else {
              setProgress(data);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFix = async () => {
    if (selectedIssues.size === 0) {
      alert('Please select issues to fix');
      return;
    }

    try {
      const response = await fetch('/api/seo/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: result?.url, 
          issueIds: Array.from(selectedIssues) 
        })
      });

      const data = await response.json();
      alert(data.message);
    } catch (err: any) {
      alert('Fix failed: ' + err.message);
    }
  };

  const toggleIssue = (issueId: string) => {
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(issueId)) {
      newSelected.delete(issueId);
    } else {
      newSelected.add(issueId);
    }
    setSelectedIssues(newSelected);
  };

  const selectAllIssues = () => {
    if (result) {
      setSelectedIssues(new Set(result.issues.map(i => i.id)));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    if (score >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meta-tags': return <FileText className="w-4 h-4" />;
      case 'technical': return <Settings className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      case 'images': return <FileText className="w-4 h-4" />;
      case 'headings': return <Code className="w-4 h-4" />;
      case 'schema': return <Code className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Search className="w-10 h-10 text-indigo-600" />
            WordPress SEO Analyzer
          </h1>
          <p className="text-gray-600">Comprehensive SEO audit powered by AI</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter WordPress site URL (e.g., example.com)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={analyzing}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {progress && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{progress.message}</span>
              <span className="text-sm font-medium text-indigo-600">{progress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className={`bg-white rounded-2xl shadow-lg p-8 border-2 ${getScoreBgColor(result.score.overall)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall SEO Score</h2>
                  <p className="text-gray-600">Analyzed {result.pagesAnalyzed.length} pages</p>
                </div>
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(result.score.overall)}`}>
                    {result.score.overall}
                  </div>
                  <div className="text-gray-500 text-sm">out of 100</div>
                </div>
              </div>
            </div>

            {/* Lighthouse Metrics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                Lighthouse Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Performance', value: result.lighthouse.performance, icon: Zap },
                  { label: 'SEO', value: result.lighthouse.seo, icon: Search },
                  { label: 'Accessibility', value: result.lighthouse.accessibility, icon: Shield },
                  { label: 'Best Practices', value: result.lighthouse.bestPractices, icon: CheckCircle },
                  { label: 'PWA', value: result.lighthouse.pwa, icon: Globe }
                ].map(metric => (
                  <div key={metric.label} className="text-center p-4 bg-gray-50 rounded-lg">
                    <metric.icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <div className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                      {metric.value}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{metric.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">FCP</div>
                  <div className="text-sm font-semibold">{(result.lighthouse.fcp / 1000).toFixed(2)}s</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">LCP</div>
                  <div className="text-sm font-semibold">{(result.lighthouse.lcp / 1000).toFixed(2)}s</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">CLS</div>
                  <div className="text-sm font-semibold">{result.lighthouse.cls.toFixed(3)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">TTI</div>
                  <div className="text-sm font-semibold">{(result.lighthouse.tti / 1000).toFixed(2)}s</div>
                </div>
              </div>
            </div>

            {/* WordPress Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-indigo-600" />
                WordPress Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Version</div>
                  <div className="font-semibold">{result.wordpress.version || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Theme</div>
                  <div className="font-semibold">{result.wordpress.theme || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Plugins</div>
                  <div className="font-semibold">{result.wordpress.activePlugins?.length || 0} active</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">REST API</div>
                  <div className={result.wordpress.restApiEnabled ? 'text-green-600' : 'text-red-600'}>
                    {result.wordpress.restApiEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Permalinks</div>
                  <div className="font-semibold">{result.wordpress.permalink_structure || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Debug Mode</div>
                  <div className={result.wordpress.debugMode ? 'text-red-600' : 'text-green-600'}>
                    {result.wordpress.debugMode ? 'ON (⚠️)' : 'OFF'}
                  </div>
                </div>
              </div>
            </div>

            {/* Issues Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-indigo-600" />
                  Issues Found ({result.summary.totalIssues})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllIssues}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleFix}
                    disabled={selectedIssues.size === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Fix Selected ({selectedIssues.size})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{result.summary.criticalIssues}</div>
                  <div className="text-sm text-red-700">Critical</div>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{result.summary.warningIssues}</div>
                  <div className="text-sm text-yellow-700">Warnings</div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.summary.infoIssues}</div>
                  <div className="text-sm text-blue-700">Info</div>
                </div>
              </div>

              {/* Issues List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {result.issues
                  .sort((a, b) => {
                    const severityOrder = { critical: 0, warning: 1, info: 2 };
                    return severityOrder[a.severity] - severityOrder[b.severity];
                  })
                  .map(issue => (
                    <div
                      key={issue.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => toggleIssue(issue.id)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIssues.has(issue.id)}
                          onChange={() => toggleIssue(issue.id)}
                          className="mt-1 w-4 h-4 text-indigo-600 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(issue.category)}
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                {issue.category}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-900">
                            <strong>Fix:</strong> {issue.recommendation}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Impact: {issue.impact}/10</span>
                            <span>•</span>
                            <span>{issue.location.type}</span>
                            {issue.location.url !== result.url && (
                              <>
                                <span>•</span>
                                <a
                                  href={issue.location.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-indigo-600 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View page <ExternalLink className="w-3 h-3" />
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* AI Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-indigo-600" />
                  AI-Powered Recommendations
                </h3>
                <div className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-800">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Report */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `seo-report-${new Date().toISOString()}.json`;
                  a.click();
                }}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 font-medium transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Full Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}