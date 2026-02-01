/**
 * Comprehensive PPTX Adapter Tests
 * Extended tests for pptx-adapter.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PptxAdapter } from '../export/pptx-adapter';
import type { Template, Layout, LayoutType } from '@kova/shared';

describe('PptxAdapter', () => {
  let adapter: PptxAdapter;

  const createValidTemplate = (overrides?: Partial<Template>): Template => ({
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
    ],
    ...overrides,
  });

  beforeEach(() => {
    adapter = new PptxAdapter();
  });

  describe('constructor and properties', () => {
    it('should have format set to pptx', () => {
      expect(adapter.format).toBe('pptx');
    });

    it('should have correct capabilities', () => {
      expect(adapter.capabilities.supportsMasterSlides).toBe(true);
      expect(adapter.capabilities.supportsEditableText).toBe(true);
      expect(adapter.capabilities.supportsEditableShapes).toBe(true);
      expect(adapter.capabilities.supportsGradients).toBe(true);
      expect(adapter.capabilities.supportsCustomFonts).toBe(true);
      expect(adapter.capabilities.maxSlideCount).toBe(500);
    });
  });

  describe('validate', () => {
    it('should validate a correct template', async () => {
      const template = createValidTemplate();
      const result = await adapter.validate(template);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty template id', async () => {
      const template = createValidTemplate({ id: '' });
      const result = await adapter.validate(template);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template ID is required');
    });

    it('should reject missing template name', async () => {
      const template = createValidTemplate({ name: '' });
      const result = await adapter.validate(template);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template name is required');
    });

    it('should reject missing tokens', async () => {
      const template = createValidTemplate();
      // @ts-ignore - intentionally breaking type for test
      template.tokens = undefined;
      const result = await adapter.validate(template);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tokens are required');
    });

    it('should reject missing typography', async () => {
      const template = createValidTemplate();
      // @ts-ignore - intentionally breaking type for test
      template.typography = undefined;
      const result = await adapter.validate(template);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Typography is required');
    });

    it('should reject missing layouts', async () => {
      const template = createValidTemplate({ layouts: [] });
      const result = await adapter.validate(template);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one layout is required');
    });

    it('should reject title font size below 18pt', async () => {
      const template = createValidTemplate();
      template.typography.title.fontSize = 16;
      const result = await adapter.validate(template);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Title font size'))).toBe(true);
    });

    it('should reject body font size below 12pt', async () => {
      const template = createValidTemplate();
      template.typography.body.fontSize = 10;
      const result = await adapter.validate(template);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Body font size'))).toBe(true);
    });

    it('should reject invalid hex color format', async () => {
      const template = createValidTemplate();
      template.tokens.colors.primary = 'not-a-color';
      const result = await adapter.validate(template);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid color format'))).toBe(true);
    });

    it('should reject 3-digit hex color', async () => {
      const template = createValidTemplate();
      template.tokens.colors.primary = '#FFF';
      const result = await adapter.validate(template);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid color format'))).toBe(true);
    });

    it('should accept all valid color formats', async () => {
      const template = createValidTemplate();
      template.tokens.colors.primary = '#abcdef';
      template.tokens.colors.secondary = '#ABCDEF';
      template.tokens.colors.neutral = '#123456';
      const result = await adapter.validate(template);
      expect(result.valid).toBe(true);
    });
  });

  describe('export', () => {
    it('should generate a valid PPTX buffer', async () => {
      const template = createValidTemplate();
      const result = await adapter.export({ template, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.buffer!.length).toBeGreaterThan(0);
    });

    it('should have valid ZIP signature (PPTX is a ZIP file)', async () => {
      const template = createValidTemplate();
      const result = await adapter.export({ template, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.buffer![0]).toBe(0x50); // 'P'
      expect(result.buffer![1]).toBe(0x4b); // 'K'
    });

    it('should return correct slide count', async () => {
      const template = createValidTemplate();
      const result = await adapter.export({ template, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.metrics.slideCount).toBe(1);
    });

    it('should return correct master slide count', async () => {
      const template = createValidTemplate();
      const result = await adapter.export({ template, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.metrics.masterSlideCount).toBe(1);
    });

    it('should handle multiple layouts', async () => {
      const template = createValidTemplate({
        layouts: [
          {
            name: 'Title Slide',
            type: 'title',
            grid: { columns: 12, rows: 6, gutter: 16 },
            regions: [{ id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 2 } }],
            enabled: true,
          },
          {
            name: 'Content Slide',
            type: 'content',
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'content', role: 'body', bounds: { x: 1, y: 2, w: 10, h: 5 } },
            ],
            enabled: true,
          },
          {
            name: 'Media Slide',
            type: 'media',
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'media', role: 'media', bounds: { x: 1, y: 2, w: 10, h: 5 } },
            ],
            enabled: true,
          },
        ],
      });
      const result = await adapter.export({ template, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.metrics.slideCount).toBe(3);
      expect(result.metrics.masterSlideCount).toBe(3);
    });

    it('should skip disabled layouts', async () => {
      const template = createValidTemplate({
        layouts: [
          {
            name: 'Title Slide',
            type: 'title',
            grid: { columns: 12, rows: 6, gutter: 16 },
            regions: [{ id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 2 } }],
            enabled: true,
          },
          {
            name: 'Disabled Slide',
            type: 'content',
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [{ id: 'content', role: 'body', bounds: { x: 1, y: 1, w: 10, h: 5 } }],
            enabled: false,
          },
        ],
      });
      const result = await adapter.export({ template, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.metrics.slideCount).toBe(1);
    });

    it('should warn about font substitutions', async () => {
      const template = createValidTemplate();
      template.typography.title.fontFamily = 'Custom Brand Font';
      template.typography.body.fontFamily = 'Another Custom Font';

      const result = await adapter.export({ template, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.code === 'FONT_SUBSTITUTED')).toBe(true);
      expect(result.metrics.fontSubstitutions).toBeGreaterThan(0);
    });

    it('should not warn for known fonts', async () => {
      const template = createValidTemplate();
      template.typography.title.fontFamily = 'Arial';
      template.typography.body.fontFamily = 'Arial';

      const result = await adapter.export({ template, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.warnings.filter(w => w.code === 'FONT_SUBSTITUTED').length).toBe(0);
      expect(result.metrics.fontSubstitutions).toBe(0);
    });

    it('should include timing metrics', async () => {
      const template = createValidTemplate();
      const result = await adapter.export({ template, returnBuffer: true });

      expect(result.success).toBe(true);
      expect(result.metrics.startTime).toBeDefined();
      expect(result.metrics.endTime).toBeDefined();
      expect(result.metrics.endTime).toBeGreaterThanOrEqual(result.metrics.startTime);
    });

    it('should fail fast for invalid template', async () => {
      const template = createValidTemplate({ id: '' });
      const result = await adapter.export({ template, returnBuffer: true });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('VALIDATION_ERROR');
    });

    it('should include metrics even on failure', async () => {
      const template = createValidTemplate({ id: '' });
      const result = await adapter.export({ template, returnBuffer: true });

      expect(result.success).toBe(false);
      expect(result.metrics).toBeDefined();
      expect(result.metrics.startTime).toBeDefined();
      expect(result.metrics.endTime).toBeDefined();
    });
  });

  describe('layout types', () => {
    const layoutTypes: LayoutType[] = [
      'title', 'section', 'agenda', 'content', 'media',
      'comparison', 'timeline', 'quote', 'data', 'appendix'
    ];

    for (const layoutType of layoutTypes) {
      it(`should handle ${layoutType} layout type`, async () => {
        const template = createValidTemplate({
          layouts: [
            {
              name: `${layoutType} Slide`,
              type: layoutType,
              grid: { columns: 12, rows: 6, gutter: 16 },
              regions: [
                { id: 'main', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 2 } },
                { id: 'content', role: 'body', bounds: { x: 1, y: 3, w: 10, h: 3 } },
              ],
              enabled: true,
            },
          ],
        });

        const result = await adapter.export({ template, returnBuffer: true });
        expect(result.success).toBe(true);
      });
    }
  });

  describe('region roles', () => {
    it('should handle header region', async () => {
      const template = createValidTemplate({
        layouts: [{
          name: 'Test',
          type: 'content',
          grid: { columns: 12, rows: 6, gutter: 16 },
          regions: [{ id: 'header', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } }],
          enabled: true,
        }],
      });
      const result = await adapter.export({ template, returnBuffer: true });
      expect(result.success).toBe(true);
    });

    it('should handle body region', async () => {
      const template = createValidTemplate({
        layouts: [{
          name: 'Test',
          type: 'content',
          grid: { columns: 12, rows: 6, gutter: 16 },
          regions: [{ id: 'body', role: 'body', bounds: { x: 1, y: 1, w: 10, h: 4 } }],
          enabled: true,
        }],
      });
      const result = await adapter.export({ template, returnBuffer: true });
      expect(result.success).toBe(true);
    });

    it('should handle media region', async () => {
      const template = createValidTemplate({
        layouts: [{
          name: 'Test',
          type: 'media',
          grid: { columns: 12, rows: 6, gutter: 16 },
          regions: [{ id: 'media', role: 'media', bounds: { x: 1, y: 1, w: 10, h: 4 } }],
          enabled: true,
        }],
      });
      const result = await adapter.export({ template, returnBuffer: true });
      expect(result.success).toBe(true);
    });

    it('should handle caption region', async () => {
      const template = createValidTemplate({
        layouts: [{
          name: 'Test',
          type: 'media',
          grid: { columns: 12, rows: 6, gutter: 16 },
          regions: [
            { id: 'media', role: 'media', bounds: { x: 1, y: 1, w: 10, h: 4 } },
            { id: 'caption', role: 'caption', bounds: { x: 1, y: 5, w: 10, h: 1 } },
          ],
          enabled: true,
        }],
      });
      const result = await adapter.export({ template, returnBuffer: true });
      expect(result.success).toBe(true);
    });
  });

  describe('accents', () => {
    it('should handle template with line accent', async () => {
      const template = createValidTemplate({
        accents: [{ id: 'line-1', type: 'line' }],
      });
      const result = await adapter.export({ template, returnBuffer: true });
      expect(result.success).toBe(true);
    });

    it('should handle template with shape accent', async () => {
      const template = createValidTemplate({
        accents: [{ id: 'shape-1', type: 'shape' }],
      });
      const result = await adapter.export({ template, returnBuffer: true });
      expect(result.success).toBe(true);
    });

    it('should handle template with multiple accents', async () => {
      const template = createValidTemplate({
        accents: [
          { id: 'line-1', type: 'line' },
          { id: 'shape-1', type: 'shape' },
          { id: 'gradient-1', type: 'gradient' },
        ],
      });
      const result = await adapter.export({ template, returnBuffer: true });
      expect(result.success).toBe(true);
    });
  });

  describe('performance', () => {
    it('should complete export within 30 seconds', async () => {
      const template = createValidTemplate();
      const startTime = Date.now();
      const result = await adapter.export({ template, returnBuffer: true });
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(30000);
    });

    it('should handle large number of layouts efficiently', async () => {
      const layouts = Array.from({ length: 10 }, (_, i) => ({
        name: `Layout ${i}`,
        type: ['title', 'content', 'media', 'section', 'agenda'][i % 5] as LayoutType,
        grid: { columns: 12, rows: 6, gutter: 16 },
        regions: [
          { id: `header-${i}`, role: 'header' as const, bounds: { x: 1, y: 0, w: 10, h: 1 } },
          { id: `body-${i}`, role: 'body' as const, bounds: { x: 1, y: 2, w: 10, h: 4 } },
        ],
        enabled: true,
      }));

      const template = createValidTemplate({ layouts });
      const startTime = Date.now();
      const result = await adapter.export({ template, returnBuffer: true });
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.metrics.slideCount).toBe(10);
      expect(duration).toBeLessThan(30000);
    });
  });
});
