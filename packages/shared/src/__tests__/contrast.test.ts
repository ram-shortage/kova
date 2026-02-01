/**
 * Comprehensive Contrast Validation Tests
 * Tests for all contrast-related functions in contrast.ts
 */

import { describe, it, expect } from 'vitest';
import {
  calculateContrastRatio,
  meetsWcagAA,
  meetsWcagAALargeText,
  validateColorContrast,
  suggestContrastAdjustment,
  WCAG_AA_NORMAL_TEXT,
  WCAG_AA_LARGE_TEXT,
  WCAG_AAA_NORMAL_TEXT,
  WCAG_AAA_LARGE_TEXT,
} from '../validation/contrast';

describe('calculateContrastRatio', () => {
  describe('basic calculations', () => {
    it('should return 21:1 for black on white', () => {
      const ratio = calculateContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should return 21:1 for white on black', () => {
      const ratio = calculateContrastRatio('#FFFFFF', '#000000');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should return 1:1 for same colors', () => {
      const ratio = calculateContrastRatio('#FF0000', '#FF0000');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should handle lowercase hex', () => {
      const ratio = calculateContrastRatio('#ffffff', '#000000');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should handle mixed case hex', () => {
      const ratio = calculateContrastRatio('#FfFfFf', '#000000');
      expect(ratio).toBeCloseTo(21, 0);
    });
  });

  describe('color pair calculations', () => {
    it('should calculate correct ratio for blue on white', () => {
      const ratio = calculateContrastRatio('#0000FF', '#FFFFFF');
      expect(ratio).toBeGreaterThan(8);
    });

    it('should calculate correct ratio for gray combinations', () => {
      const ratio = calculateContrastRatio('#777777', '#888888');
      expect(ratio).toBeLessThan(2);
    });

    it('should calculate correct ratio for brand colors', () => {
      // Primary dark blue on white background
      const ratio = calculateContrastRatio('#0A2A43', '#FFFFFF');
      expect(ratio).toBeGreaterThan(WCAG_AA_NORMAL_TEXT);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid hex format', () => {
      expect(() => calculateContrastRatio('not-a-color', '#FFFFFF')).toThrow('Invalid hex color');
    });

    it('should throw error for 3-digit hex', () => {
      expect(() => calculateContrastRatio('#FFF', '#000')).toThrow('Invalid hex color');
    });

    it('should handle colors without hash (accepted by regex)', () => {
      // The regex allows optional hash: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
      const ratio = calculateContrastRatio('FFFFFF', '000000');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should throw error for hex with invalid characters', () => {
      expect(() => calculateContrastRatio('#GGGGGG', '#000000')).toThrow('Invalid hex color');
    });
  });
});

describe('meetsWcagAA', () => {
  it('should pass for black on white', () => {
    expect(meetsWcagAA('#000000', '#FFFFFF')).toBe(true);
  });

  it('should pass for dark blue on white', () => {
    expect(meetsWcagAA('#0A2A43', '#FFFFFF')).toBe(true);
  });

  it('should fail for light gray on white', () => {
    expect(meetsWcagAA('#CCCCCC', '#FFFFFF')).toBe(false);
  });

  it('should fail for similar grays', () => {
    expect(meetsWcagAA('#777777', '#888888')).toBe(false);
  });

  it('should pass for exact 4.5:1 ratio', () => {
    // #767676 on white is exactly 4.54:1
    expect(meetsWcagAA('#767676', '#FFFFFF')).toBe(true);
  });

  it('should fail for just below 4.5:1 ratio', () => {
    // #787878 on white is about 4.48:1
    expect(meetsWcagAA('#787878', '#FFFFFF')).toBe(false);
  });
});

describe('meetsWcagAALargeText', () => {
  it('should pass for black on white', () => {
    expect(meetsWcagAALargeText('#000000', '#FFFFFF')).toBe(true);
  });

  it('should pass for colors meeting 3:1 but not 4.5:1', () => {
    // This gray passes large text (3:1) but fails normal text (4.5:1)
    expect(meetsWcagAALargeText('#949494', '#FFFFFF')).toBe(true);
    expect(meetsWcagAA('#949494', '#FFFFFF')).toBe(false);
  });

  it('should fail for very low contrast', () => {
    expect(meetsWcagAALargeText('#DDDDDD', '#FFFFFF')).toBe(false);
  });

  it('should pass for accent gold on white', () => {
    // Darker gold should pass large text threshold
    expect(meetsWcagAALargeText('#B8860B', '#FFFFFF')).toBe(true);
  });
});

describe('WCAG Constants', () => {
  it('should have correct normal text AA ratio', () => {
    expect(WCAG_AA_NORMAL_TEXT).toBe(4.5);
  });

  it('should have correct large text AA ratio', () => {
    expect(WCAG_AA_LARGE_TEXT).toBe(3.0);
  });

  it('should have correct normal text AAA ratio', () => {
    expect(WCAG_AAA_NORMAL_TEXT).toBe(7.0);
  });

  it('should have correct large text AAA ratio', () => {
    expect(WCAG_AAA_LARGE_TEXT).toBe(4.5);
  });
});

describe('validateColorContrast', () => {
  const goodPalette = {
    primary: '#0A2A43',
    secondary: '#3D6B82',
    neutral: '#2B2B2B',
    background: '#FFFFFF',
    accent: '#B8860B',
  };

  const badPalette = {
    primary: '#CCCCCC',
    secondary: '#BBBBBB',
    neutral: '#AAAAAA',
    background: '#FFFFFF',
    accent: '#FFFF00',
  };

  describe('good color palette', () => {
    it('should return no critical issues for high contrast palette', () => {
      const issues = validateColorContrast(goodPalette);
      const criticalIssues = issues.filter((i) => !i.context.includes('Accent'));
      expect(criticalIssues.length).toBe(0);
    });
  });

  describe('bad color palette', () => {
    it('should identify primary contrast issue', () => {
      const issues = validateColorContrast(badPalette);
      expect(issues.some((i) => i.context.includes('Primary'))).toBe(true);
    });

    it('should identify secondary contrast issue', () => {
      const issues = validateColorContrast(badPalette);
      expect(issues.some((i) => i.context.includes('Secondary'))).toBe(true);
    });

    it('should identify neutral contrast issue', () => {
      const issues = validateColorContrast(badPalette);
      expect(issues.some((i) => i.context.includes('Neutral'))).toBe(true);
    });

    it('should return issues with correct structure', () => {
      const issues = validateColorContrast(badPalette);
      expect(issues.length).toBeGreaterThan(0);

      const issue = issues[0];
      expect(issue).toHaveProperty('foreground');
      expect(issue).toHaveProperty('background');
      expect(issue).toHaveProperty('ratio');
      expect(issue).toHaveProperty('required');
      expect(issue).toHaveProperty('context');
    });
  });

  describe('accent color validation', () => {
    it('should use large text threshold for accent', () => {
      const issues = validateColorContrast(goodPalette);
      const accentIssue = issues.find((i) => i.context.includes('Accent'));
      if (accentIssue) {
        expect(accentIssue.required).toBe(WCAG_AA_LARGE_TEXT);
      }
    });

    it('should flag bright yellow accent on white', () => {
      const issues = validateColorContrast(badPalette);
      const accentIssue = issues.find((i) => i.context.includes('Accent'));
      expect(accentIssue).toBeDefined();
    });
  });

  describe('dark background scenarios', () => {
    it('should validate colors on dark background', () => {
      const darkPalette = {
        primary: '#FFFFFF',
        secondary: '#CCCCCC',
        neutral: '#AAAAAA',
        background: '#000000',
        accent: '#FFD700',
      };
      const issues = validateColorContrast(darkPalette);
      // White on black should pass
      expect(issues.some((i) => i.context.includes('Primary'))).toBe(false);
    });
  });
});

describe('suggestContrastAdjustment', () => {
  describe('light background adjustments', () => {
    it('should darken light colors on white background', () => {
      const adjusted = suggestContrastAdjustment('#CCCCCC', '#FFFFFF');
      const originalRatio = calculateContrastRatio('#CCCCCC', '#FFFFFF');
      const adjustedRatio = calculateContrastRatio(adjusted, '#FFFFFF');
      expect(adjustedRatio).toBeGreaterThan(originalRatio);
      expect(adjustedRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    it('should return adjusted color in hex format', () => {
      const adjusted = suggestContrastAdjustment('#CCCCCC', '#FFFFFF');
      expect(adjusted).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should not change already compliant colors', () => {
      const adjusted = suggestContrastAdjustment('#000000', '#FFFFFF');
      // Black already passes, adjustment should still be valid
      const ratio = calculateContrastRatio(adjusted, '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });
  });

  describe('dark background adjustments', () => {
    it('should lighten dark colors on dark background', () => {
      const adjusted = suggestContrastAdjustment('#333333', '#000000');
      const adjustedRatio = calculateContrastRatio(adjusted, '#000000');
      expect(adjustedRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });
  });

  describe('custom target ratio', () => {
    it('should adjust to custom target ratio', () => {
      const adjusted = suggestContrastAdjustment('#888888', '#FFFFFF', 7.0);
      const ratio = calculateContrastRatio(adjusted, '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });

    it('should use default 4.5:1 when not specified', () => {
      const adjusted = suggestContrastAdjustment('#888888', '#FFFFFF');
      const ratio = calculateContrastRatio(adjusted, '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('edge cases', () => {
    it('should handle mid-gray on white', () => {
      const adjusted = suggestContrastAdjustment('#808080', '#FFFFFF');
      const ratio = calculateContrastRatio(adjusted, '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    it('should handle near-white on white', () => {
      const adjusted = suggestContrastAdjustment('#FEFEFE', '#FFFFFF');
      const ratio = calculateContrastRatio(adjusted, '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    it('should handle pure red on white', () => {
      const adjusted = suggestContrastAdjustment('#FF0000', '#FFFFFF');
      // Red on white already has decent contrast
      const ratio = calculateContrastRatio(adjusted, '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });
  });
});
