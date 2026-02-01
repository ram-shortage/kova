/**
 * Export Adapter Interface
 * Abstract base for PPTX, Keynote, and Google Slides export
 */

import type { Template, ExportFormat, Layout } from '@kova/shared';

export interface ExportResult {
  success: boolean;
  buffer?: Buffer;
  filePath?: string;
  warnings: ExportWarning[];
  errors: ExportError[];
  metrics: ExportMetrics;
}

export interface ExportWarning {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ExportError {
  code: string;
  message: string;
  recoverable: boolean;
}

export interface ExportMetrics {
  startTime: number;
  endTime: number;
  slideCount: number;
  masterSlideCount: number;
  fontSubstitutions: number;
}

export interface ExportOptions {
  template: Template;
  outputPath?: string;
  returnBuffer?: boolean;
}

export interface AdapterCapabilities {
  supportsMasterSlides: boolean;
  supportsEditableText: boolean;
  supportsEditableShapes: boolean;
  supportsGradients: boolean;
  supportsCustomFonts: boolean;
  maxSlideCount: number;
}

export interface IExportAdapter {
  readonly format: ExportFormat;
  readonly capabilities: AdapterCapabilities;

  export(options: ExportOptions): Promise<ExportResult>;
  validate(template: Template): Promise<{ valid: boolean; errors: string[] }>;
}

// Font fallback resolver
export interface FontFallback {
  original: string;
  fallback: string;
  platform: 'pptx';
}

export const defaultFontFallbacks: FontFallback[] = [
  { original: 'Arial', fallback: 'Arial', platform: 'pptx' },
  { original: 'Helvetica', fallback: 'Arial', platform: 'pptx' },
  { original: 'Avenir Next', fallback: 'Calibri', platform: 'pptx' },
  { original: 'SF Pro Display', fallback: 'Segoe UI', platform: 'pptx' },
  { original: 'Georgia', fallback: 'Georgia', platform: 'pptx' },
  { original: 'Times New Roman', fallback: 'Times New Roman', platform: 'pptx' },
];

export function resolveFontFallback(
  fontFamily: string,
  platform: ExportFormat
): string {
  const fallback = defaultFontFallbacks.find(
    (f) => f.original.toLowerCase() === fontFamily.toLowerCase() && f.platform === platform
  );
  return fallback?.fallback || 'Arial';
}
