/**
 * Validation Tests - TESTING.md Acceptance Criteria
 * Tests for brand setup, contrast, typography, and spacing validation
 */

import { describe, it, expect } from 'vitest';
import {
  templateSchema,
  tokensSchema,
  typographySchema,
  layoutSchema,
  chartTypeSchema,
  layoutTypeSchema,
  exportFormatSchema,
} from '../validation/schema';
import {
  calculateContrastRatio,
  validateColorContrast,
  WCAG_AA_NORMAL_TEXT,
  meetsWcagAA,
} from '../validation/contrast';

describe('Brand Setup Validation', () => {
  describe('Color Validation', () => {
    it('should accept valid hex colors', () => {
      const result = tokensSchema.safeParse({
        colors: {
          primary: '#0A2A43',
          secondary: '#3D6B82',
          neutral: '#2B2B2B',
          background: '#FFFFFF',
          accent: '#E1A73B',
        },
        spacing: { base: 4, m: 12, l: 24 },
        radius: { sm: 2, md: 6, lg: 12 },
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      const result = tokensSchema.safeParse({
        colors: {
          primary: 'not-a-color',
          secondary: '#3D6B82',
          neutral: '#2B2B2B',
          background: '#FFFFFF',
          accent: '#E1A73B',
        },
        spacing: { base: 4, m: 12, l: 24 },
        radius: { sm: 2, md: 6, lg: 12 },
      });

      expect(result.success).toBe(false);
    });

    it('should reject 3-digit hex colors', () => {
      const result = tokensSchema.safeParse({
        colors: {
          primary: '#FFF', // Should be #FFFFFF
          secondary: '#3D6B82',
          neutral: '#2B2B2B',
          background: '#FFFFFF',
          accent: '#E1A73B',
        },
        spacing: { base: 4, m: 12, l: 24 },
        radius: { sm: 2, md: 6, lg: 12 },
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Font Size Validation', () => {
    it('should accept valid font sizes (title >= 18pt, body >= 12pt)', () => {
      const result = typographySchema.safeParse({
        title: {
          fontFamily: 'Arial',
          fontSize: 34,
          lineHeight: 1.1,
          weight: 600,
        },
        body: {
          fontFamily: 'Arial',
          fontSize: 14,
          lineHeight: 1.4,
          weight: 400,
        },
      });

      expect(result.success).toBe(true);
    });

    it('should reject title font size below 18pt', () => {
      const result = typographySchema.safeParse({
        title: {
          fontFamily: 'Arial',
          fontSize: 16, // Below 18pt minimum
          lineHeight: 1.1,
          weight: 600,
        },
        body: {
          fontFamily: 'Arial',
          fontSize: 14,
          lineHeight: 1.4,
          weight: 400,
        },
      });

      expect(result.success).toBe(false);
    });

    it('should reject body font size below 12pt', () => {
      const result = typographySchema.safeParse({
        title: {
          fontFamily: 'Arial',
          fontSize: 34,
          lineHeight: 1.1,
          weight: 600,
        },
        body: {
          fontFamily: 'Arial',
          fontSize: 10, // Below 12pt minimum
          lineHeight: 1.4,
          weight: 400,
        },
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Spacing Validation', () => {
    it('should accept valid spacing values', () => {
      const result = tokensSchema.safeParse({
        colors: {
          primary: '#0A2A43',
          secondary: '#3D6B82',
          neutral: '#2B2B2B',
          background: '#FFFFFF',
          accent: '#E1A73B',
        },
        spacing: { base: 4, m: 12, l: 24 },
        radius: { sm: 2, md: 6, lg: 12 },
      });

      expect(result.success).toBe(true);
    });

    it('should reject base spacing below minimum', () => {
      const result = tokensSchema.safeParse({
        colors: {
          primary: '#0A2A43',
          secondary: '#3D6B82',
          neutral: '#2B2B2B',
          background: '#FFFFFF',
          accent: '#E1A73B',
        },
        spacing: { base: 1, m: 12, l: 24 }, // base < 2
        radius: { sm: 2, md: 6, lg: 12 },
      });

      expect(result.success).toBe(false);
    });
  });
});

describe('Contrast Validation (WCAG AA)', () => {
  it('should calculate correct contrast ratio for black on white', () => {
    const ratio = calculateContrastRatio('#000000', '#FFFFFF');
    expect(ratio).toBeCloseTo(21, 0); // Black on white = 21:1
  });

  it('should calculate correct contrast ratio for similar colors', () => {
    const ratio = calculateContrastRatio('#777777', '#888888');
    expect(ratio).toBeLessThan(WCAG_AA_NORMAL_TEXT); // Should fail WCAG AA
  });

  it('should pass WCAG AA for high contrast combinations', () => {
    expect(meetsWcagAA('#000000', '#FFFFFF')).toBe(true);
    expect(meetsWcagAA('#0A2A43', '#FFFFFF')).toBe(true);
  });

  it('should fail WCAG AA for low contrast combinations', () => {
    expect(meetsWcagAA('#CCCCCC', '#FFFFFF')).toBe(false);
    expect(meetsWcagAA('#777777', '#888888')).toBe(false);
  });

  it('should identify contrast issues in color palette', () => {
    const issues = validateColorContrast({
      primary: '#CCCCCC', // Low contrast on white
      secondary: '#3D6B82',
      neutral: '#2B2B2B',
      background: '#FFFFFF',
      accent: '#E1A73B',
    });

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.context.includes('Primary'))).toBe(true);
  });

  it('should pass with good contrast palette', () => {
    const issues = validateColorContrast({
      primary: '#0A2A43',
      secondary: '#3D6B82',
      neutral: '#2B2B2B',
      background: '#FFFFFF',
      accent: '#B8860B', // Darker gold for better contrast
    });

    // Only accent might have issues (large text threshold is lower)
    const criticalIssues = issues.filter((i) => !i.context.includes('Accent'));
    expect(criticalIssues.length).toBe(0);
  });
});

describe('Layout Validation', () => {
  it('should accept valid layout with all required fields', () => {
    const result = layoutSchema.safeParse({
      name: 'Title Slide',
      type: 'title',
      grid: { columns: 12, rows: 6, gutter: 16 },
      regions: [
        { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 2 } },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('should reject layout with invalid type', () => {
    const result = layoutSchema.safeParse({
      name: 'Invalid Slide',
      type: 'invalid-type',
      grid: { columns: 12, rows: 6, gutter: 16 },
      regions: [
        { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 2 } },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('should reject layout with no regions', () => {
    const result = layoutSchema.safeParse({
      name: 'Empty Slide',
      type: 'title',
      grid: { columns: 12, rows: 6, gutter: 16 },
      regions: [],
    });

    expect(result.success).toBe(false);
  });

  it('should accept all 10 layout types', () => {
    const types = [
      'title',
      'section',
      'agenda',
      'content',
      'media',
      'comparison',
      'timeline',
      'quote',
      'data',
      'appendix',
    ];

    for (const type of types) {
      const result = layoutSchema.safeParse({
        name: `${type} Slide`,
        type,
        grid: { columns: 12, rows: 6, gutter: 16 },
        regions: [
          { id: 'main', role: 'body', bounds: { x: 1, y: 1, w: 10, h: 4 } },
        ],
      });

      expect(result.success).toBe(true);
    }
  });

  it('should accept all data visualization layout types', () => {
    const dataTypes = [
      'data-bar-vertical',
      'data-bar-horizontal',
      'data-line',
      'data-pie',
      'data-donut',
      'data-scatter',
      'data-area',
      'data-stacked-bar',
    ];

    for (const type of dataTypes) {
      const result = layoutSchema.safeParse({
        name: `${type} Slide`,
        type,
        grid: { columns: 12, rows: 6, gutter: 16 },
        regions: [
          { id: 'chart', role: 'body', bounds: { x: 1, y: 1, w: 10, h: 4 } },
        ],
      });

      expect(result.success).toBe(true);
    }
  });

  it('should accept iconography layout type', () => {
    const result = layoutSchema.safeParse({
      name: 'Iconography Slide',
      type: 'iconography',
      grid: { columns: 12, rows: 6, gutter: 16 },
      regions: [
        { id: 'icons', role: 'body', bounds: { x: 1, y: 1, w: 10, h: 4 } },
      ],
    });

    expect(result.success).toBe(true);
  });
});

describe('Chart Type Validation', () => {
  it('should accept all valid chart types', () => {
    const chartTypes = [
      'bar-vertical',
      'bar-horizontal',
      'line',
      'pie',
      'donut',
      'scatter',
      'area',
      'stacked-bar',
    ];

    for (const type of chartTypes) {
      const result = chartTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid chart types', () => {
    const invalidTypes = ['histogram', 'bubble', 'radar', 'funnel'];

    for (const type of invalidTypes) {
      const result = chartTypeSchema.safeParse(type);
      expect(result.success).toBe(false);
    }
  });
});

describe('Layout Type Validation', () => {
  it('should accept all valid layout types including data visualizations', () => {
    const allLayoutTypes = [
      'title',
      'section',
      'agenda',
      'content',
      'media',
      'comparison',
      'timeline',
      'quote',
      'data',
      'data-bar-vertical',
      'data-bar-horizontal',
      'data-line',
      'data-pie',
      'data-donut',
      'data-scatter',
      'data-area',
      'data-stacked-bar',
      'iconography',
      'appendix',
    ];

    for (const type of allLayoutTypes) {
      const result = layoutTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid layout types', () => {
    const invalidTypes = ['graph', 'table-only', 'photo-grid', 'unknown'];

    for (const type of invalidTypes) {
      const result = layoutTypeSchema.safeParse(type);
      expect(result.success).toBe(false);
    }
  });
});

describe('Export Format Validation', () => {
  it('should accept pptx format', () => {
    const result = exportFormatSchema.safeParse('pptx');
    expect(result.success).toBe(true);
  });

  it('should reject unsupported formats', () => {
    const unsupportedFormats = ['keynote', 'gslides', 'pdf', 'html'];

    for (const format of unsupportedFormats) {
      const result = exportFormatSchema.safeParse(format);
      expect(result.success).toBe(false);
    }
  });
});

describe('Complete Template Validation', () => {
  const validTemplate = {
    id: 'test-template',
    name: 'Test Template',
    version: '1.0.0',
    tokens: {
      colors: {
        primary: '#0A2A43',
        secondary: '#3D6B82',
        neutral: '#2B2B2B',
        background: '#FFFFFF',
        accent: '#E1A73B',
      },
      spacing: { base: 4, m: 12, l: 24 },
      radius: { sm: 2, md: 6, lg: 12 },
    },
    typography: {
      title: { fontFamily: 'Arial', fontSize: 34, lineHeight: 1.1, weight: 600 },
      body: { fontFamily: 'Arial', fontSize: 14, lineHeight: 1.4, weight: 400 },
    },
    layouts: [
      {
        name: 'Title Slide',
        type: 'title',
        grid: { columns: 12, rows: 6, gutter: 16 },
        regions: [
          { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 2 } },
        ],
      },
    ],
  };

  it('should accept a valid complete template', () => {
    const result = templateSchema.safeParse(validTemplate);
    expect(result.success).toBe(true);
  });

  it('should reject template without required id', () => {
    const { id, ...templateWithoutId } = validTemplate;
    const result = templateSchema.safeParse(templateWithoutId);
    expect(result.success).toBe(false);
  });

  it('should reject template without layouts', () => {
    const { layouts, ...templateWithoutLayouts } = validTemplate;
    const result = templateSchema.safeParse(templateWithoutLayouts);
    expect(result.success).toBe(false);
  });
});
