/**
 * Export Tests - TESTING.md Acceptance Criteria
 * Tests for PPTX export functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PptxAdapter } from '../export/pptx-adapter';
import type { Template } from '@kova/shared';

describe('PPTX Export', () => {
  let adapter: PptxAdapter;
  let validTemplate: Template;

  beforeEach(() => {
    adapter = new PptxAdapter();
    validTemplate = {
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
            { id: 'subtitle', role: 'body', bounds: { x: 1, y: 3, w: 10, h: 1 } },
          ],
          enabled: true,
        },
        {
          name: 'Content',
          type: 'content',
          grid: { columns: 12, rows: 8, gutter: 16 },
          regions: [
            { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
            { id: 'content', role: 'body', bounds: { x: 1, y: 2, w: 10, h: 5 } },
          ],
          enabled: true,
        },
      ],
    };
  });

  describe('Adapter Capabilities', () => {
    it('should report correct format', () => {
      expect(adapter.format).toBe('pptx');
    });

    it('should support master slides', () => {
      expect(adapter.capabilities.supportsMasterSlides).toBe(true);
    });

    it('should support editable text', () => {
      expect(adapter.capabilities.supportsEditableText).toBe(true);
    });

    it('should support editable shapes', () => {
      expect(adapter.capabilities.supportsEditableShapes).toBe(true);
    });
  });

  describe('Template Validation', () => {
    it('should validate a correct template', async () => {
      const result = await adapter.validate(validTemplate);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject template with missing id', async () => {
      const invalidTemplate = { ...validTemplate, id: '' };
      const result = await adapter.validate(invalidTemplate);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template ID is required');
    });

    it('should reject template with title font size below minimum', async () => {
      const invalidTemplate = {
        ...validTemplate,
        typography: {
          ...validTemplate.typography,
          title: { ...validTemplate.typography.title, fontSize: 16 },
        },
      };
      const result = await adapter.validate(invalidTemplate);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Title font size'))).toBe(true);
    });

    it('should reject template with body font size below minimum', async () => {
      const invalidTemplate = {
        ...validTemplate,
        typography: {
          ...validTemplate.typography,
          body: { ...validTemplate.typography.body, fontSize: 10 },
        },
      };
      const result = await adapter.validate(invalidTemplate);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Body font size'))).toBe(true);
    });

    it('should reject template with invalid color format', async () => {
      const invalidTemplate = {
        ...validTemplate,
        tokens: {
          ...validTemplate.tokens,
          colors: {
            ...validTemplate.tokens.colors,
            primary: 'not-a-color',
          },
        },
      };
      const result = await adapter.validate(invalidTemplate);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid color format'))).toBe(true);
    });
  });

  describe('Export Generation', () => {
    it('should generate a PPTX buffer', async () => {
      const result = await adapter.export({ template: validTemplate, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.buffer!.length).toBeGreaterThan(0);
    });

    it('should generate correct number of slides', async () => {
      const result = await adapter.export({ template: validTemplate, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.metrics.slideCount).toBe(2); // 2 enabled layouts
    });

    it('should generate master slides for each layout', async () => {
      const result = await adapter.export({ template: validTemplate, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.metrics.masterSlideCount).toBe(2);
    });

    it('should handle font fallbacks and report warnings', async () => {
      const templateWithCustomFont = {
        ...validTemplate,
        typography: {
          title: { fontFamily: 'Custom Font', fontSize: 34, lineHeight: 1.1, weight: 600 },
          body: { fontFamily: 'Another Font', fontSize: 14, lineHeight: 1.4, weight: 400 },
        },
      };

      const result = await adapter.export({ template: templateWithCustomFont, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.warnings.some((w) => w.code === 'FONT_SUBSTITUTED')).toBe(true);
      expect(result.metrics.fontSubstitutions).toBeGreaterThan(0);
    });

    it('should complete export within performance target', async () => {
      // TESTING.md: Export under 30 seconds for PPTX
      const startTime = Date.now();

      const result = await adapter.export({ template: validTemplate, returnBuffer: true });

      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(30000); // 30 seconds
    });

    it('should generate valid PPTX file signature', async () => {
      const result = await adapter.export({ template: validTemplate, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();

      // PPTX files are ZIP files, which start with PK signature (0x50 0x4B)
      expect(result.buffer![0]).toBe(0x50); // 'P'
      expect(result.buffer![1]).toBe(0x4b); // 'K'
    });
  });

  describe('Error Handling', () => {
    it('should return failure for invalid template', async () => {
      const invalidTemplate = { ...validTemplate, layouts: [] };
      const result = await adapter.export({ template: invalidTemplate, returnBuffer: true });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should include metrics even on failure', async () => {
      const invalidTemplate = { ...validTemplate, id: '' };
      const result = await adapter.export({ template: invalidTemplate, returnBuffer: true });

      expect(result.metrics).toBeDefined();
      expect(result.metrics.startTime).toBeDefined();
      expect(result.metrics.endTime).toBeDefined();
    });
  });
});

describe('Export with Multiple Layouts', () => {
  it('should handle all 10 basic layout types', async () => {
    const adapter = new PptxAdapter();
    const allLayouts = [
      'title', 'section', 'agenda', 'content', 'media',
      'comparison', 'timeline', 'quote', 'data', 'appendix',
    ].map((type, i) => ({
      name: `${type} Slide`,
      type: type as any,
      grid: { columns: 12, rows: 6, gutter: 16 },
      regions: [
        { id: 'main', role: 'body' as const, bounds: { x: 1, y: 1, w: 10, h: 4 } },
      ],
      enabled: true,
    }));

    const template: Template = {
      id: 'full-template',
      name: 'Full Template',
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
      layouts: allLayouts,
    };

    const result = await adapter.export({ template, returnBuffer: true });

    expect(result.success).toBe(true);
    expect(result.metrics.slideCount).toBe(10);
    expect(result.metrics.masterSlideCount).toBe(10);
  });

  it('should handle all data visualization layout types', async () => {
    const adapter = new PptxAdapter();
    const dataVisualizationLayouts = [
      'data-bar-vertical',
      'data-bar-horizontal',
      'data-line',
      'data-pie',
      'data-donut',
      'data-scatter',
      'data-area',
      'data-stacked-bar',
    ].map((type) => ({
      name: `${type} Chart`,
      type: type as any,
      grid: { columns: 12, rows: 6, gutter: 16 },
      regions: [
        { id: 'header', role: 'header' as const, bounds: { x: 1, y: 0, w: 10, h: 1 } },
        { id: 'chart', role: 'body' as const, bounds: { x: 1, y: 1, w: 10, h: 4 } },
      ],
      enabled: true,
    }));

    const template: Template = {
      id: 'data-viz-template',
      name: 'Data Visualization Template',
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
      layouts: dataVisualizationLayouts,
    };

    const result = await adapter.export({ template, returnBuffer: true });

    expect(result.success).toBe(true);
    expect(result.metrics.slideCount).toBe(8);
    expect(result.metrics.masterSlideCount).toBe(8);
  });

  it('should handle iconography layout type', async () => {
    const adapter = new PptxAdapter();
    const template: Template = {
      id: 'iconography-template',
      name: 'Iconography Template',
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
          name: 'Iconography Slide',
          type: 'iconography' as any,
          grid: { columns: 12, rows: 6, gutter: 16 },
          regions: [
            { id: 'header', role: 'header' as const, bounds: { x: 1, y: 0, w: 10, h: 1 } },
            { id: 'icons', role: 'body' as const, bounds: { x: 1, y: 1, w: 10, h: 4 } },
          ],
          enabled: true,
        },
      ],
    };

    const result = await adapter.export({ template, returnBuffer: true });

    expect(result.success).toBe(true);
    expect(result.metrics.slideCount).toBe(1);
  });

  it('should handle mixed layout types including data visualizations', async () => {
    const adapter = new PptxAdapter();
    const mixedLayouts = [
      { name: 'Title', type: 'title' as any },
      { name: 'Content', type: 'content' as any },
      { name: 'Bar Chart', type: 'data-bar-vertical' as any },
      { name: 'Line Chart', type: 'data-line' as any },
      { name: 'Pie Chart', type: 'data-pie' as any },
      { name: 'Summary', type: 'appendix' as any },
    ].map((layout) => ({
      ...layout,
      grid: { columns: 12, rows: 6, gutter: 16 },
      regions: [
        { id: 'main', role: 'body' as const, bounds: { x: 1, y: 1, w: 10, h: 4 } },
      ],
      enabled: true,
    }));

    const template: Template = {
      id: 'mixed-template',
      name: 'Mixed Template',
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
      layouts: mixedLayouts,
    };

    const result = await adapter.export({ template, returnBuffer: true });

    expect(result.success).toBe(true);
    expect(result.metrics.slideCount).toBe(6);
  });
});
