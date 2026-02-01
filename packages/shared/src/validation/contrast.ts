/**
 * Contrast Validation - WCAG AA Compliance
 * Minimum contrast ratio: 4.5:1 for body text
 */

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// Calculate relative luminance per WCAG 2.1
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG AA minimum contrast ratios
export const WCAG_AA_NORMAL_TEXT = 4.5;
export const WCAG_AA_LARGE_TEXT = 3.0;
export const WCAG_AAA_NORMAL_TEXT = 7.0;
export const WCAG_AAA_LARGE_TEXT = 4.5;

// Check if contrast meets WCAG AA for normal text
export function meetsWcagAA(foreground: string, background: string): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  return ratio >= WCAG_AA_NORMAL_TEXT;
}

// Check if contrast meets WCAG AA for large text (18pt+)
export function meetsWcagAALargeText(foreground: string, background: string): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  return ratio >= WCAG_AA_LARGE_TEXT;
}

// Validation result interface
export interface ContrastIssue {
  foreground: string;
  background: string;
  ratio: number;
  required: number;
  context: string;
}

// Validate all color combinations in tokens
export function validateColorContrast(
  colors: { primary: string; secondary: string; neutral: string; background: string; accent: string }
): ContrastIssue[] {
  const issues: ContrastIssue[] = [];

  // Check primary on background
  const primaryRatio = calculateContrastRatio(colors.primary, colors.background);
  if (primaryRatio < WCAG_AA_NORMAL_TEXT) {
    issues.push({
      foreground: colors.primary,
      background: colors.background,
      ratio: primaryRatio,
      required: WCAG_AA_NORMAL_TEXT,
      context: 'Primary text on background',
    });
  }

  // Check secondary on background
  const secondaryRatio = calculateContrastRatio(colors.secondary, colors.background);
  if (secondaryRatio < WCAG_AA_NORMAL_TEXT) {
    issues.push({
      foreground: colors.secondary,
      background: colors.background,
      ratio: secondaryRatio,
      required: WCAG_AA_NORMAL_TEXT,
      context: 'Secondary text on background',
    });
  }

  // Check neutral on background
  const neutralRatio = calculateContrastRatio(colors.neutral, colors.background);
  if (neutralRatio < WCAG_AA_NORMAL_TEXT) {
    issues.push({
      foreground: colors.neutral,
      background: colors.background,
      ratio: neutralRatio,
      required: WCAG_AA_NORMAL_TEXT,
      context: 'Neutral text on background',
    });
  }

  // Check accent on background (large text - 18pt for titles)
  const accentRatio = calculateContrastRatio(colors.accent, colors.background);
  if (accentRatio < WCAG_AA_LARGE_TEXT) {
    issues.push({
      foreground: colors.accent,
      background: colors.background,
      ratio: accentRatio,
      required: WCAG_AA_LARGE_TEXT,
      context: 'Accent on background (large text)',
    });
  }

  return issues;
}

// Suggest adjusted color for better contrast
export function suggestContrastAdjustment(
  foreground: string,
  background: string,
  targetRatio: number = WCAG_AA_NORMAL_TEXT
): string {
  const bgRgb = hexToRgb(background);
  const bgLuminance = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // Determine if we need lighter or darker foreground
  const needsDarker = bgLuminance > 0.5;

  const fgRgb = hexToRgb(foreground);
  let { r, g, b } = fgRgb;

  // Adjust in steps until we meet target
  for (let i = 0; i < 100; i++) {
    const currentRatio = calculateContrastRatio(
      `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      background
    );

    if (currentRatio >= targetRatio) {
      break;
    }

    if (needsDarker) {
      r = Math.max(0, r - 5);
      g = Math.max(0, g - 5);
      b = Math.max(0, b - 5);
    } else {
      r = Math.min(255, r + 5);
      g = Math.min(255, g + 5);
      b = Math.min(255, b + 5);
    }
  }

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
