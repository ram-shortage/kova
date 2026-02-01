/**
 * Comprehensive Export Adapter Tests
 * Tests for adapter.ts functions
 */

import { describe, it, expect } from 'vitest';
import {
  resolveFontFallback,
  defaultFontFallbacks,
  type FontFallback,
  type ExportResult,
  type ExportWarning,
  type ExportError,
  type ExportMetrics,
  type ExportOptions,
  type AdapterCapabilities,
} from '../export/adapter';

describe('resolveFontFallback', () => {
  describe('known fonts', () => {
    it('should return Arial for Arial on pptx', () => {
      const result = resolveFontFallback('Arial', 'pptx');
      expect(result).toBe('Arial');
    });

    it('should return Arial for Helvetica on pptx', () => {
      const result = resolveFontFallback('Helvetica', 'pptx');
      expect(result).toBe('Arial');
    });

    it('should return Calibri for Avenir Next on pptx', () => {
      const result = resolveFontFallback('Avenir Next', 'pptx');
      expect(result).toBe('Calibri');
    });

    it('should return Segoe UI for SF Pro Display on pptx', () => {
      const result = resolveFontFallback('SF Pro Display', 'pptx');
      expect(result).toBe('Segoe UI');
    });

    it('should return Georgia for Georgia on pptx', () => {
      const result = resolveFontFallback('Georgia', 'pptx');
      expect(result).toBe('Georgia');
    });

    it('should return Times New Roman for Times New Roman on pptx', () => {
      const result = resolveFontFallback('Times New Roman', 'pptx');
      expect(result).toBe('Times New Roman');
    });
  });

  describe('case insensitivity', () => {
    it('should handle lowercase font names', () => {
      const result = resolveFontFallback('arial', 'pptx');
      expect(result).toBe('Arial');
    });

    it('should handle uppercase font names', () => {
      const result = resolveFontFallback('ARIAL', 'pptx');
      expect(result).toBe('Arial');
    });

    it('should handle mixed case font names', () => {
      const result = resolveFontFallback('AvEnIr NeXt', 'pptx');
      expect(result).toBe('Calibri');
    });
  });

  describe('unknown fonts', () => {
    it('should return Arial for unknown font', () => {
      const result = resolveFontFallback('Custom Brand Font', 'pptx');
      expect(result).toBe('Arial');
    });

    it('should return Arial for empty string', () => {
      const result = resolveFontFallback('', 'pptx');
      expect(result).toBe('Arial');
    });

    it('should return Arial for numeric font name', () => {
      const result = resolveFontFallback('12345', 'pptx');
      expect(result).toBe('Arial');
    });
  });

  describe('different platforms', () => {
    it('should return Arial for pptx platform with mapped font', () => {
      const result = resolveFontFallback('Helvetica', 'pptx');
      expect(result).toBe('Arial'); // Helvetica maps to Arial
    });

    it('should return fallback for pptx platform with unmapped font', () => {
      const result = resolveFontFallback('CustomFont', 'pptx');
      expect(result).toBe('Arial'); // Falls back to default
    });
  });
});

describe('defaultFontFallbacks', () => {
  it('should be an array', () => {
    expect(Array.isArray(defaultFontFallbacks)).toBe(true);
  });

  it('should have at least 6 entries', () => {
    expect(defaultFontFallbacks.length).toBeGreaterThanOrEqual(6);
  });

  it('should have proper structure for each fallback', () => {
    for (const fallback of defaultFontFallbacks) {
      expect(fallback).toHaveProperty('original');
      expect(fallback).toHaveProperty('fallback');
      expect(fallback).toHaveProperty('platform');
      expect(typeof fallback.original).toBe('string');
      expect(typeof fallback.fallback).toBe('string');
      expect(['pptx', 'keynote', 'gslides']).toContain(fallback.platform);
    }
  });

  it('should include Arial mapping', () => {
    const arialMapping = defaultFontFallbacks.find(f => f.original === 'Arial');
    expect(arialMapping).toBeDefined();
    expect(arialMapping?.fallback).toBe('Arial');
  });

  it('should include Helvetica to Arial mapping', () => {
    const helveticaMapping = defaultFontFallbacks.find(f => f.original === 'Helvetica');
    expect(helveticaMapping).toBeDefined();
    expect(helveticaMapping?.fallback).toBe('Arial');
  });
});

describe('Type Exports', () => {
  it('should export ExportResult interface correctly', () => {
    const result: ExportResult = {
      success: true,
      buffer: Buffer.from('test'),
      warnings: [],
      errors: [],
      metrics: {
        startTime: Date.now(),
        endTime: Date.now(),
        slideCount: 0,
        masterSlideCount: 0,
        fontSubstitutions: 0,
      },
    };
    expect(result.success).toBe(true);
  });

  it('should export ExportWarning interface correctly', () => {
    const warning: ExportWarning = {
      code: 'TEST_WARNING',
      message: 'Test warning message',
      severity: 'low',
    };
    expect(['low', 'medium', 'high']).toContain(warning.severity);
  });

  it('should export ExportError interface correctly', () => {
    const error: ExportError = {
      code: 'TEST_ERROR',
      message: 'Test error message',
      recoverable: false,
    };
    expect(typeof error.recoverable).toBe('boolean');
  });

  it('should export ExportMetrics interface correctly', () => {
    const metrics: ExportMetrics = {
      startTime: Date.now(),
      endTime: Date.now(),
      slideCount: 10,
      masterSlideCount: 5,
      fontSubstitutions: 2,
    };
    expect(metrics.slideCount).toBe(10);
  });

  it('should export AdapterCapabilities interface correctly', () => {
    const capabilities: AdapterCapabilities = {
      supportsMasterSlides: true,
      supportsEditableText: true,
      supportsEditableShapes: true,
      supportsGradients: false,
      supportsCustomFonts: true,
      maxSlideCount: 100,
    };
    expect(capabilities.maxSlideCount).toBe(100);
  });
});
