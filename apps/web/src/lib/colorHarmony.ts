/**
 * Color Harmony Utilities
 * Generate harmonious color palettes using color theory
 */

export type HarmonyMode =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'monochromatic';

export type ColorMood = 'warm' | 'cool' | 'neutral';

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  neutral: string;
  background: string;
  accent: string;
}

export interface LockedColors {
  primary?: boolean;
  secondary?: boolean;
  neutral?: boolean;
  background?: boolean;
  accent?: boolean;
}

/**
 * Convert hex color to HSL
 */
export function hexToHsl(hex: string): HSL {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 50 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex color
 */
export function hslToHex(hsl: HSL): string {
  const { h, s, l } = hsl;
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Calculate relative luminance for contrast checking
 */
function getLuminance(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 0;

  const [r, g, b] = [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Ensure color meets WCAG AA contrast against background
 */
function ensureContrast(color: HSL, background: string, minRatio = 4.5): HSL {
  let adjusted = { ...color };
  const bgLuminance = getLuminance(background);
  const isLightBg = bgLuminance > 0.5;

  // Adjust lightness to meet contrast ratio
  for (let i = 0; i < 50; i++) {
    const hex = hslToHex(adjusted);
    const ratio = getContrastRatio(hex, background);

    if (ratio >= minRatio) break;

    // Make darker on light backgrounds, lighter on dark backgrounds
    if (isLightBg) {
      adjusted.l = Math.max(0, adjusted.l - 2);
    } else {
      adjusted.l = Math.min(100, adjusted.l + 2);
    }
  }

  return adjusted;
}

/**
 * Generate a random hue based on mood
 */
function getRandomHue(mood: ColorMood): number {
  const rand = Math.random();

  switch (mood) {
    case 'warm':
      // Reds, oranges, yellows (0-60 and 300-360)
      return rand < 0.5
        ? Math.floor(rand * 2 * 60) // 0-60
        : Math.floor(300 + rand * 60); // 300-360
    case 'cool':
      // Blues, greens, purples (120-300)
      return Math.floor(120 + rand * 180);
    case 'neutral':
    default:
      return Math.floor(rand * 360);
  }
}

/**
 * Generate complementary colors (opposite on wheel)
 */
function generateComplementary(baseHue: number): number[] {
  return [baseHue, (baseHue + 180) % 360];
}

/**
 * Generate analogous colors (adjacent on wheel)
 */
function generateAnalogous(baseHue: number): number[] {
  return [
    (baseHue - 30 + 360) % 360,
    baseHue,
    (baseHue + 30) % 360,
  ];
}

/**
 * Generate triadic colors (evenly spaced)
 */
function generateTriadic(baseHue: number): number[] {
  return [
    baseHue,
    (baseHue + 120) % 360,
    (baseHue + 240) % 360,
  ];
}

/**
 * Generate split-complementary colors
 */
function generateSplitComplementary(baseHue: number): number[] {
  const complement = (baseHue + 180) % 360;
  return [
    baseHue,
    (complement - 30 + 360) % 360,
    (complement + 30) % 360,
  ];
}

/**
 * Generate monochromatic colors (same hue, different saturation/lightness)
 */
function generateMonochromatic(baseHue: number): { h: number; s: number; l: number }[] {
  return [
    { h: baseHue, s: 70, l: 35 },
    { h: baseHue, s: 60, l: 50 },
    { h: baseHue, s: 50, l: 65 },
    { h: baseHue, s: 30, l: 85 },
    { h: baseHue, s: 80, l: 45 },
  ];
}

/**
 * Generate a harmonious color palette
 */
export function generatePalette(
  mode: HarmonyMode,
  mood: ColorMood = 'neutral',
  currentColors?: ColorPalette,
  locked?: LockedColors
): ColorPalette {
  const baseHue = getRandomHue(mood);

  let hues: number[];
  let colors: HSL[];

  switch (mode) {
    case 'complementary':
      hues = generateComplementary(baseHue);
      colors = [
        { h: hues[0], s: 65, l: 35 },     // primary - deep
        { h: hues[1], s: 50, l: 45 },     // secondary
        { h: hues[0], s: 10, l: 25 },     // neutral - desaturated
        { h: hues[0], s: 5, l: 98 },      // background - near white
        { h: hues[1], s: 70, l: 50 },     // accent - vibrant complement
      ];
      break;

    case 'analogous':
      hues = generateAnalogous(baseHue);
      colors = [
        { h: hues[1], s: 60, l: 35 },     // primary - center hue
        { h: hues[0], s: 45, l: 50 },     // secondary - adjacent
        { h: hues[1], s: 10, l: 25 },     // neutral
        { h: hues[1], s: 8, l: 97 },      // background
        { h: hues[2], s: 65, l: 45 },     // accent - other adjacent
      ];
      break;

    case 'triadic':
      hues = generateTriadic(baseHue);
      colors = [
        { h: hues[0], s: 55, l: 35 },     // primary
        { h: hues[1], s: 40, l: 50 },     // secondary
        { h: hues[0], s: 10, l: 25 },     // neutral
        { h: hues[0], s: 5, l: 98 },      // background
        { h: hues[2], s: 70, l: 50 },     // accent
      ];
      break;

    case 'split-complementary':
      hues = generateSplitComplementary(baseHue);
      colors = [
        { h: hues[0], s: 60, l: 35 },     // primary
        { h: hues[1], s: 45, l: 50 },     // secondary
        { h: hues[0], s: 10, l: 25 },     // neutral
        { h: hues[0], s: 5, l: 98 },      // background
        { h: hues[2], s: 65, l: 50 },     // accent
      ];
      break;

    case 'monochromatic':
    default:
      const monoColors = generateMonochromatic(baseHue);
      colors = monoColors.map((c) => ({ ...c }));
      break;
  }

  // Convert to hex and ensure contrast
  const backgroundHex = hslToHex(colors[3]);

  const palette: ColorPalette = {
    primary: hslToHex(ensureContrast(colors[0], backgroundHex)),
    secondary: hslToHex(ensureContrast(colors[1], backgroundHex)),
    neutral: hslToHex(ensureContrast(colors[2], backgroundHex)),
    background: backgroundHex,
    accent: hslToHex(colors[4]),
  };

  // Apply locked colors from current palette
  if (currentColors && locked) {
    if (locked.primary) palette.primary = currentColors.primary;
    if (locked.secondary) palette.secondary = currentColors.secondary;
    if (locked.neutral) palette.neutral = currentColors.neutral;
    if (locked.background) palette.background = currentColors.background;
    if (locked.accent) palette.accent = currentColors.accent;
  }

  return palette;
}

/**
 * Temperature adjustments for color generation
 */
interface TemperatureConfig {
  saturationMultiplier: number;
  lightnessShift: number;
  accentSaturation: number;
  backgroundWarmth: number; // Slight tint for background
}

function getTemperatureConfig(temperature: ColorMood): TemperatureConfig {
  switch (temperature) {
    case 'warm':
      return {
        saturationMultiplier: 1.1,
        lightnessShift: 2,
        accentSaturation: 75,
        backgroundWarmth: 3, // Slight warm tint
      };
    case 'cool':
      return {
        saturationMultiplier: 0.9,
        lightnessShift: -2,
        accentSaturation: 65,
        backgroundWarmth: -3, // Slight cool tint
      };
    case 'neutral':
    default:
      return {
        saturationMultiplier: 1.0,
        lightnessShift: 0,
        accentSaturation: 70,
        backgroundWarmth: 0,
      };
  }
}

/**
 * Shift hue towards warm or cool based on temperature
 */
function applyTemperatureToHue(hue: number, temperature: ColorMood): number {
  if (temperature === 'warm') {
    // Shift towards warm colors (reds, oranges, yellows: 0-60, 300-360)
    if (hue >= 180 && hue < 300) {
      // Cool colors - shift towards warm
      return (hue + 30) % 360;
    }
  } else if (temperature === 'cool') {
    // Shift towards cool colors (blues, greens, purples: 120-300)
    if (hue < 120 || hue >= 300) {
      // Warm colors - shift towards cool
      return (hue + 150) % 360;
    }
  }
  return hue;
}

/**
 * Generate palette from a single seed/primary color
 * Temperature affects saturation, lightness, and subtle hue shifts
 * Respects locked colors and ensures all text colors meet WCAG AA contrast
 */
export function generateFromSeed(
  seedColor: string,
  mode: HarmonyMode = 'complementary',
  temperature: ColorMood = 'neutral',
  currentColors?: ColorPalette,
  locked?: LockedColors
): ColorPalette {
  const seedHsl = hexToHsl(seedColor);
  const baseHue = seedHsl.h;
  const config = getTemperatureConfig(temperature);

  let hues: number[];

  switch (mode) {
    case 'complementary':
      hues = generateComplementary(baseHue);
      break;
    case 'analogous':
      hues = generateAnalogous(baseHue);
      break;
    case 'triadic':
      hues = generateTriadic(baseHue);
      break;
    case 'split-complementary':
      hues = generateSplitComplementary(baseHue);
      break;
    case 'monochromatic':
    default:
      hues = [baseHue, baseHue, baseHue];
  }

  // Apply temperature shifts to derived hues (not the primary)
  const adjustedHues = hues.map((h, i) =>
    i === 0 ? h : applyTemperatureToHue(h, temperature)
  );

  // Determine background - use locked value or generate new
  let background: string;
  if (currentColors && locked?.background) {
    background = currentColors.background;
  } else {
    const bgHue = temperature === 'warm' ? 40 : temperature === 'cool' ? 220 : baseHue;
    background = hslToHex({
      h: bgHue,
      s: Math.abs(config.backgroundWarmth),
      l: 98
    });
  }

  // Secondary color - derived from harmony with temperature adjustment
  const secondarySaturation = Math.min(100, Math.max(20, 45 * config.saturationMultiplier));
  const secondaryLightness = Math.min(70, Math.max(30, 50 + config.lightnessShift));
  const secondaryHsl: HSL = {
    h: adjustedHues[1] || baseHue,
    s: secondarySaturation,
    l: secondaryLightness
  };

  // Neutral - desaturated version of primary with temperature shift
  const neutralHsl: HSL = {
    h: baseHue,
    s: 10,
    l: Math.max(15, 25 + config.lightnessShift)
  };

  // Accent - vibrant complement/harmony color
  const accentHue = adjustedHues[adjustedHues.length - 1] || (baseHue + 180) % 360;
  const accentHsl: HSL = {
    h: accentHue,
    s: config.accentSaturation,
    l: 50 + config.lightnessShift
  };

  // Generate base palette with contrast-safe colors
  // Primary also needs contrast checking against the background
  const primaryHsl = hexToHsl(seedColor);
  const contrastSafePrimary = hslToHex(ensureContrast(primaryHsl, background));

  const palette: ColorPalette = {
    primary: contrastSafePrimary,
    secondary: hslToHex(ensureContrast(secondaryHsl, background)),
    neutral: hslToHex(ensureContrast(neutralHsl, background)),
    background,
    accent: hslToHex(ensureContrast(accentHsl, background, 3.0)), // Accent needs less contrast
  };

  // Apply locked colors from current palette
  if (currentColors && locked) {
    if (locked.primary) palette.primary = currentColors.primary;
    if (locked.secondary) palette.secondary = currentColors.secondary;
    if (locked.neutral) palette.neutral = currentColors.neutral;
    if (locked.background) palette.background = currentColors.background;
    if (locked.accent) palette.accent = currentColors.accent;
  }

  return palette;
}

/**
 * Generate palette from primary with real-time preview
 * Returns both the palette and metadata about the generation
 */
export interface GeneratedPaletteResult {
  palette: ColorPalette;
  harmony: {
    mode: HarmonyMode;
    temperature: ColorMood;
    hues: number[];
  };
}

export function generateFromPrimaryWithMetadata(
  primaryColor: string,
  mode: HarmonyMode,
  temperature: ColorMood
): GeneratedPaletteResult {
  const seedHsl = hexToHsl(primaryColor);
  const baseHue = seedHsl.h;

  let hues: number[];
  switch (mode) {
    case 'complementary':
      hues = generateComplementary(baseHue);
      break;
    case 'analogous':
      hues = generateAnalogous(baseHue);
      break;
    case 'triadic':
      hues = generateTriadic(baseHue);
      break;
    case 'split-complementary':
      hues = generateSplitComplementary(baseHue);
      break;
    case 'monochromatic':
    default:
      hues = [baseHue];
  }

  return {
    palette: generateFromSeed(primaryColor, mode, temperature),
    harmony: {
      mode,
      temperature,
      hues,
    },
  };
}
