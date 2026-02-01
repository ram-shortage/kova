/**
 * Validation Engine
 * Runs quality checks on template and returns issues
 */

import {
  calculateContrastRatio,
  WCAG_AA_NORMAL_TEXT,
  WCAG_AA_LARGE_TEXT,
  type TemplateState,
} from '@kova/shared';

export interface ValidationIssue {
  id: string;
  type: 'contrast' | 'spacing' | 'typography' | 'brand';
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  field: string;
  autoFix?: () => Partial<TemplateState>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
}

// Validate contrast ratios (WCAG AA)
export function validateContrast(template: TemplateState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { colors } = template.tokens;

  // Check primary on background
  const primaryRatio = calculateContrastRatio(colors.primary, colors.background);
  if (primaryRatio < WCAG_AA_NORMAL_TEXT) {
    issues.push({
      id: 'contrast-primary-bg',
      type: 'contrast',
      severity: primaryRatio < 3 ? 'error' : 'warning',
      message: 'Primary color has low contrast on background',
      details: `Contrast ratio ${primaryRatio.toFixed(2)}:1 (minimum 4.5:1 required)`,
      field: 'tokens.colors.primary',
    });
  }

  // Check secondary on background
  const secondaryRatio = calculateContrastRatio(colors.secondary, colors.background);
  if (secondaryRatio < WCAG_AA_NORMAL_TEXT) {
    issues.push({
      id: 'contrast-secondary-bg',
      type: 'contrast',
      severity: secondaryRatio < 3 ? 'error' : 'warning',
      message: 'Secondary color has low contrast on background',
      details: `Contrast ratio ${secondaryRatio.toFixed(2)}:1 (minimum 4.5:1 required)`,
      field: 'tokens.colors.secondary',
    });
  }

  // Check neutral on background
  const neutralRatio = calculateContrastRatio(colors.neutral, colors.background);
  if (neutralRatio < WCAG_AA_NORMAL_TEXT) {
    issues.push({
      id: 'contrast-neutral-bg',
      type: 'contrast',
      severity: neutralRatio < 3 ? 'error' : 'warning',
      message: 'Neutral (body text) color has low contrast on background',
      details: `Contrast ratio ${neutralRatio.toFixed(2)}:1 (minimum 4.5:1 required)`,
      field: 'tokens.colors.neutral',
    });
  }

  // Check accent on background (large text - 18pt)
  const accentRatio = calculateContrastRatio(colors.accent, colors.background);
  if (accentRatio < WCAG_AA_LARGE_TEXT) {
    issues.push({
      id: 'contrast-accent-bg',
      type: 'contrast',
      severity: 'warning',
      message: 'Accent color may have insufficient contrast',
      details: `Contrast ratio ${accentRatio.toFixed(2)}:1 (minimum 3:1 for large text)`,
      field: 'tokens.colors.accent',
    });
  }

  return issues;
}

// Validate spacing values
export function validateSpacing(template: TemplateState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { spacing } = template.tokens;

  if (spacing.base < 2) {
    issues.push({
      id: 'spacing-base-min',
      type: 'spacing',
      severity: 'error',
      message: 'Base spacing is too small',
      details: `Base spacing ${spacing.base}px is below the 2px minimum`,
      field: 'tokens.spacing.base',
    });
  }

  if (spacing.m < 8) {
    issues.push({
      id: 'spacing-m-min',
      type: 'spacing',
      severity: 'warning',
      message: 'Medium spacing is too small',
      details: `Medium spacing ${spacing.m}px is below the 8px minimum`,
      field: 'tokens.spacing.m',
    });
  }

  if (spacing.l < 16) {
    issues.push({
      id: 'spacing-l-min',
      type: 'spacing',
      severity: 'warning',
      message: 'Large spacing is too small',
      details: `Large spacing ${spacing.l}px is below the 16px minimum`,
      field: 'tokens.spacing.l',
    });
  }

  // Check spacing density
  if (template.spacingDensity < 0.7) {
    issues.push({
      id: 'spacing-density-low',
      type: 'spacing',
      severity: 'warning',
      message: 'Spacing density is very compact',
      details: 'Content may appear cramped. Consider increasing spacing density.',
      field: 'spacingDensity',
    });
  }

  return issues;
}

// Validate typography values
export function validateTypography(template: TemplateState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { title, body } = template.typography;

  // Title font size minimum 18pt
  if (title.fontSize < 18) {
    issues.push({
      id: 'typography-title-size',
      type: 'typography',
      severity: 'error',
      message: 'Title font size is too small',
      details: `Title size ${title.fontSize}pt is below the 18pt minimum`,
      field: 'typography.title.fontSize',
    });
  }

  // Body font size minimum 12pt
  if (body.fontSize < 12) {
    issues.push({
      id: 'typography-body-size',
      type: 'typography',
      severity: 'error',
      message: 'Body font size is too small',
      details: `Body size ${body.fontSize}pt is below the 12pt minimum`,
      field: 'typography.body.fontSize',
    });
  }

  // Line height checks
  if (title.lineHeight < 1) {
    issues.push({
      id: 'typography-title-lineheight',
      type: 'typography',
      severity: 'warning',
      message: 'Title line height is too tight',
      details: 'Line height should be at least 1 for readability',
      field: 'typography.title.lineHeight',
    });
  }

  if (body.lineHeight < 1.2) {
    issues.push({
      id: 'typography-body-lineheight',
      type: 'typography',
      severity: 'info',
      message: 'Body line height may be too tight',
      details: 'Consider using at least 1.2 line height for better readability',
      field: 'typography.body.lineHeight',
    });
  }

  return issues;
}

// Validate brand completeness
export function validateBrand(
  template: TemplateState,
  logos: Array<{ id: string }>,
  fonts: Array<{ id: string }>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for uploaded logos
  if (logos.length === 0) {
    issues.push({
      id: 'brand-no-logo',
      type: 'brand',
      severity: 'info',
      message: 'No logo uploaded',
      details: 'Consider adding a logo for brand consistency',
      field: 'logos',
    });
  }

  // Check for custom fonts
  if (fonts.length === 0 && template.typography.title.fontFamily === 'Arial') {
    issues.push({
      id: 'brand-default-fonts',
      type: 'brand',
      severity: 'info',
      message: 'Using default system fonts',
      details: 'Upload custom fonts to match your brand identity',
      field: 'fonts',
    });
  }

  return issues;
}

// Run all validators
export function validateTemplate(
  template: TemplateState,
  logos: Array<{ id: string }> = [],
  fonts: Array<{ id: string }> = []
): ValidationResult {
  const allIssues = [
    ...validateContrast(template),
    ...validateSpacing(template),
    ...validateTypography(template),
    ...validateBrand(template, logos, fonts),
  ];

  const errors = allIssues.filter((i) => i.severity === 'error');
  const warnings = allIssues.filter((i) => i.severity === 'warning');
  const info = allIssues.filter((i) => i.severity === 'info');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}

// Hook for using validation in components
export function useValidation(template: TemplateState, logos?: Array<{ id: string }>, fonts?: Array<{ id: string }>) {
  return validateTemplate(template, logos, fonts);
}
