/**
 * Comprehensive Validator Tests
 * Tests for web app validation functions
 */

import { describe, it, expect } from 'vitest';
import {
  validateContrast,
  validateSpacing,
  validateTypography,
  validateBrand,
  validateTemplate,
  useValidation,
  type ValidationIssue,
  type ValidationResult,
} from '../lib/validators';
import type { TemplateState } from '@kova/shared';

// Helper to create a valid template state
const createValidTemplateState = (overrides?: Partial<TemplateState>): TemplateState => ({
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
      regions: [{ id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 2 } }],
      enabled: true,
    },
  ],
  accents: [],
  styleFamily: 'clean',
  mood: 'calm',
  spacingDensity: 1.0,
  typeScale: 1.25,
  contrastLevel: 50,
  ...overrides,
});

describe('validateContrast', () => {
  describe('passing cases', () => {
    it('should return no critical issues for high contrast palette', () => {
      const template = createValidTemplateState();
      const issues = validateContrast(template);
      // Only accent may have issues (uses large text threshold 3:1 instead of 4.5:1)
      const criticalIssues = issues.filter(i => !i.id.includes('accent'));
      expect(criticalIssues.length).toBe(0);
    });

    it('should return no issues for black on white', () => {
      const template = createValidTemplateState({
        tokens: {
          colors: {
            primary: '#000000',
            secondary: '#000000',
            neutral: '#000000',
            background: '#FFFFFF',
            accent: '#B8860B',
          },
          spacing: { base: 4, m: 12, l: 24 },
          radius: { sm: 2, md: 6, lg: 12 },
        },
      });
      const issues = validateContrast(template);
      expect(issues.filter(i => i.severity === 'error').length).toBe(0);
    });
  });

  describe('primary color issues', () => {
    it('should flag low contrast primary color', () => {
      const template = createValidTemplateState();
      template.tokens.colors.primary = '#CCCCCC';

      const issues = validateContrast(template);
      const primaryIssue = issues.find(i => i.id === 'contrast-primary-bg');
      expect(primaryIssue).toBeDefined();
      expect(primaryIssue?.type).toBe('contrast');
    });

    it('should return error severity for very low contrast', () => {
      const template = createValidTemplateState();
      template.tokens.colors.primary = '#EEEEEE';

      const issues = validateContrast(template);
      const primaryIssue = issues.find(i => i.id === 'contrast-primary-bg');
      expect(primaryIssue?.severity).toBe('error');
    });

    it('should return warning severity for moderate contrast', () => {
      const template = createValidTemplateState();
      template.tokens.colors.primary = '#888888';

      const issues = validateContrast(template);
      const primaryIssue = issues.find(i => i.id === 'contrast-primary-bg');
      expect(primaryIssue?.severity).toBe('warning');
    });
  });

  describe('secondary color issues', () => {
    it('should flag low contrast secondary color', () => {
      const template = createValidTemplateState();
      template.tokens.colors.secondary = '#CCCCCC';

      const issues = validateContrast(template);
      const secondaryIssue = issues.find(i => i.id === 'contrast-secondary-bg');
      expect(secondaryIssue).toBeDefined();
    });
  });

  describe('neutral color issues', () => {
    it('should flag low contrast neutral color', () => {
      const template = createValidTemplateState();
      template.tokens.colors.neutral = '#CCCCCC';

      const issues = validateContrast(template);
      const neutralIssue = issues.find(i => i.id === 'contrast-neutral-bg');
      expect(neutralIssue).toBeDefined();
      expect(neutralIssue?.message).toContain('body text');
    });
  });

  describe('accent color issues', () => {
    it('should flag very low contrast accent color', () => {
      const template = createValidTemplateState();
      template.tokens.colors.accent = '#FFFF00';

      const issues = validateContrast(template);
      const accentIssue = issues.find(i => i.id === 'contrast-accent-bg');
      expect(accentIssue).toBeDefined();
      expect(accentIssue?.severity).toBe('warning');
    });

    it('should include ratio details in issue', () => {
      const template = createValidTemplateState();
      template.tokens.colors.accent = '#FFFF00';

      const issues = validateContrast(template);
      const accentIssue = issues.find(i => i.id === 'contrast-accent-bg');
      expect(accentIssue?.details).toContain('Contrast ratio');
    });
  });

  describe('issue structure', () => {
    it('should return issues with correct structure', () => {
      const template = createValidTemplateState();
      template.tokens.colors.primary = '#CCCCCC';

      const issues = validateContrast(template);
      const issue = issues[0];

      expect(issue).toHaveProperty('id');
      expect(issue).toHaveProperty('type');
      expect(issue).toHaveProperty('severity');
      expect(issue).toHaveProperty('message');
      expect(issue).toHaveProperty('field');
    });
  });
});

describe('validateSpacing', () => {
  describe('passing cases', () => {
    it('should return no issues for valid spacing', () => {
      const template = createValidTemplateState();
      const issues = validateSpacing(template);
      expect(issues.length).toBe(0);
    });
  });

  describe('base spacing issues', () => {
    it('should flag base spacing below minimum', () => {
      const template = createValidTemplateState();
      template.tokens.spacing.base = 1;

      const issues = validateSpacing(template);
      const baseIssue = issues.find(i => i.id === 'spacing-base-min');
      expect(baseIssue).toBeDefined();
      expect(baseIssue?.severity).toBe('error');
    });
  });

  describe('medium spacing issues', () => {
    it('should flag medium spacing below minimum', () => {
      const template = createValidTemplateState();
      template.tokens.spacing.m = 6;

      const issues = validateSpacing(template);
      const mIssue = issues.find(i => i.id === 'spacing-m-min');
      expect(mIssue).toBeDefined();
      expect(mIssue?.severity).toBe('warning');
    });
  });

  describe('large spacing issues', () => {
    it('should flag large spacing below minimum', () => {
      const template = createValidTemplateState();
      template.tokens.spacing.l = 12;

      const issues = validateSpacing(template);
      const lIssue = issues.find(i => i.id === 'spacing-l-min');
      expect(lIssue).toBeDefined();
    });
  });

  describe('spacing density issues', () => {
    it('should flag very low spacing density', () => {
      const template = createValidTemplateState({ spacingDensity: 0.6 });

      const issues = validateSpacing(template);
      const densityIssue = issues.find(i => i.id === 'spacing-density-low');
      expect(densityIssue).toBeDefined();
      expect(densityIssue?.severity).toBe('warning');
    });

    it('should not flag normal spacing density', () => {
      const template = createValidTemplateState({ spacingDensity: 1.0 });

      const issues = validateSpacing(template);
      const densityIssue = issues.find(i => i.id === 'spacing-density-low');
      expect(densityIssue).toBeUndefined();
    });
  });
});

describe('validateTypography', () => {
  describe('passing cases', () => {
    it('should return no issues for valid typography', () => {
      const template = createValidTemplateState();
      const issues = validateTypography(template);
      expect(issues.filter(i => i.severity === 'error').length).toBe(0);
    });
  });

  describe('title font size issues', () => {
    it('should flag title font size below 18pt', () => {
      const template = createValidTemplateState();
      template.typography.title.fontSize = 16;

      const issues = validateTypography(template);
      const titleIssue = issues.find(i => i.id === 'typography-title-size');
      expect(titleIssue).toBeDefined();
      expect(titleIssue?.severity).toBe('error');
    });
  });

  describe('body font size issues', () => {
    it('should flag body font size below 12pt', () => {
      const template = createValidTemplateState();
      template.typography.body.fontSize = 10;

      const issues = validateTypography(template);
      const bodyIssue = issues.find(i => i.id === 'typography-body-size');
      expect(bodyIssue).toBeDefined();
      expect(bodyIssue?.severity).toBe('error');
    });
  });

  describe('line height issues', () => {
    it('should flag title line height below 1', () => {
      const template = createValidTemplateState();
      template.typography.title.lineHeight = 0.9;

      const issues = validateTypography(template);
      const lineHeightIssue = issues.find(i => i.id === 'typography-title-lineheight');
      expect(lineHeightIssue).toBeDefined();
      expect(lineHeightIssue?.severity).toBe('warning');
    });

    it('should flag tight body line height', () => {
      const template = createValidTemplateState();
      template.typography.body.lineHeight = 1.1;

      const issues = validateTypography(template);
      const lineHeightIssue = issues.find(i => i.id === 'typography-body-lineheight');
      expect(lineHeightIssue).toBeDefined();
      expect(lineHeightIssue?.severity).toBe('info');
    });
  });
});

describe('validateBrand', () => {
  describe('logo checks', () => {
    it('should return info issue when no logos', () => {
      const template = createValidTemplateState();
      const issues = validateBrand(template, [], []);

      const logoIssue = issues.find(i => i.id === 'brand-no-logo');
      expect(logoIssue).toBeDefined();
      expect(logoIssue?.severity).toBe('info');
    });

    it('should not flag when logos present', () => {
      const template = createValidTemplateState();
      const logos = [{ id: 'logo-1' }];
      const issues = validateBrand(template, logos, []);

      const logoIssue = issues.find(i => i.id === 'brand-no-logo');
      expect(logoIssue).toBeUndefined();
    });
  });

  describe('font checks', () => {
    it('should return info issue for default fonts and no custom fonts', () => {
      const template = createValidTemplateState();
      const issues = validateBrand(template, [], []);

      const fontIssue = issues.find(i => i.id === 'brand-default-fonts');
      expect(fontIssue).toBeDefined();
      expect(fontIssue?.severity).toBe('info');
    });

    it('should not flag when custom fonts uploaded', () => {
      const template = createValidTemplateState();
      const fonts = [{ id: 'font-1' }];
      const issues = validateBrand(template, [], fonts);

      const fontIssue = issues.find(i => i.id === 'brand-default-fonts');
      expect(fontIssue).toBeUndefined();
    });

    it('should not flag when using non-Arial font', () => {
      const template = createValidTemplateState();
      template.typography.title.fontFamily = 'Georgia';
      const issues = validateBrand(template, [], []);

      const fontIssue = issues.find(i => i.id === 'brand-default-fonts');
      expect(fontIssue).toBeUndefined();
    });
  });
});

describe('validateTemplate', () => {
  it('should return valid true for good template', () => {
    const template = createValidTemplateState();
    const result = validateTemplate(template);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return valid false when there are errors', () => {
    const template = createValidTemplateState();
    template.tokens.spacing.base = 1;
    template.typography.title.fontSize = 10;

    const result = validateTemplate(template);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should categorize issues correctly', () => {
    const template = createValidTemplateState();
    template.tokens.colors.primary = '#CCCCCC';
    template.tokens.spacing.base = 1;
    template.typography.body.lineHeight = 1.1;

    const result = validateTemplate(template, [], []);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.info.length).toBeGreaterThan(0);
  });

  it('should aggregate all validator results', () => {
    const template = createValidTemplateState();
    template.tokens.colors.primary = '#CCCCCC';
    template.tokens.spacing.base = 1;
    template.typography.title.fontSize = 10;

    const result = validateTemplate(template, [], []);

    const hasContrastIssue = result.errors.some(i => i.type === 'contrast') ||
                              result.warnings.some(i => i.type === 'contrast');
    const hasSpacingIssue = result.errors.some(i => i.type === 'spacing');
    const hasTypographyIssue = result.errors.some(i => i.type === 'typography');

    expect(hasContrastIssue).toBe(true);
    expect(hasSpacingIssue).toBe(true);
    expect(hasTypographyIssue).toBe(true);
  });

  it('should use default empty arrays for logos and fonts', () => {
    const template = createValidTemplateState();
    const result = validateTemplate(template);

    // Should still include brand info issues
    const hasBrandIssues = result.info.some(i => i.type === 'brand');
    expect(hasBrandIssues).toBe(true);
  });
});

describe('useValidation', () => {
  it('should be a function', () => {
    expect(typeof useValidation).toBe('function');
  });

  it('should return validation result', () => {
    const template = createValidTemplateState();
    const result = useValidation(template);

    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('info');
  });

  it('should pass logos and fonts to validateBrand', () => {
    const template = createValidTemplateState();
    const logos = [{ id: 'logo-1' }];
    const fonts = [{ id: 'font-1' }];

    const result = useValidation(template, logos, fonts);

    const hasLogoIssue = result.info.some(i => i.id === 'brand-no-logo');
    expect(hasLogoIssue).toBe(false);
  });
});

describe('ValidationIssue interface', () => {
  it('should support all issue types', () => {
    const types: ValidationIssue['type'][] = ['contrast', 'spacing', 'typography', 'brand'];

    for (const type of types) {
      const issue: ValidationIssue = {
        id: 'test',
        type,
        severity: 'error',
        message: 'Test',
        field: 'test',
      };
      expect(issue.type).toBe(type);
    }
  });

  it('should support all severity levels', () => {
    const severities: ValidationIssue['severity'][] = ['error', 'warning', 'info'];

    for (const severity of severities) {
      const issue: ValidationIssue = {
        id: 'test',
        type: 'contrast',
        severity,
        message: 'Test',
        field: 'test',
      };
      expect(issue.severity).toBe(severity);
    }
  });

  it('should support optional details', () => {
    const issue: ValidationIssue = {
      id: 'test',
      type: 'contrast',
      severity: 'error',
      message: 'Test',
      field: 'test',
      details: 'Additional details',
    };
    expect(issue.details).toBe('Additional details');
  });

  it('should support optional autoFix', () => {
    const issue: ValidationIssue = {
      id: 'test',
      type: 'contrast',
      severity: 'error',
      message: 'Test',
      field: 'test',
      autoFix: () => ({}),
    };
    expect(typeof issue.autoFix).toBe('function');
  });
});
