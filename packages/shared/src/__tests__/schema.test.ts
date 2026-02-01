/**
 * Comprehensive Schema Validation Tests
 * Tests for all Zod schemas in schema.ts
 */

import { describe, it, expect } from 'vitest';
import {
  tokenColorsSchema,
  tokenSpacingSchema,
  tokenRadiusSchema,
  tokensSchema,
  titleTypographyStyleSchema,
  bodyTypographyStyleSchema,
  typographySchema,
  regionBoundsSchema,
  regionRoleSchema,
  regionSchema,
  layoutTypeSchema,
  contentTypeSchema,
  layoutRulesSchema,
  gridConfigSchema,
  layoutSchema,
  accentTypeSchema,
  accentSchema,
  exportFormatSchema,
  exportProfileSchema,
  templateSchema,
  styleFamilySchema,
  moodPresetSchema,
  templateStateSchema,
  validateTemplate,
  validateTemplateState,
} from '../validation/schema';

describe('tokenColorsSchema', () => {
  const validColors = {
    primary: '#0A2A43',
    secondary: '#3D6B82',
    neutral: '#2B2B2B',
    background: '#FFFFFF',
    accent: '#E1A73B',
  };

  it('should accept valid hex colors', () => {
    const result = tokenColorsSchema.safeParse(validColors);
    expect(result.success).toBe(true);
  });

  it('should reject invalid hex color', () => {
    const result = tokenColorsSchema.safeParse({ ...validColors, primary: 'not-valid' });
    expect(result.success).toBe(false);
  });

  it('should reject 3-digit hex', () => {
    const result = tokenColorsSchema.safeParse({ ...validColors, primary: '#FFF' });
    expect(result.success).toBe(false);
  });

  it('should reject 8-digit hex (with alpha)', () => {
    const result = tokenColorsSchema.safeParse({ ...validColors, primary: '#FFFFFFFF' });
    expect(result.success).toBe(false);
  });

  it('should reject missing hash', () => {
    const result = tokenColorsSchema.safeParse({ ...validColors, primary: 'FFFFFF' });
    expect(result.success).toBe(false);
  });

  it('should accept lowercase hex', () => {
    const result = tokenColorsSchema.safeParse({ ...validColors, primary: '#ffffff' });
    expect(result.success).toBe(true);
  });

  it('should reject missing required color', () => {
    const { accent, ...missingAccent } = validColors;
    const result = tokenColorsSchema.safeParse(missingAccent);
    expect(result.success).toBe(false);
  });
});

describe('tokenSpacingSchema', () => {
  it('should accept valid spacing', () => {
    const result = tokenSpacingSchema.safeParse({ base: 4, m: 12, l: 24 });
    expect(result.success).toBe(true);
  });

  it('should reject base below minimum', () => {
    const result = tokenSpacingSchema.safeParse({ base: 1, m: 12, l: 24 });
    expect(result.success).toBe(false);
  });

  it('should accept base at minimum', () => {
    const result = tokenSpacingSchema.safeParse({ base: 2, m: 8, l: 16 });
    expect(result.success).toBe(true);
  });

  it('should reject m below minimum', () => {
    const result = tokenSpacingSchema.safeParse({ base: 4, m: 7, l: 24 });
    expect(result.success).toBe(false);
  });

  it('should reject l below minimum', () => {
    const result = tokenSpacingSchema.safeParse({ base: 4, m: 12, l: 15 });
    expect(result.success).toBe(false);
  });

  it('should reject negative values', () => {
    const result = tokenSpacingSchema.safeParse({ base: -4, m: 12, l: 24 });
    expect(result.success).toBe(false);
  });
});

describe('tokenRadiusSchema', () => {
  it('should accept valid radius values', () => {
    const result = tokenRadiusSchema.safeParse({ sm: 2, md: 6, lg: 12 });
    expect(result.success).toBe(true);
  });

  it('should accept zero values', () => {
    const result = tokenRadiusSchema.safeParse({ sm: 0, md: 0, lg: 0 });
    expect(result.success).toBe(true);
  });

  it('should reject negative values', () => {
    const result = tokenRadiusSchema.safeParse({ sm: -1, md: 6, lg: 12 });
    expect(result.success).toBe(false);
  });
});

describe('titleTypographyStyleSchema', () => {
  const validTitle = {
    fontFamily: 'Arial',
    fontSize: 34,
    lineHeight: 1.1,
    weight: 600,
  };

  it('should accept valid title typography', () => {
    const result = titleTypographyStyleSchema.safeParse(validTitle);
    expect(result.success).toBe(true);
  });

  it('should reject fontSize below 18pt', () => {
    const result = titleTypographyStyleSchema.safeParse({ ...validTitle, fontSize: 17 });
    expect(result.success).toBe(false);
  });

  it('should accept fontSize at 18pt minimum', () => {
    const result = titleTypographyStyleSchema.safeParse({ ...validTitle, fontSize: 18 });
    expect(result.success).toBe(true);
  });

  it('should reject empty font family', () => {
    const result = titleTypographyStyleSchema.safeParse({ ...validTitle, fontFamily: '' });
    expect(result.success).toBe(false);
  });

  it('should reject lineHeight below 1', () => {
    const result = titleTypographyStyleSchema.safeParse({ ...validTitle, lineHeight: 0.9 });
    expect(result.success).toBe(false);
  });

  it('should reject weight below 100', () => {
    const result = titleTypographyStyleSchema.safeParse({ ...validTitle, weight: 50 });
    expect(result.success).toBe(false);
  });

  it('should reject weight above 900', () => {
    const result = titleTypographyStyleSchema.safeParse({ ...validTitle, weight: 950 });
    expect(result.success).toBe(false);
  });
});

describe('bodyTypographyStyleSchema', () => {
  const validBody = {
    fontFamily: 'Arial',
    fontSize: 14,
    lineHeight: 1.4,
    weight: 400,
  };

  it('should accept valid body typography', () => {
    const result = bodyTypographyStyleSchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });

  it('should reject fontSize below 12pt', () => {
    const result = bodyTypographyStyleSchema.safeParse({ ...validBody, fontSize: 11 });
    expect(result.success).toBe(false);
  });

  it('should accept fontSize at 12pt minimum', () => {
    const result = bodyTypographyStyleSchema.safeParse({ ...validBody, fontSize: 12 });
    expect(result.success).toBe(true);
  });
});

describe('regionBoundsSchema', () => {
  it('should accept valid bounds', () => {
    const result = regionBoundsSchema.safeParse({ x: 1, y: 1, w: 10, h: 2 });
    expect(result.success).toBe(true);
  });

  it('should accept zero positions', () => {
    const result = regionBoundsSchema.safeParse({ x: 0, y: 0, w: 12, h: 6 });
    expect(result.success).toBe(true);
  });

  it('should reject negative x', () => {
    const result = regionBoundsSchema.safeParse({ x: -1, y: 1, w: 10, h: 2 });
    expect(result.success).toBe(false);
  });

  it('should reject negative width', () => {
    const result = regionBoundsSchema.safeParse({ x: 1, y: 1, w: -10, h: 2 });
    expect(result.success).toBe(false);
  });
});

describe('regionRoleSchema', () => {
  it('should accept all valid roles', () => {
    const roles = ['header', 'body', 'footer', 'media', 'caption'];
    for (const role of roles) {
      const result = regionRoleSchema.safeParse(role);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid role', () => {
    const result = regionRoleSchema.safeParse('invalid');
    expect(result.success).toBe(false);
  });
});

describe('layoutTypeSchema', () => {
  const validTypes = [
    'title', 'section', 'agenda', 'content', 'media',
    'comparison', 'timeline', 'quote', 'data', 'appendix'
  ];

  it('should accept all 10 valid layout types', () => {
    for (const type of validTypes) {
      const result = layoutTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid type', () => {
    const result = layoutTypeSchema.safeParse('custom');
    expect(result.success).toBe(false);
  });
});

describe('gridConfigSchema', () => {
  it('should accept valid grid config', () => {
    const result = gridConfigSchema.safeParse({ columns: 12, rows: 6, gutter: 16 });
    expect(result.success).toBe(true);
  });

  it('should reject zero columns', () => {
    const result = gridConfigSchema.safeParse({ columns: 0, rows: 6, gutter: 16 });
    expect(result.success).toBe(false);
  });

  it('should reject negative gutter', () => {
    const result = gridConfigSchema.safeParse({ columns: 12, rows: 6, gutter: -1 });
    expect(result.success).toBe(false);
  });

  it('should accept zero gutter', () => {
    const result = gridConfigSchema.safeParse({ columns: 12, rows: 6, gutter: 0 });
    expect(result.success).toBe(true);
  });
});

describe('layoutSchema', () => {
  const validLayout = {
    name: 'Title Slide',
    type: 'title',
    grid: { columns: 12, rows: 6, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 2 } },
    ],
  };

  it('should accept valid layout', () => {
    const result = layoutSchema.safeParse(validLayout);
    expect(result.success).toBe(true);
  });

  it('should reject layout with no regions', () => {
    const result = layoutSchema.safeParse({ ...validLayout, regions: [] });
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const result = layoutSchema.safeParse({ ...validLayout, name: '' });
    expect(result.success).toBe(false);
  });

  it('should accept optional rules', () => {
    const result = layoutSchema.safeParse({
      ...validLayout,
      rules: { minFontSize: 14, maxLineCount: 10, contentTypes: ['text', 'image'] },
    });
    expect(result.success).toBe(true);
  });

  it('should default enabled to true', () => {
    const result = layoutSchema.safeParse(validLayout);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enabled).toBe(true);
    }
  });

  it('should accept explicit enabled value', () => {
    const result = layoutSchema.safeParse({ ...validLayout, enabled: false });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enabled).toBe(false);
    }
  });
});

describe('accentSchema', () => {
  it('should accept valid accent', () => {
    const result = accentSchema.safeParse({ id: 'accent-1', type: 'shape' });
    expect(result.success).toBe(true);
  });

  it('should accept all accent types', () => {
    const types = ['shape', 'line', 'pattern', 'gradient', 'iconSet'];
    for (const type of types) {
      const result = accentSchema.safeParse({ id: 'accent-1', type });
      expect(result.success).toBe(true);
    }
  });

  it('should accept optional props', () => {
    const result = accentSchema.safeParse({
      id: 'accent-1',
      type: 'shape',
      props: { color: '#FF0000', size: 100 },
    });
    expect(result.success).toBe(true);
  });
});

describe('exportProfileSchema', () => {
  it('should accept valid export profile', () => {
    const result = exportProfileSchema.safeParse({
      format: 'pptx',
      fontFallbacks: { 'Custom Font': 'Arial' },
    });
    expect(result.success).toBe(true);
  });

  it('should accept all export formats', () => {
    for (const format of ['pptx']) {
      const result = exportProfileSchema.safeParse({
        format,
        fontFallbacks: {},
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('styleFamilySchema', () => {
  it('should accept all style families', () => {
    for (const family of ['clean', 'editorial', 'bold', 'minimal']) {
      const result = styleFamilySchema.safeParse(family);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid family', () => {
    const result = styleFamilySchema.safeParse('modern');
    expect(result.success).toBe(false);
  });
});

describe('moodPresetSchema', () => {
  it('should accept all mood presets', () => {
    for (const mood of ['calm', 'energetic', 'premium', 'technical']) {
      const result = moodPresetSchema.safeParse(mood);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid mood', () => {
    const result = moodPresetSchema.safeParse('excited');
    expect(result.success).toBe(false);
  });
});

describe('templateSchema', () => {
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

  it('should accept valid template', () => {
    const result = templateSchema.safeParse(validTemplate);
    expect(result.success).toBe(true);
  });

  it('should reject missing id', () => {
    const { id, ...noId } = validTemplate;
    const result = templateSchema.safeParse(noId);
    expect(result.success).toBe(false);
  });

  it('should reject empty id', () => {
    const result = templateSchema.safeParse({ ...validTemplate, id: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing layouts', () => {
    const { layouts, ...noLayouts } = validTemplate;
    const result = templateSchema.safeParse(noLayouts);
    expect(result.success).toBe(false);
  });

  it('should reject empty layouts array', () => {
    const result = templateSchema.safeParse({ ...validTemplate, layouts: [] });
    expect(result.success).toBe(false);
  });

  it('should accept optional description', () => {
    const result = templateSchema.safeParse({ ...validTemplate, description: 'A test template' });
    expect(result.success).toBe(true);
  });

  it('should accept optional accents', () => {
    const result = templateSchema.safeParse({
      ...validTemplate,
      accents: [{ id: 'accent-1', type: 'line' }],
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional exportProfiles', () => {
    const result = templateSchema.safeParse({
      ...validTemplate,
      exportProfiles: [{ format: 'pptx', fontFallbacks: {} }],
    });
    expect(result.success).toBe(true);
  });
});

describe('templateStateSchema', () => {
  const validTemplateState = {
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
    styleFamily: 'clean',
    mood: 'calm',
    spacingDensity: 1.0,
    typeScale: 1.25,
    contrastLevel: 50,
  };

  it('should accept valid template state', () => {
    const result = templateStateSchema.safeParse(validTemplateState);
    expect(result.success).toBe(true);
  });

  it('should reject spacingDensity below 0.5', () => {
    const result = templateStateSchema.safeParse({ ...validTemplateState, spacingDensity: 0.4 });
    expect(result.success).toBe(false);
  });

  it('should reject spacingDensity above 2.0', () => {
    const result = templateStateSchema.safeParse({ ...validTemplateState, spacingDensity: 2.1 });
    expect(result.success).toBe(false);
  });

  it('should reject typeScale below 1.1', () => {
    const result = templateStateSchema.safeParse({ ...validTemplateState, typeScale: 1.0 });
    expect(result.success).toBe(false);
  });

  it('should reject typeScale above 1.5', () => {
    const result = templateStateSchema.safeParse({ ...validTemplateState, typeScale: 1.6 });
    expect(result.success).toBe(false);
  });

  it('should reject contrastLevel below 0', () => {
    const result = templateStateSchema.safeParse({ ...validTemplateState, contrastLevel: -1 });
    expect(result.success).toBe(false);
  });

  it('should reject contrastLevel above 100', () => {
    const result = templateStateSchema.safeParse({ ...validTemplateState, contrastLevel: 101 });
    expect(result.success).toBe(false);
  });
});

describe('validateTemplate helper', () => {
  const validTemplate = {
    id: 'test',
    name: 'Test',
    version: '1.0.0',
    tokens: {
      colors: {
        primary: '#000000',
        secondary: '#333333',
        neutral: '#666666',
        background: '#FFFFFF',
        accent: '#FF0000',
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
        name: 'Title',
        type: 'title',
        grid: { columns: 12, rows: 6, gutter: 16 },
        regions: [{ id: 'main', role: 'body', bounds: { x: 0, y: 0, w: 12, h: 6 } }],
      },
    ],
  };

  it('should return success for valid template', () => {
    const result = validateTemplate(validTemplate);
    expect(result.success).toBe(true);
  });

  it('should return error details for invalid template', () => {
    const result = validateTemplate({ invalid: 'data' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

describe('validateTemplateState helper', () => {
  const validState = {
    id: 'test',
    name: 'Test',
    version: '1.0.0',
    tokens: {
      colors: {
        primary: '#000000',
        secondary: '#333333',
        neutral: '#666666',
        background: '#FFFFFF',
        accent: '#FF0000',
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
        name: 'Title',
        type: 'title',
        grid: { columns: 12, rows: 6, gutter: 16 },
        regions: [{ id: 'main', role: 'body', bounds: { x: 0, y: 0, w: 12, h: 6 } }],
      },
    ],
    styleFamily: 'clean',
    mood: 'calm',
    spacingDensity: 1.0,
    typeScale: 1.25,
    contrastLevel: 50,
  };

  it('should return success for valid state', () => {
    const result = validateTemplateState(validState);
    expect(result.success).toBe(true);
  });

  it('should return error for invalid state', () => {
    const result = validateTemplateState({ ...validState, styleFamily: 'invalid' });
    expect(result.success).toBe(false);
  });
});
