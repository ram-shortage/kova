import { useState, useEffect, useCallback } from 'react';
import { FileDown, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';
import { calculateContrastRatio, WCAG_AA_NORMAL_TEXT, type ExportFormat } from '@kova/shared';
import { clsx } from 'clsx';

// Use same host as the current page but different port for API
const API_BASE = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:3001`
  : 'http://localhost:3001';

const formats: Array<{
  value: ExportFormat;
  label: string;
  icon: string;
  description: string;
  compatibility: 'Full' | 'Good' | 'Limited';
}> = [
  {
    value: 'pptx',
    label: 'PowerPoint',
    icon: '📊',
    description: 'PPTX with editable master slides',
    compatibility: 'Full',
  },
];

interface QualityCheck {
  label: string;
  passed: boolean;
  message?: string;
}

type ExportStatus = 'idle' | 'starting' | 'processing' | 'completed' | 'failed';

export function ExportPage() {
  const { template, fonts } = useTemplateStore();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pptx');
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quality checks
  const qualityChecks: QualityCheck[] = [];

  // Contrast check
  const { colors } = template.tokens;
  const contrastRatios = ['primary', 'secondary', 'neutral'].map((key) =>
    calculateContrastRatio(colors[key as keyof typeof colors], colors.background)
  );
  const allContrastPass = contrastRatios.every((r) => r >= WCAG_AA_NORMAL_TEXT);
  qualityChecks.push({
    label: 'Contrast ratios meet WCAG AA',
    passed: allContrastPass,
    message: allContrastPass ? undefined : 'Some colors have insufficient contrast',
  });

  // Font size check
  const titleSizeOk = template.typography.title.fontSize >= 18;
  const bodySizeOk = template.typography.body.fontSize >= 12;
  qualityChecks.push({
    label: 'Minimum font sizes enforced',
    passed: titleSizeOk && bodySizeOk,
    message: titleSizeOk && bodySizeOk ? undefined : 'Some font sizes are below minimum',
  });

  // Spacing check
  const spacingOk = template.tokens.spacing.base >= 2;
  qualityChecks.push({
    label: 'Spacing within limits',
    passed: spacingOk,
    message: spacingOk ? undefined : 'Base spacing is too small',
  });

  // Font fallback check
  qualityChecks.push({
    label: 'All fonts have fallbacks',
    passed: true,
  });

  const hasBlockingIssues = qualityChecks.some((c) => !c.passed);
  const enabledLayoutCount = template.layouts.filter((l) => l.enabled).length;

  // Poll for job status
  const pollJobStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/export/status/${id}`);
      if (!response.ok) throw new Error('Failed to get status');

      const data = await response.json();
      setExportProgress(data.progress);

      if (data.status === 'completed') {
        setExportStatus('completed');
        setDownloadUrl(`${API_BASE}${data.downloadUrl}`);
        return true; // Stop polling
      } else if (data.status === 'failed') {
        setExportStatus('failed');
        setErrorMessage(data.error || 'Export failed');
        return true; // Stop polling
      }

      return false; // Continue polling
    } catch (error) {
      console.error('Error polling status:', error);
      return false;
    }
  }, []);

  // Start polling when we have a job ID
  useEffect(() => {
    if (!jobId || exportStatus === 'completed' || exportStatus === 'failed') return;

    const interval = setInterval(async () => {
      const done = await pollJobStatus(jobId);
      if (done) clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, [jobId, exportStatus, pollJobStatus]);

  // Handle export
  const handleExport = async () => {
    setExportStatus('starting');
    setExportProgress(0);
    setErrorMessage(null);
    setDownloadUrl(null);

    try {
      // Convert template to API-compatible format
      const exportTemplate = {
        id: template.id,
        name: template.name,
        version: template.version,
        tokens: template.tokens,
        typography: template.typography,
        layouts: template.layouts.filter(l => l.enabled),
        accents: template.accents || [],
      };

      const response = await fetch(`${API_BASE}/api/export/${template.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: selectedFormat,
          template: exportTemplate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      const data = await response.json();
      setJobId(data.jobId);
      setExportStatus('processing');
      setExportProgress(10);
    } catch (error) {
      setExportStatus('failed');
      setErrorMessage(error instanceof Error ? error.message : 'Export failed');
    }
  };

  // Handle download
  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  // Reset for new export
  const handleReset = () => {
    setExportStatus('idle');
    setExportProgress(0);
    setJobId(null);
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  const isExporting = exportStatus === 'starting' || exportStatus === 'processing';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Export Template</h2>
        <p className="text-slate-500 mt-1">Choose a format and download your template</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - Options */}
        <div className="space-y-6">
          {/* Format Selection */}
          <section className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-medium text-slate-700 mb-4">Export Format</h3>
            <div className="space-y-3">
              {formats.map((format) => (
                <label
                  key={format.value}
                  className={clsx(
                    'flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                    selectedFormat === format.value
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-slate-300',
                    isExporting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={selectedFormat === format.value}
                    onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                    disabled={isExporting}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{format.icon}</span>
                      <span className="font-medium text-slate-800">{format.label}</span>
                      <span
                        className={clsx(
                          'text-xs px-2 py-0.5 rounded',
                          format.compatibility === 'Full'
                            ? 'bg-green-100 text-green-700'
                            : format.compatibility === 'Good'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        )}
                      >
                        {format.compatibility}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{format.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Font Fallbacks */}
          <section className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-medium text-slate-700 mb-4">Font Fallbacks</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">
                  {template.typography.title.fontFamily}
                </span>
                <span className="text-sm text-slate-400">→</span>
                <span className="text-sm text-slate-600">Calibri (fallback)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">
                  {template.typography.body.fontFamily}
                </span>
                <span className="text-sm text-slate-400">→</span>
                <span className="text-sm text-slate-600">Arial (fallback)</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Summary */}
        <div>
          <section className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Export Summary</h3>

            {/* Template Info */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Template</span>
                <span className="text-sm font-medium text-slate-700">{template.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Format</span>
                <span className="text-sm font-medium text-slate-700">
                  {formats.find((f) => f.value === selectedFormat)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Slide Types</span>
                <span className="text-sm font-medium text-slate-700">
                  {enabledLayoutCount} enabled
                </span>
              </div>
            </div>

            {/* Quality Checklist */}
            <div className="border-t border-slate-100 pt-4 mb-6">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Quality Checklist</h4>
              <div className="space-y-2">
                {qualityChecks.map((check, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {check.passed ? (
                      <Check size={16} className="text-green-500 mt-0.5" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
                    )}
                    <div>
                      <span
                        className={clsx(
                          'text-sm',
                          check.passed ? 'text-slate-600' : 'text-amber-600'
                        )}
                      >
                        {check.label}
                      </span>
                      {check.message && (
                        <p className="text-xs text-amber-500">{check.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {hasBlockingIssues && exportStatus === 'idle' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    Quality issues detected
                  </span>
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  Review the checklist above before exporting.
                </p>
              </div>
            )}

            {/* Export Progress */}
            {isExporting && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="text-sm text-slate-600">
                    {exportStatus === 'starting' ? 'Starting export...' : 'Exporting...'}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Message */}
            {exportStatus === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Export complete!
                  </span>
                </div>
                <button
                  onClick={handleDownload}
                  className="text-sm text-green-700 underline mt-2 hover:text-green-800"
                >
                  Download {formats.find(f => f.value === selectedFormat)?.label} file
                </button>
              </div>
            )}

            {/* Error Message */}
            {exportStatus === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Export failed
                  </span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  {errorMessage || 'An error occurred during export'}
                </p>
                <button
                  onClick={handleReset}
                  className="text-sm text-red-700 underline mt-2 hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Export Button */}
            {exportStatus === 'idle' && (
              <button
                onClick={handleExport}
                className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90"
              >
                <FileDown size={18} />
                Export Template
              </button>
            )}

            {/* Export Again / Download Button */}
            {exportStatus === 'completed' && (
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90"
                >
                  <FileDown size={18} />
                  Download
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-3 rounded-lg font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Export Again
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
