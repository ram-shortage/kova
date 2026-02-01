import { useMemo } from 'react';
import type { TemplateState, Layout, StyleFamily, MoodPreset } from '@kova/shared';

interface SlidePreviewProps {
  template: TemplateState;
  layout: Layout;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showLabel?: boolean;
  showRegions?: boolean; // Show region visualization instead of content
}

const sizes = {
  small: { width: 160, height: 90 },
  medium: { width: 320, height: 180 },
  large: { width: 640, height: 360 },
  fullscreen: { width: 1280, height: 720 }, // 16:9 HD, will scale to fit container
};

/**
 * Style family visual parameters
 * Each style family has dramatically distinct characteristics inspired by iconic brands
 * and design movements for instantly recognizable differentiation
 */
interface StyleParams {
  // Typography
  titleWeightMultiplier: number;
  bodyWeightMultiplier: number;
  letterSpacing: number;        // -0.05 to 0.2 em
  textTransform: 'none' | 'uppercase' | 'lowercase';

  // Spacing & Layout
  spacingMultiplier: number;
  gridVisible: boolean;         // Show grid lines (brutalist)
  asymmetric: boolean;          // Allow asymmetric layouts

  // Visual Elements
  accentThickness: number;
  accentOpacity: number;
  elementRoundness: number;     // 0 = sharp corners, 1 = rounded, 2 = pill
  decorativeElements: boolean;
  lineThickness: number;

  // Effects
  shadowOffset: number;         // Offset shadow (neubrutalist)
  shadowColor: string;          // Shadow color overlay
  borderThickness: number;      // Border around elements
  useGradients: boolean;        // Gradient fills

  // Chart/Data visualization style
  chartStyle: 'filled' | 'outlined' | 'minimal' | 'gradient' | 'stacked';
  dataPointStyle: 'circle' | 'square' | 'diamond' | 'none';
}

function getStyleFamilyParams(styleFamily: StyleFamily): StyleParams {
  switch (styleFamily) {
    // Apple-inspired: clean hierarchy, SF Pro aesthetic, subtle refinement
    case 'clean':
      return {
        titleWeightMultiplier: 1.0,
        bodyWeightMultiplier: 1.0,
        letterSpacing: 0,
        textTransform: 'none',
        spacingMultiplier: 1.0,
        gridVisible: false,
        asymmetric: false,
        accentThickness: 2,
        accentOpacity: 0.8,
        elementRoundness: 1.0,
        decorativeElements: false,
        lineThickness: 1.5,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 0,
        useGradients: false,
        chartStyle: 'filled',
        dataPointStyle: 'circle',
      };

    // Magazine-style: Vogue/GQ inspired bold typography with contrast
    case 'editorial':
      return {
        titleWeightMultiplier: 1.4,
        bodyWeightMultiplier: 0.85,
        letterSpacing: 0.1,
        textTransform: 'uppercase',
        spacingMultiplier: 0.9,
        gridVisible: false,
        asymmetric: true,
        accentThickness: 4,
        accentOpacity: 1.0,
        elementRoundness: 0,
        decorativeElements: true,
        lineThickness: 3,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 2,
        useGradients: false,
        chartStyle: 'outlined',
        dataPointStyle: 'square',
      };

    // Nike/Spotify inspired: high-impact, energetic, bold
    case 'bold':
      return {
        titleWeightMultiplier: 1.6,
        bodyWeightMultiplier: 1.2,
        letterSpacing: -0.02,
        textTransform: 'uppercase',
        spacingMultiplier: 0.85,
        gridVisible: false,
        asymmetric: false,
        accentThickness: 6,
        accentOpacity: 1.0,
        elementRoundness: 0.5,
        decorativeElements: true,
        lineThickness: 4,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 0,
        useGradients: true,
        chartStyle: 'gradient',
        dataPointStyle: 'circle',
      };

    // Muji/Aesop inspired: sparse elegance, lots of whitespace
    case 'minimal':
      return {
        titleWeightMultiplier: 0.8,
        bodyWeightMultiplier: 0.8,
        letterSpacing: 0.15,
        textTransform: 'none',
        spacingMultiplier: 1.5,
        gridVisible: false,
        asymmetric: false,
        accentThickness: 1,
        accentOpacity: 0.4,
        elementRoundness: 0,
        decorativeElements: false,
        lineThickness: 0.5,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 0.5,
        useGradients: false,
        chartStyle: 'minimal',
        dataPointStyle: 'none',
      };

    // Balenciaga/Yale Art School: raw, harsh, intentionally jarring
    case 'brutalist':
      return {
        titleWeightMultiplier: 1.8,
        bodyWeightMultiplier: 1.0,
        letterSpacing: -0.05,
        textTransform: 'uppercase',
        spacingMultiplier: 0.7,
        gridVisible: true,
        asymmetric: true,
        accentThickness: 8,
        accentOpacity: 1.0,
        elementRoundness: 0,
        decorativeElements: true,
        lineThickness: 5,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 4,
        useGradients: false,
        chartStyle: 'outlined',
        dataPointStyle: 'square',
      };

    // Modern brutalism: bold shadows, thick borders, bright accents
    case 'neubrutalist':
      return {
        titleWeightMultiplier: 1.5,
        bodyWeightMultiplier: 1.1,
        letterSpacing: 0,
        textTransform: 'none',
        spacingMultiplier: 0.9,
        gridVisible: false,
        asymmetric: false,
        accentThickness: 5,
        accentOpacity: 1.0,
        elementRoundness: 0.3,
        decorativeElements: true,
        lineThickness: 3,
        shadowOffset: 4,
        shadowColor: '#000000',
        borderThickness: 3,
        useGradients: false,
        chartStyle: 'filled',
        dataPointStyle: 'square',
      };

    // Apple product pages: modular compartmentalized boxes
    case 'bento':
      return {
        titleWeightMultiplier: 1.1,
        bodyWeightMultiplier: 1.0,
        letterSpacing: 0,
        textTransform: 'none',
        spacingMultiplier: 0.8,
        gridVisible: false,
        asymmetric: true,
        accentThickness: 0,
        accentOpacity: 0,
        elementRoundness: 1.5,
        decorativeElements: false,
        lineThickness: 0,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 0,
        useGradients: true,
        chartStyle: 'filled',
        dataPointStyle: 'circle',
      };

    // IBM/Swiss railways: grid-based precision, Helvetica aesthetic
    case 'swiss':
      return {
        titleWeightMultiplier: 1.2,
        bodyWeightMultiplier: 1.0,
        letterSpacing: 0.05,
        textTransform: 'none',
        spacingMultiplier: 1.0,
        gridVisible: true,
        asymmetric: false,
        accentThickness: 2,
        accentOpacity: 1.0,
        elementRoundness: 0,
        decorativeElements: false,
        lineThickness: 2,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 1,
        useGradients: false,
        chartStyle: 'outlined',
        dataPointStyle: 'circle',
      };

    // McKinsey/Deloitte: professional polish, structured layouts
    case 'corporate':
      return {
        titleWeightMultiplier: 1.1,
        bodyWeightMultiplier: 1.0,
        letterSpacing: 0.02,
        textTransform: 'none',
        spacingMultiplier: 1.1,
        gridVisible: false,
        asymmetric: false,
        accentThickness: 3,
        accentOpacity: 0.9,
        elementRoundness: 0.5,
        decorativeElements: false,
        lineThickness: 2,
        shadowOffset: 2,
        shadowColor: 'rgba(0,0,0,0.1)',
        borderThickness: 1,
        useGradients: false,
        chartStyle: 'stacked',
        dataPointStyle: 'circle',
      };

    // === ERA-BASED STYLES ===

    // 1920s glamour: geometric patterns, gold accents, angular sunburst motifs
    case 'artdeco':
      return {
        titleWeightMultiplier: 1.3,
        bodyWeightMultiplier: 0.9,
        letterSpacing: 0.15,              // Elegant spacing
        textTransform: 'uppercase',
        spacingMultiplier: 1.0,
        gridVisible: false,
        asymmetric: false,                // Symmetric elegance
        accentThickness: 3,
        accentOpacity: 1.0,
        elementRoundness: 0,              // Sharp geometric angles
        decorativeElements: true,         // Sunburst, fan patterns
        lineThickness: 2,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 2,
        useGradients: true,               // Gold gradients
        chartStyle: 'outlined',
        dataPointStyle: 'diamond',        // Angular points
      };

    // Groovy 70s: rounded shapes, warm feel, wavy organic lines
    case 'retro70s':
      return {
        titleWeightMultiplier: 1.4,
        bodyWeightMultiplier: 1.1,
        letterSpacing: 0,
        textTransform: 'none',            // Friendly lowercase
        spacingMultiplier: 0.9,
        gridVisible: false,
        asymmetric: true,                 // Playful asymmetry
        accentThickness: 5,
        accentOpacity: 1.0,
        elementRoundness: 2.0,            // Very rounded, bubble-like
        decorativeElements: true,         // Circles, waves
        lineThickness: 4,
        shadowOffset: 3,                  // Layered depth
        shadowColor: 'rgba(0,0,0,0.15)',
        borderThickness: 3,
        useGradients: true,               // Sunset gradients
        chartStyle: 'filled',
        dataPointStyle: 'circle',
      };

    // Late 90s/early 2000s: chrome, gradients, futuristic curves, glossy
    case 'y2k':
      return {
        titleWeightMultiplier: 1.2,
        bodyWeightMultiplier: 1.0,
        letterSpacing: 0.05,
        textTransform: 'none',
        spacingMultiplier: 0.95,
        gridVisible: false,
        asymmetric: true,                 // Dynamic asymmetry
        accentThickness: 2,
        accentOpacity: 0.9,
        elementRoundness: 1.5,            // Smooth curves
        decorativeElements: true,         // Stars, swooshes
        lineThickness: 2,
        shadowOffset: 2,                  // Glossy depth
        shadowColor: 'rgba(0,0,0,0.1)',
        borderThickness: 1,
        useGradients: true,               // Chrome gradients essential
        chartStyle: 'gradient',
        dataPointStyle: 'circle',
      };

    // === INDUSTRY STYLES ===

    // Silicon Valley: data-driven, grid-based, monospace, clean precision
    case 'tech':
      return {
        titleWeightMultiplier: 1.0,
        bodyWeightMultiplier: 0.95,
        letterSpacing: 0.03,
        textTransform: 'none',
        spacingMultiplier: 1.0,
        gridVisible: true,                // Data grid visible
        asymmetric: false,
        accentThickness: 2,
        accentOpacity: 0.8,
        elementRoundness: 0.3,            // Slightly rounded
        decorativeElements: false,        // Pure function
        lineThickness: 1.5,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 1,
        useGradients: false,              // Flat design
        chartStyle: 'filled',
        dataPointStyle: 'circle',
      };

    // === DESIGN MOVEMENT STYLES ===

    // 1920s German: primary colors, circles/squares/triangles, strict grid
    case 'bauhaus':
      return {
        titleWeightMultiplier: 1.4,
        bodyWeightMultiplier: 1.0,
        letterSpacing: 0.1,
        textTransform: 'uppercase',
        spacingMultiplier: 1.0,
        gridVisible: true,                // Grid is philosophy
        asymmetric: true,                 // Asymmetric balance
        accentThickness: 4,
        accentOpacity: 1.0,
        elementRoundness: 0,              // Pure geometric
        decorativeElements: true,         // Circles, squares, triangles
        lineThickness: 3,
        shadowOffset: 0,                  // Flat, no depth
        shadowColor: 'transparent',
        borderThickness: 3,
        useGradients: false,              // Solid primary colors
        chartStyle: 'filled',
        dataPointStyle: 'square',
      };

    // 1980s Italian: playful geometry, squiggles, dots, bold contrasts
    case 'memphis':
      return {
        titleWeightMultiplier: 1.3,
        bodyWeightMultiplier: 1.0,
        letterSpacing: 0.05,
        textTransform: 'none',
        spacingMultiplier: 0.9,
        gridVisible: false,
        asymmetric: true,                 // Intentionally chaotic
        accentThickness: 4,
        accentOpacity: 1.0,
        elementRoundness: 0.8,            // Mix of shapes
        decorativeElements: true,         // Squiggles, dots, triangles
        lineThickness: 3,
        shadowOffset: 4,                  // Offset shadows (signature)
        shadowColor: '#000000',
        borderThickness: 3,
        useGradients: false,              // Solid bold colors
        chartStyle: 'filled',
        dataPointStyle: 'square',
      };

    // Nordic: soft curves, natural feel, light, airy, minimal ornamentation
    case 'scandinavian':
      return {
        titleWeightMultiplier: 0.9,
        bodyWeightMultiplier: 0.9,
        letterSpacing: 0.08,
        textTransform: 'none',
        spacingMultiplier: 1.4,           // Lots of breathing room
        gridVisible: false,
        asymmetric: false,
        accentThickness: 1,
        accentOpacity: 0.5,
        elementRoundness: 0.8,            // Soft organic curves
        decorativeElements: false,        // Form follows function
        lineThickness: 1,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 0,
        useGradients: false,
        chartStyle: 'minimal',
        dataPointStyle: 'none',
      };

    // === MOOD-BASED STYLES ===

    // Sci-fi: glowing effects, angular geometry, tech-forward, neon lines
    case 'futuristic':
      return {
        titleWeightMultiplier: 1.2,
        bodyWeightMultiplier: 1.0,
        letterSpacing: 0.1,
        textTransform: 'uppercase',       // HUD-style
        spacingMultiplier: 1.0,
        gridVisible: true,                // Tech grid
        asymmetric: true,
        accentThickness: 2,
        accentOpacity: 1.0,
        elementRoundness: 0.2,            // Sharp with slight softening
        decorativeElements: true,         // Tech patterns, lines
        lineThickness: 2,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 1,
        useGradients: true,               // Glowing gradients
        chartStyle: 'gradient',
        dataPointStyle: 'circle',
      };

    // Natural: flowing curves, asymmetric, soft edges, nature-inspired
    case 'organic':
      return {
        titleWeightMultiplier: 1.0,
        bodyWeightMultiplier: 0.95,
        letterSpacing: 0.02,
        textTransform: 'none',
        spacingMultiplier: 1.2,
        gridVisible: false,
        asymmetric: true,                 // Natural asymmetry
        accentThickness: 3,
        accentOpacity: 0.7,
        elementRoundness: 2.5,            // Very rounded, blob-like
        decorativeElements: false,        // Let shapes breathe
        lineThickness: 2,
        shadowOffset: 1,                  // Soft natural shadow
        shadowColor: 'rgba(0,0,0,0.08)',
        borderThickness: 0,
        useGradients: true,               // Natural gradients
        chartStyle: 'filled',
        dataPointStyle: 'circle',
      };

    // High-end: thin lines, generous spacing, refined details, understated
    case 'luxury':
      return {
        titleWeightMultiplier: 0.85,
        bodyWeightMultiplier: 0.85,
        letterSpacing: 0.2,               // Generous letter spacing
        textTransform: 'uppercase',
        spacingMultiplier: 1.5,           // Generous white space
        gridVisible: false,
        asymmetric: false,
        accentThickness: 1,
        accentOpacity: 0.6,
        elementRoundness: 0.4,            // Subtle refinement
        decorativeElements: false,        // Less is more
        lineThickness: 0.75,
        shadowOffset: 1,                  // Subtle depth
        shadowColor: 'rgba(0,0,0,0.05)',
        borderThickness: 0.5,
        useGradients: false,
        chartStyle: 'minimal',
        dataPointStyle: 'none',
      };

    // Artisanal: imperfect shapes, sketch-like, warm, textured, human touch
    case 'handcrafted':
      return {
        titleWeightMultiplier: 1.1,
        bodyWeightMultiplier: 1.0,
        letterSpacing: 0,
        textTransform: 'none',            // Friendly, approachable
        spacingMultiplier: 1.1,
        gridVisible: false,
        asymmetric: true,                 // Imperfect, human
        accentThickness: 3,
        accentOpacity: 0.9,
        elementRoundness: 1.0,            // Slightly imperfect curves
        decorativeElements: true,         // Hand-drawn flourishes
        lineThickness: 2.5,               // Brush-stroke weight
        shadowOffset: 2,
        shadowColor: 'rgba(0,0,0,0.1)',
        borderThickness: 2,
        useGradients: false,              // Solid, authentic
        chartStyle: 'filled',
        dataPointStyle: 'circle',
      };

    // Factory: raw materials, exposed structure, utilitarian, bold, functional
    case 'industrial':
      return {
        titleWeightMultiplier: 1.5,
        bodyWeightMultiplier: 1.1,
        letterSpacing: 0.05,
        textTransform: 'uppercase',       // Stencil-like
        spacingMultiplier: 0.85,
        gridVisible: true,                // Exposed structure
        asymmetric: false,
        accentThickness: 6,
        accentOpacity: 1.0,
        elementRoundness: 0,              // Hard machine edges
        decorativeElements: false,        // Pure function
        lineThickness: 4,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 4,
        useGradients: false,              // Raw, unfinished
        chartStyle: 'outlined',
        dataPointStyle: 'square',
      };

    default:
      return {
        titleWeightMultiplier: 1.0,
        bodyWeightMultiplier: 1.0,
        letterSpacing: 0,
        textTransform: 'none',
        spacingMultiplier: 1.0,
        gridVisible: false,
        asymmetric: false,
        accentThickness: 2,
        accentOpacity: 0.8,
        elementRoundness: 1.0,
        decorativeElements: false,
        lineThickness: 1.5,
        shadowOffset: 0,
        shadowColor: 'transparent',
        borderThickness: 0,
        useGradients: false,
        chartStyle: 'filled',
        dataPointStyle: 'circle',
      };
  }
}

/**
 * Mood color adjustments
 * Moods dramatically affect how colors are applied, element styling, and overall feel
 */
interface MoodParams {
  colorIntensity: number;        // Overall color intensity (opacity multiplier)
  accentEmphasis: number;        // How prominent accents are
  elementScale: number;          // Scaling for decorative elements
  shadowIntensity: number;       // Depth/shadow intensity (0-1)
  lineStyle: 'sharp' | 'soft';   // Line ending style
  spacingModifier: number;       // Additional spacing multiplier
  saturationShift: number;       // Color saturation adjustment (-50 to +50)
  backgroundTint: string;        // Background tint color (hex with opacity)
  cornerRadiusMultiplier: number; // Affects corner roundness
  strokeDasharray: string;       // Line pattern (solid, dashed, etc.)
}

function getMoodParams(mood: MoodPreset): MoodParams {
  switch (mood) {
    case 'calm':
      // Relaxed, muted, soft - think spa/wellness brands
      return {
        colorIntensity: 0.7,
        accentEmphasis: 0.6,
        elementScale: 0.9,
        shadowIntensity: 0.08,
        lineStyle: 'soft',
        spacingModifier: 1.3,
        saturationShift: -20,
        backgroundTint: '#F5F5F0', // Warm off-white
        cornerRadiusMultiplier: 1.5,
        strokeDasharray: 'none',
      };
    case 'energetic':
      // Vibrant, dynamic, bold - think Nike/Spotify
      return {
        colorIntensity: 1.3,
        accentEmphasis: 1.6,
        elementScale: 1.2,
        shadowIntensity: 0.45,
        lineStyle: 'sharp',
        spacingModifier: 0.8,
        saturationShift: 25,
        backgroundTint: '#FFFFFF',
        cornerRadiusMultiplier: 0.5,
        strokeDasharray: 'none',
      };
    case 'premium':
      // Luxurious, elegant, refined - think Cartier/Rolls Royce
      return {
        colorIntensity: 0.85,
        accentEmphasis: 1.2,
        elementScale: 1.05,
        shadowIntensity: 0.2,
        lineStyle: 'soft',
        spacingModifier: 1.2,
        saturationShift: -5,
        backgroundTint: '#FAFAF8', // Cream
        cornerRadiusMultiplier: 0.8,
        strokeDasharray: 'none',
      };
    case 'technical':
      // Precise, data-focused, analytical - think Bloomberg/NASA
      return {
        colorIntensity: 1.0,
        accentEmphasis: 0.85,
        elementScale: 0.95,
        shadowIntensity: 0.05,
        lineStyle: 'sharp',
        spacingModifier: 0.95,
        saturationShift: -10,
        backgroundTint: '#F8FAFC', // Cool gray-blue
        cornerRadiusMultiplier: 0.3,
        strokeDasharray: '4 2',
      };
    default:
      return {
        colorIntensity: 1.0,
        accentEmphasis: 1.0,
        elementScale: 1.0,
        shadowIntensity: 0.2,
        lineStyle: 'sharp',
        spacingModifier: 1.0,
        saturationShift: 0,
        backgroundTint: '#FFFFFF',
        cornerRadiusMultiplier: 1.0,
        strokeDasharray: 'none',
      };
  }
}

/**
 * Apply mood intensity to a hex color by adjusting its opacity representation
 */
function adjustColorIntensity(hexColor: string, intensity: number): string {
  // Clamp intensity to valid range
  const clampedIntensity = Math.max(0.5, Math.min(1.5, intensity));
  // Convert intensity to 2-digit hex opacity (FF = full, 80 = half)
  if (clampedIntensity >= 1) {
    return hexColor; // Full intensity, no change
  }
  const opacity = Math.round(clampedIntensity * 255);
  const opacityHex = opacity.toString(16).padStart(2, '0').toUpperCase();
  return hexColor + opacityHex;
}

/**
 * Clamp font weight to valid CSS range
 */
function clampWeight(weight: number): number {
  return Math.max(100, Math.min(900, Math.round(weight / 100) * 100));
}

export function SlidePreview({
  template,
  layout,
  size = 'medium',
  showLabel = true,
  showRegions = false,
}: SlidePreviewProps) {
  const { width, height } = sizes[size];
  const { colors } = template.tokens;
  const { title: titleStyle, body: bodyStyle } = template.typography;

  // Get style family and mood parameters
  const styleParams = useMemo(() => getStyleFamilyParams(template.styleFamily), [template.styleFamily]);
  const moodParams = useMemo(() => getMoodParams(template.mood), [template.mood]);

  // Calculate scaled values - incorporate style family spacing AND mood spacing
  const scale = width / 960; // Base slide width is 960px
  const spacingMultiplier = template.spacingDensity * styleParams.spacingMultiplier * moodParams.spacingModifier;
  const baseSpacing = template.tokens.spacing.base * spacingMultiplier * scale;
  const typeScaleFactor = template.typeScale / 1.25;

  // Background color - always use the user's chosen background color
  // Mood tints are only applied if the user has a near-white background
  const isNearWhiteBackground = (() => {
    const hex = colors.background.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Consider it "near white" if all channels are > 240
    return r > 240 && g > 240 && b > 240;
  })();

  const moodBackground = isNearWhiteBackground && moodParams.backgroundTint !== '#FFFFFF'
    ? moodParams.backgroundTint
    : colors.background;

  // Grid dimensions for region calculations
  const gridWidth = width / layout.grid.columns;
  const gridHeight = height / layout.grid.rows;

  // Helper to get region bounds in pixels
  const getRegionBounds = (regionId: string) => {
    const region = layout.regions.find(r => r.id === regionId || r.role === regionId);
    if (!region) return null;
    return {
      x: region.bounds.x * gridWidth,
      y: region.bounds.y * gridHeight,
      w: region.bounds.w * gridWidth,
      h: region.bounds.h * gridHeight,
    };
  };

  // Get all regions of a specific role
  const getRegionsByRole = (role: string) => {
    return layout.regions
      .filter(r => r.role === role)
      .map(r => ({
        id: r.id,
        x: r.bounds.x * gridWidth,
        y: r.bounds.y * gridHeight,
        w: r.bounds.w * gridWidth,
        h: r.bounds.h * gridHeight,
      }));
  };

  // Calculate adjusted font weights based on style family
  const adjustedTitleWeight = clampWeight(titleStyle.weight * styleParams.titleWeightMultiplier);
  const adjustedBodyWeight = clampWeight(bodyStyle.weight * styleParams.bodyWeightMultiplier);

  // Apply contrast level to color opacity (50 is default, range 0-100)
  // Higher contrast = more intense colors, stronger visual separation
  const contrastFactor = template.contrastLevel / 50;

  // Combine mood and contrast effects for visual parameters
  const moodColorIntensity = moodParams.colorIntensity;
  const combinedIntensity = contrastFactor * moodColorIntensity;

  // Adjusted accent line properties based on style and mood
  const accentThickness = styleParams.accentThickness * scale * moodParams.accentEmphasis;
  const accentOpacity = styleParams.accentOpacity * Math.min(combinedIntensity, 1);
  const lineThickness = styleParams.lineThickness * scale;
  const elementRadius = template.tokens.radius.md * styleParams.elementRoundness * moodParams.cornerRadiusMultiplier * scale;
  const elementScale = moodParams.elementScale;
  const strokeDasharray = moodParams.strokeDasharray;

  // Apply mood to text colors - calm/technical are softer, energetic is more vibrant
  const titleColorOpacity = Math.min(Math.round(combinedIntensity * 255), 255).toString(16).padStart(2, '0');
  const bodyColorOpacity = Math.min(Math.round((combinedIntensity * 0.95) * 255), 255).toString(16).padStart(2, '0');

  // Mood-adjusted colors for text (apply intensity via opacity suffix)
  const adjustedPrimaryColor = combinedIntensity < 1
    ? colors.primary + titleColorOpacity
    : colors.primary;
  const adjustedNeutralColor = combinedIntensity < 1
    ? colors.neutral + bodyColorOpacity
    : colors.neutral;

  // Render special visualizations for specific layout types
  const specialContent = useMemo(() => {
    // Use the gridWidth/gridHeight from outer scope for region calculations

    // Helper function to determine chart type from layout
    const getChartTypeFromLayout = (layoutType: string): string => {
      if (layoutType.startsWith('data-')) {
        return layoutType.replace('data-', '');
      }
      // For legacy 'data' type, use style-based chart rendering
      return 'bar-vertical';
    };

    switch (layout.type) {
      // Handle all data/chart layout types
      case 'data':
      case 'data-bar-vertical':
      case 'data-bar-horizontal':
      case 'data-line':
      case 'data-pie':
      case 'data-donut':
      case 'data-scatter':
      case 'data-area':
      case 'data-stacked-bar': {
        // Find the chart/media region from the layout
        const chartRegion = layout.regions.find(r => r.role === 'media' || r.id === 'chart' || r.id === 'chart1');
        const chartX = chartRegion ? chartRegion.bounds.x * gridWidth + baseSpacing : gridWidth * 1.5;
        const chartY = chartRegion ? chartRegion.bounds.y * gridHeight + baseSpacing : gridHeight * 2.5;
        const chartW = chartRegion ? chartRegion.bounds.w * gridWidth - baseSpacing * 2 : gridWidth * 9;
        const chartH = chartRegion ? chartRegion.bounds.h * gridHeight - baseSpacing * 2 : gridHeight * 4;
        const barWidth = chartW / 6;
        const dataValues = [0.6, 0.85, 0.45, 0.95, 0.7];
        const barRadius = styleParams.elementRoundness * 4 * scale;
        const chartStyle = styleParams.chartStyle;
        const shadowOffset = styleParams.shadowOffset * scale;

        // Determine chart type from layout type
        const chartType = getChartTypeFromLayout(layout.type);

        // ===== LINE CHART =====
        if (chartType === 'line' || (layout.type === 'data' && chartStyle === 'minimal')) {
          return (
            <g>
              {/* Subtle baseline */}
              <line
                x1={chartX}
                x2={chartX + chartW}
                y1={chartY + chartH}
                y2={chartY + chartH}
                stroke={colors.neutral + '20'}
                strokeWidth={0.5 * scale}
              />
              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map((pct) => (
                <line
                  key={pct}
                  x1={chartX}
                  x2={chartX + chartW}
                  y1={chartY + chartH * (1 - pct)}
                  y2={chartY + chartH * (1 - pct)}
                  stroke={colors.neutral + '15'}
                  strokeWidth={0.5 * scale}
                />
              ))}
              {/* Line connecting points */}
              <polyline
                points={dataValues.map((h, i) =>
                  `${chartX + (chartW / (dataValues.length - 1)) * i},${chartY + chartH * (1 - h)}`
                ).join(' ')}
                fill="none"
                stroke={colors.primary}
                strokeWidth={2 * scale}
                strokeLinejoin="round"
              />
              {/* Data points */}
              {dataValues.map((h, i) => (
                <g key={i}>
                  <circle
                    cx={chartX + (chartW / (dataValues.length - 1)) * i}
                    cy={chartY + chartH * (1 - h)}
                    r={4 * scale}
                    fill={colors.background}
                    stroke={i === 3 ? colors.accent : colors.primary}
                    strokeWidth={2 * scale}
                  />
                </g>
              ))}
              {/* X-axis labels */}
              {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((label, i) => (
                <text
                  key={label}
                  x={chartX + (chartW / 4) * i}
                  y={chartY + chartH + 12 * scale}
                  fontSize={6 * scale}
                  fill={colors.neutral + 'AA'}
                  textAnchor="middle"
                >
                  {label}
                </text>
              ))}
            </g>
          );
        }

        // ===== AREA CHART =====
        if (chartType === 'area') {
          const areaPath = `M ${chartX},${chartY + chartH} ` +
            dataValues.map((h, i) =>
              `L ${chartX + (chartW / (dataValues.length - 1)) * i},${chartY + chartH * (1 - h)}`
            ).join(' ') +
            ` L ${chartX + chartW},${chartY + chartH} Z`;

          const gradientId = `area-grad-${layout.name}`;
          return (
            <g>
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors.primary} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={colors.primary} stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map((pct) => (
                <line
                  key={pct}
                  x1={chartX}
                  x2={chartX + chartW}
                  y1={chartY + chartH * (1 - pct)}
                  y2={chartY + chartH * (1 - pct)}
                  stroke={colors.neutral + '15'}
                  strokeWidth={0.5 * scale}
                />
              ))}
              {/* Area fill */}
              <path
                d={areaPath}
                fill={`url(#${gradientId})`}
              />
              {/* Line on top */}
              <polyline
                points={dataValues.map((h, i) =>
                  `${chartX + (chartW / (dataValues.length - 1)) * i},${chartY + chartH * (1 - h)}`
                ).join(' ')}
                fill="none"
                stroke={colors.primary}
                strokeWidth={2 * scale}
                strokeLinejoin="round"
              />
              {/* Data points */}
              {dataValues.map((h, i) => (
                <circle
                  key={i}
                  cx={chartX + (chartW / (dataValues.length - 1)) * i}
                  cy={chartY + chartH * (1 - h)}
                  r={3 * scale}
                  fill={i === 3 ? colors.accent : colors.primary}
                />
              ))}
              {/* Baseline */}
              <line
                x1={chartX}
                x2={chartX + chartW}
                y1={chartY + chartH}
                y2={chartY + chartH}
                stroke={colors.neutral + '30'}
                strokeWidth={1 * scale}
              />
            </g>
          );
        }

        // ===== PIE CHART =====
        if (chartType === 'pie') {
          const pieData = [0.35, 0.25, 0.20, 0.12, 0.08];
          const pieColors = [colors.primary, colors.secondary, colors.accent, colors.primary + '80', colors.secondary + '80'];
          const centerX = chartX + chartW / 2;
          const centerY = chartY + chartH / 2;
          const radius = Math.min(chartW, chartH) / 2 - 10 * scale;

          let startAngle = -90; // Start from top
          return (
            <g>
              {pieData.map((value, i) => {
                const angle = value * 360;
                const endAngle = startAngle + angle;
                const largeArc = angle > 180 ? 1 : 0;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = centerX + radius * Math.cos(startRad);
                const y1 = centerY + radius * Math.sin(startRad);
                const x2 = centerX + radius * Math.cos(endRad);
                const y2 = centerY + radius * Math.sin(endRad);

                const pathD = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                startAngle = endAngle;

                return (
                  <path
                    key={i}
                    d={pathD}
                    fill={pieColors[i]}
                    stroke={colors.background}
                    strokeWidth={2 * scale}
                  />
                );
              })}
              {/* Legend */}
              {['Product A', 'Product B', 'Product C', 'Product D', 'Other'].map((label, i) => (
                <g key={label} transform={`translate(${chartX + chartW + 10 * scale}, ${chartY + 10 + i * 14 * scale})`}>
                  <rect width={8 * scale} height={8 * scale} fill={pieColors[i]} rx={2 * scale} />
                  <text x={12 * scale} y={7 * scale} fontSize={6 * scale} fill={colors.neutral}>{label}</text>
                </g>
              ))}
            </g>
          );
        }

        // ===== DONUT CHART =====
        if (chartType === 'donut') {
          const pieData = [0.35, 0.25, 0.20, 0.12, 0.08];
          const pieColors = [colors.primary, colors.secondary, colors.accent, colors.primary + '80', colors.secondary + '80'];
          const centerX = chartX + chartW / 2;
          const centerY = chartY + chartH / 2;
          const outerRadius = Math.min(chartW, chartH) / 2 - 10 * scale;
          const innerRadius = outerRadius * 0.6;

          let startAngle = -90;
          return (
            <g>
              {pieData.map((value, i) => {
                const angle = value * 360;
                const endAngle = startAngle + angle;
                const largeArc = angle > 180 ? 1 : 0;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const outerX1 = centerX + outerRadius * Math.cos(startRad);
                const outerY1 = centerY + outerRadius * Math.sin(startRad);
                const outerX2 = centerX + outerRadius * Math.cos(endRad);
                const outerY2 = centerY + outerRadius * Math.sin(endRad);

                const innerX1 = centerX + innerRadius * Math.cos(startRad);
                const innerY1 = centerY + innerRadius * Math.sin(startRad);
                const innerX2 = centerX + innerRadius * Math.cos(endRad);
                const innerY2 = centerY + innerRadius * Math.sin(endRad);

                const pathD = `M ${outerX1} ${outerY1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerX2} ${outerY2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerX1} ${innerY1} Z`;

                startAngle = endAngle;

                return (
                  <path
                    key={i}
                    d={pathD}
                    fill={pieColors[i]}
                    stroke={colors.background}
                    strokeWidth={2 * scale}
                  />
                );
              })}
              {/* Center text */}
              <text
                x={centerX}
                y={centerY - 5 * scale}
                fontSize={14 * scale}
                fill={colors.primary}
                textAnchor="middle"
                fontWeight={600}
              >
                $2.4M
              </text>
              <text
                x={centerX}
                y={centerY + 10 * scale}
                fontSize={6 * scale}
                fill={colors.neutral + 'AA'}
                textAnchor="middle"
              >
                Total Revenue
              </text>
            </g>
          );
        }

        // ===== SCATTER PLOT =====
        if (chartType === 'scatter') {
          const scatterData = [
            { x: 0.15, y: 0.3 }, { x: 0.25, y: 0.45 }, { x: 0.35, y: 0.55 },
            { x: 0.45, y: 0.5 }, { x: 0.5, y: 0.7 }, { x: 0.55, y: 0.65 },
            { x: 0.65, y: 0.75 }, { x: 0.75, y: 0.8 }, { x: 0.85, y: 0.85 },
            { x: 0.2, y: 0.2 }, { x: 0.4, y: 0.35 }, { x: 0.6, y: 0.6 },
          ];

          return (
            <g>
              {/* Grid */}
              {[0.25, 0.5, 0.75].map((pct) => (
                <g key={pct}>
                  <line
                    x1={chartX}
                    x2={chartX + chartW}
                    y1={chartY + chartH * (1 - pct)}
                    y2={chartY + chartH * (1 - pct)}
                    stroke={colors.neutral + '15'}
                    strokeWidth={0.5 * scale}
                  />
                  <line
                    x1={chartX + chartW * pct}
                    x2={chartX + chartW * pct}
                    y1={chartY}
                    y2={chartY + chartH}
                    stroke={colors.neutral + '15'}
                    strokeWidth={0.5 * scale}
                  />
                </g>
              ))}
              {/* Axes */}
              <line
                x1={chartX}
                x2={chartX + chartW}
                y1={chartY + chartH}
                y2={chartY + chartH}
                stroke={colors.neutral + '40'}
                strokeWidth={1 * scale}
              />
              <line
                x1={chartX}
                x2={chartX}
                y1={chartY}
                y2={chartY + chartH}
                stroke={colors.neutral + '40'}
                strokeWidth={1 * scale}
              />
              {/* Data points */}
              {scatterData.map((point, i) => (
                <circle
                  key={i}
                  cx={chartX + point.x * chartW}
                  cy={chartY + chartH * (1 - point.y)}
                  r={4 * scale}
                  fill={i < 6 ? colors.primary : colors.accent}
                  opacity={0.7}
                />
              ))}
              {/* Trend line */}
              <line
                x1={chartX + chartW * 0.1}
                x2={chartX + chartW * 0.9}
                y1={chartY + chartH * 0.8}
                y2={chartY + chartH * 0.15}
                stroke={colors.secondary}
                strokeWidth={1.5 * scale}
                strokeDasharray={`${4 * scale} ${2 * scale}`}
              />
            </g>
          );
        }

        // ===== HORIZONTAL BAR CHART =====
        if (chartType === 'bar-horizontal') {
          const categories = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
          const hBarHeight = chartH / (categories.length + 1);

          return (
            <g>
              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((pct) => (
                <line
                  key={pct}
                  x1={chartX + chartW * pct}
                  x2={chartX + chartW * pct}
                  y1={chartY}
                  y2={chartY + chartH}
                  stroke={colors.neutral + '20'}
                  strokeWidth={0.5 * scale}
                />
              ))}
              {/* Horizontal bars */}
              {dataValues.map((w, i) => (
                <g key={i}>
                  {/* Shadow for neubrutalist */}
                  {shadowOffset > 0 && (
                    <rect
                      x={chartX + shadowOffset}
                      y={chartY + i * hBarHeight + hBarHeight * 0.2 + shadowOffset}
                      width={chartW * w}
                      height={hBarHeight * 0.6}
                      fill={styleParams.shadowColor}
                    />
                  )}
                  <rect
                    x={chartX}
                    y={chartY + i * hBarHeight + hBarHeight * 0.2}
                    width={chartW * w}
                    height={hBarHeight * 0.6}
                    fill={i === 3 ? colors.accent : colors.primary}
                    rx={barRadius}
                  />
                  {/* Value label */}
                  <text
                    x={chartX + chartW * w + 5 * scale}
                    y={chartY + i * hBarHeight + hBarHeight * 0.55}
                    fontSize={6 * scale}
                    fill={colors.neutral}
                  >
                    {Math.round(w * 100)}%
                  </text>
                </g>
              ))}
              {/* Y-axis labels */}
              {categories.map((label, i) => (
                <text
                  key={label}
                  x={chartX - 5 * scale}
                  y={chartY + i * hBarHeight + hBarHeight * 0.55}
                  fontSize={6 * scale}
                  fill={colors.neutral}
                  textAnchor="end"
                >
                  {label}
                </text>
              ))}
            </g>
          );
        }

        // ===== STACKED BAR CHART =====
        if (chartType === 'stacked-bar' || (layout.type === 'data' && chartStyle === 'stacked')) {
          const stackData = [
            [0.3, 0.2, 0.5],
            [0.4, 0.35, 0.25],
            [0.2, 0.5, 0.3],
            [0.35, 0.25, 0.4],
          ];
          const stackColors = [colors.primary, colors.secondary, colors.accent];
          const stackBarWidth = chartW / (stackData.length + 1);

          return (
            <g>
              {/* Background */}
              <rect
                x={chartX}
                y={chartY}
                width={chartW}
                height={chartH}
                fill={colors.neutral + '05'}
                rx={elementRadius}
              />
              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map((pct) => (
                <line
                  key={pct}
                  x1={chartX}
                  x2={chartX + chartW}
                  y1={chartY + chartH * (1 - pct)}
                  y2={chartY + chartH * (1 - pct)}
                  stroke={colors.neutral + '15'}
                  strokeWidth={0.5 * scale}
                />
              ))}
              {/* Stacked vertical bars */}
              {stackData.map((stack, barIdx) => {
                let yOffset = 0;
                const barX = chartX + (barIdx + 0.5) * stackBarWidth;
                return (
                  <g key={barIdx}>
                    {stack.map((val, segIdx) => {
                      const segHeight = val * chartH;
                      const segY = chartY + chartH - yOffset - segHeight;
                      yOffset += segHeight;
                      return (
                        <rect
                          key={segIdx}
                          x={barX}
                          y={segY}
                          width={stackBarWidth * 0.7}
                          height={segHeight - 1 * scale}
                          fill={stackColors[segIdx]}
                          rx={barRadius}
                        />
                      );
                    })}
                    {/* Label */}
                    <text
                      x={barX + stackBarWidth * 0.35}
                      y={chartY + chartH + 10 * scale}
                      fontSize={6 * scale}
                      fill={colors.neutral}
                      textAnchor="middle"
                    >
                      Q{barIdx + 1}
                    </text>
                  </g>
                );
              })}
              {/* Legend */}
              {['Series A', 'Series B', 'Series C'].map((label, i) => (
                <g key={label} transform={`translate(${chartX + chartW - 60 * scale + i * 25 * scale}, ${chartY - 12 * scale})`}>
                  <rect width={6 * scale} height={6 * scale} fill={stackColors[i]} rx={1 * scale} />
                  <text x={8 * scale} y={5 * scale} fontSize={5 * scale} fill={colors.neutral}>{label}</text>
                </g>
              ))}
            </g>
          );
        }

        // ===== VERTICAL BAR CHART (DEFAULT) =====
        // For data-bar-vertical, data with outlined style, gradient style, or default filled style
        if (chartStyle === 'outlined') {
          return (
            <g>
              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((pct) => (
                <line
                  key={pct}
                  x1={chartX}
                  x2={chartX + chartW}
                  y1={chartY + chartH * (1 - pct)}
                  y2={chartY + chartH * (1 - pct)}
                  stroke={colors.neutral + '30'}
                  strokeWidth={1 * scale}
                />
              ))}
              {/* Outlined bars */}
              {dataValues.map((h, i) => (
                <rect
                  key={i}
                  x={chartX + barWidth * 0.5 + i * barWidth * 1.1}
                  y={chartY + chartH * (1 - h)}
                  width={barWidth * 0.8}
                  height={chartH * h}
                  fill="none"
                  stroke={i === 3 ? colors.accent : colors.primary}
                  strokeWidth={styleParams.borderThickness * scale}
                />
              ))}
              {/* Value labels */}
              {dataValues.map((h, i) => (
                <text
                  key={`val-${i}`}
                  x={chartX + barWidth * 0.5 + i * barWidth * 1.1 + barWidth * 0.4}
                  y={chartY + chartH * (1 - h) - 4 * scale}
                  fontSize={6 * scale}
                  fill={colors.neutral}
                  textAnchor="middle"
                >
                  {Math.round(h * 100)}
                </text>
              ))}
            </g>
          );
        }

        if (chartStyle === 'gradient') {
          const gradientId = `grad-${layout.name}`;
          return (
            <g>
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor={colors.primary} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={colors.primary} stopOpacity="1" />
                </linearGradient>
                <linearGradient id={`${gradientId}-accent`} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor={colors.accent} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={colors.accent} stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Gradient bars */}
              {dataValues.map((h, i) => (
                <rect
                  key={i}
                  x={chartX + barWidth * 0.4 + i * barWidth * 1.15}
                  y={chartY + chartH * (1 - h)}
                  width={barWidth * 0.9}
                  height={chartH * h}
                  fill={i === 3 ? `url(#${gradientId}-accent)` : `url(#${gradientId})`}
                  rx={barRadius}
                />
              ))}
              {/* Highlight line */}
              <line
                x1={chartX + barWidth * 0.4 + 3 * barWidth * 1.15}
                x2={chartX + barWidth * 0.4 + 3 * barWidth * 1.15 + barWidth * 0.9}
                y1={chartY + chartH * (1 - dataValues[3]) + 2 * scale}
                y2={chartY + chartH * (1 - dataValues[3]) + 2 * scale}
                stroke={colors.background}
                strokeWidth={2 * scale}
                opacity={0.5}
              />
            </g>
          );
        }

        // Default: filled vertical bars
        return (
          <g>
            {/* Neubrutalist shadow offset */}
            {shadowOffset > 0 && dataValues.map((h, i) => (
              <rect
                key={`shadow-${i}`}
                x={chartX + barWidth * 0.5 + i * barWidth * 1.1 + shadowOffset}
                y={chartY + chartH * (1 - h) + shadowOffset}
                width={barWidth * 0.8}
                height={chartH * h}
                fill={styleParams.shadowColor}
              />
            ))}
            {/* Chart background for brutalist grid */}
            {styleParams.gridVisible && (
              <g>
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                  <line
                    key={`h-${pct}`}
                    x1={chartX}
                    x2={chartX + chartW}
                    y1={chartY + chartH * pct}
                    y2={chartY + chartH * pct}
                    stroke={colors.neutral}
                    strokeWidth={1 * scale}
                  />
                ))}
                {dataValues.map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={chartX + barWidth * 0.5 + i * barWidth * 1.1 + barWidth * 0.4}
                    x2={chartX + barWidth * 0.5 + i * barWidth * 1.1 + barWidth * 0.4}
                    y1={chartY}
                    y2={chartY + chartH}
                    stroke={colors.neutral + '40'}
                    strokeWidth={1 * scale}
                  />
                ))}
              </g>
            )}
            {/* Filled bars */}
            {dataValues.map((h, i) => (
              <g key={i}>
                <rect
                  x={chartX + barWidth * 0.5 + i * barWidth * 1.1}
                  y={chartY + chartH * (1 - h)}
                  width={barWidth * 0.8}
                  height={chartH * h}
                  fill={i === 3 ? colors.accent : colors.primary}
                  rx={barRadius}
                  stroke={styleParams.borderThickness > 0 ? colors.neutral : 'none'}
                  strokeWidth={styleParams.borderThickness * scale}
                />
                {/* Data point marker for swiss/corporate */}
                {styleParams.dataPointStyle === 'circle' && styleParams.borderThickness > 0 && (
                  <circle
                    cx={chartX + barWidth * 0.5 + i * barWidth * 1.1 + barWidth * 0.4}
                    cy={chartY + chartH * (1 - h)}
                    r={3 * scale}
                    fill={colors.background}
                    stroke={i === 3 ? colors.accent : colors.primary}
                    strokeWidth={1.5 * scale}
                  />
                )}
              </g>
            ))}
          </g>
        );
      }

      case 'timeline': {
        const points = 4;
        const milestones = ['Research', 'Design', 'Build', 'Launch'];
        const years = [2024, 2025, 2026, 2027];
        const shadowOffset = styleParams.shadowOffset * scale;

        // Bento style: Card-based timeline
        if (template.styleFamily === 'bento') {
          const cardW = width * 0.18;
          const cardH = height * 0.35;
          const cardY = height * 0.35;
          return (
            <g>
              {Array.from({ length: points }).map((_, i) => {
                const cardX = width * 0.08 + i * (cardW + width * 0.04);
                return (
                  <g key={i}>
                    {/* Card with rounded corners */}
                    <rect
                      x={cardX}
                      y={cardY}
                      width={cardW}
                      height={cardH}
                      fill={i === 1 ? colors.accent + '20' : colors.secondary + '10'}
                      rx={12 * scale}
                    />
                    {/* Year badge */}
                    <rect
                      x={cardX + 6 * scale}
                      y={cardY + 6 * scale}
                      width={cardW * 0.5}
                      height={14 * scale}
                      fill={i === 1 ? colors.accent : colors.primary}
                      rx={7 * scale}
                    />
                    <text
                      x={cardX + 6 * scale + cardW * 0.25}
                      y={cardY + 15 * scale}
                      fontSize={7 * scale}
                      fill={colors.background}
                      textAnchor="middle"
                    >
                      {years[i]}
                    </text>
                    {/* Milestone text placeholder */}
                    <rect
                      x={cardX + 8 * scale}
                      y={cardY + cardH - 20 * scale}
                      width={cardW * 0.7}
                      height={6 * scale}
                      fill={colors.neutral + '40'}
                      rx={3 * scale}
                    />
                  </g>
                );
              })}
            </g>
          );
        }

        // Brutalist/Swiss: Vertical timeline with grid
        if (template.styleFamily === 'brutalist' || template.styleFamily === 'swiss') {
          const startY = height * 0.2;
          const endY = height * 0.85;
          const lineX = width * 0.15;
          return (
            <g>
              {/* Vertical line */}
              <line
                x1={lineX}
                x2={lineX}
                y1={startY}
                y2={endY}
                stroke={colors.neutral}
                strokeWidth={styleParams.borderThickness * scale}
              />
              {/* Horizontal grid lines */}
              {Array.from({ length: points }).map((_, i) => {
                const y = startY + ((endY - startY) / (points - 1)) * i;
                return (
                  <g key={i}>
                    <line
                      x1={lineX}
                      x2={width * 0.9}
                      y1={y}
                      y2={y}
                      stroke={colors.neutral + '30'}
                      strokeWidth={1 * scale}
                    />
                    {/* Square marker */}
                    <rect
                      x={lineX - 6 * scale}
                      y={y - 6 * scale}
                      width={12 * scale}
                      height={12 * scale}
                      fill={i === 1 ? colors.accent : colors.primary}
                    />
                    {/* Year */}
                    <text
                      x={lineX + 15 * scale}
                      y={y + 4 * scale}
                      fontSize={10 * scale}
                      fill={colors.neutral}
                      fontWeight={700}
                    >
                      {years[i]}
                    </text>
                    {/* Milestone line */}
                    <rect
                      x={lineX + 60 * scale}
                      y={y - 3 * scale}
                      width={width * 0.4}
                      height={6 * scale}
                      fill={colors.neutral + '30'}
                    />
                  </g>
                );
              })}
            </g>
          );
        }

        // Neubrutalist: Cards with shadow offset
        if (template.styleFamily === 'neubrutalist') {
          const lineY = height * 0.5;
          const startX = width * 0.1;
          const endX = width * 0.9;
          return (
            <g>
              {/* Timeline */}
              <line
                x1={startX}
                x2={endX}
                y1={lineY}
                y2={lineY}
                stroke={colors.neutral}
                strokeWidth={3 * scale}
              />
              {Array.from({ length: points }).map((_, i) => {
                const x = startX + ((endX - startX) / (points - 1)) * i;
                const cardW = 45 * scale;
                const cardH = 30 * scale;
                return (
                  <g key={i}>
                    {/* Shadow */}
                    <rect
                      x={x - cardW / 2 + shadowOffset}
                      y={lineY - cardH - 10 * scale + shadowOffset}
                      width={cardW}
                      height={cardH}
                      fill={styleParams.shadowColor}
                    />
                    {/* Card */}
                    <rect
                      x={x - cardW / 2}
                      y={lineY - cardH - 10 * scale}
                      width={cardW}
                      height={cardH}
                      fill={i === 1 ? colors.accent : colors.background}
                      stroke={colors.neutral}
                      strokeWidth={2 * scale}
                    />
                    {/* Year */}
                    <text
                      x={x}
                      y={lineY - cardH / 2 - 5 * scale}
                      fontSize={9 * scale}
                      fill={i === 1 ? colors.background : colors.neutral}
                      textAnchor="middle"
                      fontWeight={700}
                    >
                      {years[i]}
                    </text>
                    {/* Connector */}
                    <line
                      x1={x}
                      x2={x}
                      y1={lineY - 10 * scale}
                      y2={lineY}
                      stroke={colors.neutral}
                      strokeWidth={2 * scale}
                    />
                    {/* Point */}
                    <rect
                      x={x - 5 * scale}
                      y={lineY - 5 * scale}
                      width={10 * scale}
                      height={10 * scale}
                      fill={i === 1 ? colors.accent : colors.primary}
                      stroke={colors.neutral}
                      strokeWidth={2 * scale}
                    />
                  </g>
                );
              })}
            </g>
          );
        }

        // Default: Horizontal timeline with circles
        const lineY = height * 0.55;
        const startX = width * 0.1;
        const endX = width * 0.9;
        const pointRadius = (styleParams.titleWeightMultiplier > 1.2 ? 8 : 6) * scale;
        const timelineThickness = lineThickness * 1.5;

        return (
          <g>
            {/* Timeline line */}
            <line
              x1={startX}
              x2={endX}
              y1={lineY}
              y2={lineY}
              stroke={colors.secondary}
              strokeWidth={timelineThickness}
            />
            {/* Editorial/Bold: Add arrow at end */}
            {styleParams.decorativeElements && (
              <polygon
                points={`${endX},${lineY} ${endX - 8 * scale},${lineY - 4 * scale} ${endX - 8 * scale},${lineY + 4 * scale}`}
                fill={colors.secondary}
              />
            )}
            {/* Timeline points */}
            {Array.from({ length: points }).map((_, i) => {
              const x = startX + ((endX - startX) / (points - 1)) * i;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={lineY}
                    r={pointRadius}
                    fill={i === 1 ? colors.accent : colors.primary}
                    stroke={colors.background}
                    strokeWidth={lineThickness}
                  />
                  <text
                    x={x}
                    y={lineY - 14 * scale}
                    fontSize={8 * scale * typeScaleFactor}
                    fill={colors.neutral}
                    textAnchor="middle"
                    fontWeight={adjustedBodyWeight}
                  >
                    {years[i]}
                  </text>
                  <text
                    x={x}
                    y={lineY + 20 * scale}
                    fontSize={6 * scale * typeScaleFactor}
                    fill={colors.neutral + 'AA'}
                    textAnchor="middle"
                  >
                    {['Q1', 'Q2', 'Q3', 'Q4'][i]}
                  </text>
                </g>
              );
            })}
          </g>
        );
      }

      case 'comparison': {
        const shadowOffset = styleParams.shadowOffset * scale;

        // Clean style: Elegant side-by-side with subtle gradients
        if (template.styleFamily === 'clean') {
          const cardW = width * 0.4;
          const cardH = height * 0.55;
          const cardY = height * 0.28;
          const gap = width * 0.05;
          return (
            <g>
              {/* Left card with subtle gradient */}
              <defs>
                <linearGradient id="clean-grad-l" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors.primary} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={colors.primary} stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="clean-grad-r" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <rect x={width * 0.075} y={cardY} width={cardW} height={cardH} fill="url(#clean-grad-l)" rx={12 * scale} />
              <rect x={width * 0.075} y={cardY} width={cardW} height={cardH} fill="none" stroke={colors.primary + '20'} strokeWidth={1 * scale} rx={12 * scale} />
              <text x={width * 0.075 + cardW / 2} y={cardY + 18 * scale} fontSize={9 * scale} fill={colors.primary} textAnchor="middle" fontWeight={500}>Option A</text>
              {[0, 1, 2].map((i) => (
                <rect key={`l-${i}`} x={width * 0.095} y={cardY + 30 + i * 16 * scale} width={cardW * (0.75 - i * 0.1)} height={5 * scale} fill={colors.neutral + '25'} rx={2.5 * scale} />
              ))}
              {/* Checkmark indicators */}
              <circle cx={width * 0.095 + cardW * 0.8} cy={cardY + 35 * scale} r={6 * scale} fill={colors.accent + '20'} />
              <path d={`M ${width * 0.095 + cardW * 0.8 - 3 * scale} ${cardY + 35 * scale} l 2 2 l 4 -4`} stroke={colors.accent} strokeWidth={1.5 * scale} fill="none" />

              {/* Right card */}
              <rect x={width * 0.525} y={cardY} width={cardW} height={cardH} fill="url(#clean-grad-r)" rx={12 * scale} />
              <rect x={width * 0.525} y={cardY} width={cardW} height={cardH} fill="none" stroke={colors.secondary + '20'} strokeWidth={1 * scale} rx={12 * scale} />
              <text x={width * 0.525 + cardW / 2} y={cardY + 18 * scale} fontSize={9 * scale} fill={colors.secondary} textAnchor="middle" fontWeight={500}>Option B</text>
              {[0, 1, 2].map((i) => (
                <rect key={`r-${i}`} x={width * 0.545} y={cardY + 30 + i * 16 * scale} width={cardW * (0.7 - i * 0.08)} height={5 * scale} fill={colors.neutral + '25'} rx={2.5 * scale} />
              ))}
            </g>
          );
        }

        // Editorial style: Magazine layout with dramatic typography hierarchy
        if (template.styleFamily === 'editorial') {
          const colW = width * 0.38;
          const colY = height * 0.25;
          const colH = height * 0.6;
          return (
            <g>
              {/* Large "VS" in background */}
              <text x={width / 2} y={height * 0.65} fontSize={80 * scale} fill={colors.neutral + '08'} textAnchor="middle" fontWeight={900} fontFamily="Georgia, serif">VS</text>
              {/* Vertical divider */}
              <line x1={width / 2} x2={width / 2} y1={colY} y2={colY + colH} stroke={colors.neutral} strokeWidth={2 * scale} />
              {/* Left column */}
              <text x={width * 0.08} y={colY + 20 * scale} fontSize={16 * scale} fill={colors.primary} fontWeight={700} fontFamily="Georgia, serif" style={{ letterSpacing: '0.1em' }}>OPTION A</text>
              <line x1={width * 0.08} x2={width * 0.08 + colW * 0.3} y1={colY + 28 * scale} y2={colY + 28 * scale} stroke={colors.accent} strokeWidth={3 * scale} />
              {[0, 1, 2, 3].map((i) => (
                <rect key={`l-${i}`} x={width * 0.08} y={colY + 45 + i * 22 * scale} width={colW * (0.9 - i * 0.1)} height={6 * scale} fill={colors.neutral + '30'} />
              ))}
              {/* Right column */}
              <text x={width * 0.54} y={colY + 20 * scale} fontSize={16 * scale} fill={colors.secondary} fontWeight={700} fontFamily="Georgia, serif" style={{ letterSpacing: '0.1em' }}>OPTION B</text>
              <line x1={width * 0.54} x2={width * 0.54 + colW * 0.3} y1={colY + 28 * scale} y2={colY + 28 * scale} stroke={colors.accent} strokeWidth={3 * scale} />
              {[0, 1, 2, 3].map((i) => (
                <rect key={`r-${i}`} x={width * 0.54} y={colY + 45 + i * 22 * scale} width={colW * (0.85 - i * 0.08)} height={6 * scale} fill={colors.neutral + '30'} />
              ))}
            </g>
          );
        }

        // Bold style: High contrast blocks with strong colors
        if (template.styleFamily === 'bold') {
          const blockW = width * 0.42;
          const blockH = height * 0.5;
          const blockY = height * 0.3;
          return (
            <g>
              {/* Left block - solid primary */}
              <rect x={width * 0.06} y={blockY} width={blockW} height={blockH} fill={colors.primary} rx={4 * scale} />
              <text x={width * 0.06 + blockW / 2} y={blockY + blockH / 2 - 10 * scale} fontSize={18 * scale} fill={colors.background} textAnchor="middle" fontWeight={800}>PLAN A</text>
              <rect x={width * 0.06 + blockW * 0.2} y={blockY + blockH / 2 + 10 * scale} width={blockW * 0.6} height={4 * scale} fill={colors.background + '60'} rx={2 * scale} />
              <rect x={width * 0.06 + blockW * 0.25} y={blockY + blockH / 2 + 22 * scale} width={blockW * 0.5} height={4 * scale} fill={colors.background + '40'} rx={2 * scale} />

              {/* Right block - accent color */}
              <rect x={width * 0.52} y={blockY} width={blockW} height={blockH} fill={colors.accent} rx={4 * scale} />
              <text x={width * 0.52 + blockW / 2} y={blockY + blockH / 2 - 10 * scale} fontSize={18 * scale} fill={colors.background} textAnchor="middle" fontWeight={800}>PLAN B</text>
              <rect x={width * 0.52 + blockW * 0.2} y={blockY + blockH / 2 + 10 * scale} width={blockW * 0.6} height={4 * scale} fill={colors.background + '60'} rx={2 * scale} />
              <rect x={width * 0.52 + blockW * 0.25} y={blockY + blockH / 2 + 22 * scale} width={blockW * 0.5} height={4 * scale} fill={colors.background + '40'} rx={2 * scale} />

              {/* Central arrow */}
              <polygon points={`${width / 2 - 8 * scale},${blockY + blockH / 2} ${width / 2 + 8 * scale},${blockY + blockH / 2 - 10 * scale} ${width / 2 + 8 * scale},${blockY + blockH / 2 + 10 * scale}`} fill={colors.secondary} />
            </g>
          );
        }

        // Minimal style: Ultra-sparse with thin lines
        if (template.styleFamily === 'minimal') {
          const lineY = height * 0.5;
          return (
            <g>
              {/* Thin horizontal line */}
              <line x1={width * 0.1} x2={width * 0.9} y1={lineY} y2={lineY} stroke={colors.neutral + '20'} strokeWidth={0.5 * scale} />
              {/* Left side */}
              <text x={width * 0.15} y={lineY - 30 * scale} fontSize={10 * scale} fill={colors.neutral} fontWeight={300} letterSpacing="0.15em">A</text>
              <rect x={width * 0.15} y={lineY - 18 * scale} width={width * 0.25} height={3 * scale} fill={colors.neutral + '20'} />
              <rect x={width * 0.15} y={lineY - 10 * scale} width={width * 0.2} height={3 * scale} fill={colors.neutral + '15'} />
              {/* Right side */}
              <text x={width * 0.6} y={lineY + 45 * scale} fontSize={10 * scale} fill={colors.neutral} fontWeight={300} letterSpacing="0.15em">B</text>
              <rect x={width * 0.6} y={lineY + 18 * scale} width={width * 0.25} height={3 * scale} fill={colors.neutral + '20'} />
              <rect x={width * 0.6} y={lineY + 26 * scale} width={width * 0.18} height={3 * scale} fill={colors.neutral + '15'} />
              {/* Subtle dot in center */}
              <circle cx={width / 2} cy={lineY} r={3 * scale} fill={colors.accent + '40'} />
            </g>
          );
        }

        // Corporate style: Professional 2-column with header band
        if (template.styleFamily === 'corporate') {
          const cardW = width * 0.4;
          const cardH = height * 0.5;
          const cardY = height * 0.32;
          return (
            <g>
              {/* Header band */}
              <rect x={0} y={height * 0.2} width={width} height={20 * scale} fill={colors.primary + '10'} />
              {/* Left card */}
              <rect x={width * 0.07} y={cardY} width={cardW} height={cardH} fill={colors.background} rx={4 * scale} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))" />
              <rect x={width * 0.07} y={cardY} width={cardW} height={22 * scale} fill={colors.primary} rx={4 * scale} />
              <rect x={width * 0.07} y={cardY + 18 * scale} width={cardW} height={6 * scale} fill={colors.primary} />
              <text x={width * 0.07 + cardW / 2} y={cardY + 15 * scale} fontSize={9 * scale} fill={colors.background} textAnchor="middle" fontWeight={600}>Solution A</text>
              {[0, 1, 2].map((i) => (
                <g key={`l-${i}`}>
                  <rect x={width * 0.09} y={cardY + 35 + i * 20 * scale} width={6 * scale} height={6 * scale} fill={colors.accent} rx={1 * scale} />
                  <rect x={width * 0.09 + 12 * scale} y={cardY + 36 + i * 20 * scale} width={cardW * 0.6} height={4 * scale} fill={colors.neutral + '25'} rx={2 * scale} />
                </g>
              ))}
              {/* Right card */}
              <rect x={width * 0.53} y={cardY} width={cardW} height={cardH} fill={colors.background} rx={4 * scale} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))" />
              <rect x={width * 0.53} y={cardY} width={cardW} height={22 * scale} fill={colors.secondary} rx={4 * scale} />
              <rect x={width * 0.53} y={cardY + 18 * scale} width={cardW} height={6 * scale} fill={colors.secondary} />
              <text x={width * 0.53 + cardW / 2} y={cardY + 15 * scale} fontSize={9 * scale} fill={colors.background} textAnchor="middle" fontWeight={600}>Solution B</text>
              {[0, 1, 2].map((i) => (
                <g key={`r-${i}`}>
                  <rect x={width * 0.55} y={cardY + 35 + i * 20 * scale} width={6 * scale} height={6 * scale} fill={colors.accent} rx={1 * scale} />
                  <rect x={width * 0.55 + 12 * scale} y={cardY + 36 + i * 20 * scale} width={cardW * 0.55} height={4 * scale} fill={colors.neutral + '25'} rx={2 * scale} />
                </g>
              ))}
            </g>
          );
        }

        // Bento style: Overlapping modular cards
        if (template.styleFamily === 'bento') {
          const card1X = width * 0.08;
          const card2X = width * 0.5;
          const cardY = height * 0.25;
          const cardW = width * 0.45;
          const cardH = height * 0.55;
          return (
            <g>
              {/* Left card (overlapped) */}
              <rect
                x={card1X}
                y={cardY}
                width={cardW}
                height={cardH}
                fill={colors.primary + '15'}
                rx={16 * scale}
              />
              {/* Right card (on top) */}
              <rect
                x={card2X}
                y={cardY + 15 * scale}
                width={cardW}
                height={cardH - 10 * scale}
                fill={colors.background}
                rx={16 * scale}
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
              />
              <rect
                x={card2X}
                y={cardY + 15 * scale}
                width={cardW}
                height={cardH - 10 * scale}
                fill="none"
                stroke={colors.secondary + '30'}
                strokeWidth={1 * scale}
                rx={16 * scale}
              />
              {/* Labels */}
              <text x={card1X + 15 * scale} y={cardY + 25 * scale} fontSize={8 * scale} fill={colors.primary} fontWeight={600}>BEFORE</text>
              <text x={card2X + 15 * scale} y={cardY + 40 * scale} fontSize={8 * scale} fill={colors.secondary} fontWeight={600}>AFTER</text>
              {/* Content placeholders */}
              {[0, 1, 2].map((i) => (
                <rect key={`l-${i}`} x={card1X + 15 * scale} y={cardY + 40 + i * 20 * scale} width={cardW * 0.6 - i * 15 * scale} height={6 * scale} fill={colors.neutral + '30'} rx={3 * scale} />
              ))}
              {[0, 1, 2].map((i) => (
                <rect key={`r-${i}`} x={card2X + 15 * scale} y={cardY + 55 + i * 20 * scale} width={cardW * 0.7 - i * 10 * scale} height={6 * scale} fill={colors.neutral + '30'} rx={3 * scale} />
              ))}
            </g>
          );
        }

        // Neubrutalist: Bold shadow cards
        if (template.styleFamily === 'neubrutalist') {
          const boxW = width * 0.38;
          const boxH = height * 0.5;
          const boxY = height * 0.3;
          return (
            <g>
              {/* Left shadow */}
              <rect x={width * 0.08 + shadowOffset} y={boxY + shadowOffset} width={boxW} height={boxH} fill={styleParams.shadowColor} />
              {/* Left box */}
              <rect x={width * 0.08} y={boxY} width={boxW} height={boxH} fill={colors.primary + '20'} stroke={colors.neutral} strokeWidth={3 * scale} />
              <text x={width * 0.08 + boxW / 2} y={boxY + 20 * scale} fontSize={11 * scale} fill={colors.neutral} textAnchor="middle" fontWeight={800}>PLAN A</text>

              {/* Right shadow */}
              <rect x={width * 0.54 + shadowOffset} y={boxY + shadowOffset} width={boxW} height={boxH} fill={styleParams.shadowColor} />
              {/* Right box */}
              <rect x={width * 0.54} y={boxY} width={boxW} height={boxH} fill={colors.accent + '20'} stroke={colors.neutral} strokeWidth={3 * scale} />
              <text x={width * 0.54 + boxW / 2} y={boxY + 20 * scale} fontSize={11 * scale} fill={colors.neutral} textAnchor="middle" fontWeight={800}>PLAN B</text>

              {/* VS */}
              <rect x={width / 2 - 15 * scale} y={boxY + boxH / 2 - 10 * scale} width={30 * scale} height={20 * scale} fill={colors.accent} stroke={colors.neutral} strokeWidth={2 * scale} />
              <text x={width / 2} y={boxY + boxH / 2 + 4 * scale} fontSize={10 * scale} fill={colors.background} textAnchor="middle" fontWeight={900}>VS</text>
            </g>
          );
        }

        // Brutalist/Swiss: Table format with visible grid
        if (template.styleFamily === 'brutalist' || template.styleFamily === 'swiss') {
          const tableX = width * 0.1;
          const tableY = height * 0.25;
          const tableW = width * 0.8;
          const tableH = height * 0.6;
          const cols = 3;
          const rows = 4;
          const cellW = tableW / cols;
          const cellH = tableH / rows;
          return (
            <g>
              {/* Grid */}
              {Array.from({ length: cols + 1 }).map((_, i) => (
                <line key={`v-${i}`} x1={tableX + i * cellW} x2={tableX + i * cellW} y1={tableY} y2={tableY + tableH} stroke={colors.neutral} strokeWidth={i === 0 || i === cols ? 2 : 1} />
              ))}
              {Array.from({ length: rows + 1 }).map((_, i) => (
                <line key={`h-${i}`} x1={tableX} x2={tableX + tableW} y1={tableY + i * cellH} y2={tableY + i * cellH} stroke={colors.neutral} strokeWidth={i === 0 || i === 1 ? 2 : 1} />
              ))}
              {/* Headers */}
              <rect x={tableX + cellW} y={tableY} width={cellW} height={cellH} fill={colors.primary + '20'} />
              <rect x={tableX + cellW * 2} y={tableY} width={cellW} height={cellH} fill={colors.secondary + '20'} />
              <text x={tableX + cellW * 1.5} y={tableY + cellH / 2 + 4 * scale} fontSize={8 * scale} fill={colors.primary} textAnchor="middle" fontWeight={700}>OPTION A</text>
              <text x={tableX + cellW * 2.5} y={tableY + cellH / 2 + 4 * scale} fontSize={8 * scale} fill={colors.secondary} textAnchor="middle" fontWeight={700}>OPTION B</text>
              {/* Row labels */}
              {['Price', 'Speed', 'Quality'].map((label, i) => (
                <text key={label} x={tableX + 10 * scale} y={tableY + (i + 1.5) * cellH + 4 * scale} fontSize={7 * scale} fill={colors.neutral} fontWeight={600}>{label}</text>
              ))}
            </g>
          );
        }

        // Default fallback (should not reach here with all families covered)
        return null;
      }

      case 'quote': {
        const quoteX = width * 0.15;
        const quoteY = height * 0.35;
        // Style family affects quote mark size and emphasis
        const quoteMarkSize = 48 * scale * typeScaleFactor * styleParams.titleWeightMultiplier;
        const quoteMarkOpacity = template.styleFamily === 'bold' ? 0.8 :
                                  template.styleFamily === 'minimal' ? 0.4 : 0.6;

        return (
          <g>
            {/* Quote mark */}
            <text
              x={quoteX}
              y={quoteY}
              fontSize={quoteMarkSize}
              fill={colors.accent}
              fontFamily={template.styleFamily === 'editorial' ? 'Georgia, serif' : 'inherit'}
              opacity={quoteMarkOpacity}
              fontWeight={styleParams.titleWeightMultiplier > 1.2 ? 700 : 400}
            >
              "
            </text>
            {/* Editorial style: add closing quote */}
            {styleParams.decorativeElements && (
              <text
                x={quoteX + width * 0.65}
                y={quoteY + 25 * scale}
                fontSize={quoteMarkSize * 0.7}
                fill={colors.accent}
                fontFamily={template.styleFamily === 'editorial' ? 'Georgia, serif' : 'inherit'}
                opacity={quoteMarkOpacity * 0.6}
              >
                "
              </text>
            )}
            {/* Quote lines */}
            {[0, 1].map((i) => (
              <rect
                key={i}
                x={quoteX + 25 * scale}
                y={quoteY + i * 15 * scale}
                width={width * 0.6 - i * width * 0.15}
                height={6 * scale * styleParams.bodyWeightMultiplier}
                fill={colors.neutral + '60'}
                rx={3 * scale * styleParams.elementRoundness}
              />
            ))}
            {/* Attribution line */}
            <rect
              x={quoteX + 25 * scale}
              y={quoteY + 45 * scale}
              width={width * 0.25}
              height={4 * scale}
              fill={colors.secondary + '80'}
              rx={2 * scale}
            />
            {/* Bold/Editorial: add accent underline */}
            {styleParams.decorativeElements && (
              <line
                x1={quoteX + 25 * scale}
                x2={quoteX + 25 * scale + width * 0.15}
                y1={quoteY + 52 * scale}
                y2={quoteY + 52 * scale}
                stroke={colors.accent}
                strokeWidth={accentThickness * 0.75}
                opacity={accentOpacity}
              />
            )}
          </g>
        );
      }

      case 'media': {
        const mediaRegion = layout.regions.find(r => r.role === 'media');
        if (!mediaRegion) return null;

        const x = mediaRegion.bounds.x * gridWidth + baseSpacing;
        const y = mediaRegion.bounds.y * gridHeight + baseSpacing;
        const w = mediaRegion.bounds.w * gridWidth - baseSpacing * 2;
        const h = mediaRegion.bounds.h * gridHeight - baseSpacing * 2;
        // Style affects media placeholder border style
        const dashSize = template.styleFamily === 'minimal' ? 6 : 4;
        const iconStrokeWidth = lineThickness;

        return (
          <g>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={colors.secondary + (styleParams.decorativeElements ? '20' : '10')}
              rx={elementRadius}
              stroke={colors.secondary + '30'}
              strokeWidth={lineThickness * 0.75}
              strokeDasharray={template.styleFamily === 'bold' ? 'none' : `${dashSize * scale} ${dashSize * scale}`}
            />
            {/* Image icon */}
            <g transform={`translate(${x + w/2 - 15 * scale}, ${y + h/2 - 12 * scale})`}>
              <rect
                width={30 * scale}
                height={24 * scale}
                fill="none"
                stroke={colors.secondary}
                strokeWidth={iconStrokeWidth}
                rx={3 * scale * styleParams.elementRoundness}
              />
              <circle
                cx={10 * scale}
                cy={9 * scale}
                r={3 * scale}
                fill={colors.secondary}
              />
              <path
                d={`M ${4 * scale} ${20 * scale} L ${12 * scale} ${12 * scale} L ${18 * scale} ${16 * scale} L ${26 * scale} ${10 * scale}`}
                fill="none"
                stroke={colors.secondary}
                strokeWidth={iconStrokeWidth}
              />
            </g>
          </g>
        );
      }

      case 'agenda': {
        const listX = width * 0.12;
        const listY = height * 0.35;
        const items = ['Strategic Overview', 'Market Analysis', 'Implementation Plan', 'Next Steps'];
        // Style affects number badge size and item spacing
        const badgeRadius = (styleParams.titleWeightMultiplier > 1.2 ? 10 : 8) * scale;
        const itemSpacing = 22 * scale * styleParams.spacingMultiplier;

        return (
          <g>
            {items.map((item, i) => (
              <g key={i}>
                {/* Number badge - shape varies by style */}
                {styleParams.elementRoundness < 0.5 ? (
                  // Minimal/Editorial: square badges
                  <rect
                    x={listX - badgeRadius}
                    y={listY + i * itemSpacing - badgeRadius}
                    width={badgeRadius * 2}
                    height={badgeRadius * 2}
                    fill={i === 0 ? colors.accent : colors.primary + '20'}
                    rx={2 * scale}
                  />
                ) : (
                  // Clean/Bold: circle badges
                  <circle
                    cx={listX}
                    cy={listY + i * itemSpacing}
                    r={badgeRadius}
                    fill={i === 0 ? colors.accent : colors.primary + '20'}
                  />
                )}
                <text
                  x={listX}
                  y={listY + i * itemSpacing + 3 * scale}
                  fontSize={7 * scale * styleParams.titleWeightMultiplier}
                  fill={i === 0 ? colors.background : colors.primary}
                  textAnchor="middle"
                  fontWeight={adjustedTitleWeight}
                >
                  {i + 1}
                </text>
                {/* Item text placeholder */}
                <rect
                  x={listX + 18 * scale}
                  y={listY + i * itemSpacing - 4 * scale}
                  width={width * 0.5 - i * 15 * scale}
                  height={6 * scale * styleParams.bodyWeightMultiplier}
                  fill={colors.neutral + '50'}
                  rx={3 * scale * styleParams.elementRoundness}
                />
                {/* Bold style: add connector line */}
                {styleParams.decorativeElements && i < items.length - 1 && (
                  <line
                    x1={listX}
                    x2={listX}
                    y1={listY + i * itemSpacing + badgeRadius + 2 * scale}
                    y2={listY + (i + 1) * itemSpacing - badgeRadius - 2 * scale}
                    stroke={colors.primary + '30'}
                    strokeWidth={lineThickness * 0.5}
                  />
                )}
              </g>
            ))}
          </g>
        );
      }

      case 'iconography': {
        // Get icon regions from layout
        const iconRegions = layout.regions.filter(r => r.role === 'media');
        const shadowOffset = styleParams.shadowOffset * scale;
        const iconStroke = styleParams.borderThickness > 0 ? lineThickness * 1.5 : lineThickness;
        const iconFill = styleParams.chartStyle === 'filled' || styleParams.chartStyle === 'gradient';

        // Icon rendering helper - creates style-appropriate icon placeholder
        const renderIcon = (x: number, y: number, size: number, index: number) => {
          const isHighlighted = index === 0;
          const iconColor = isHighlighted ? colors.accent : colors.primary;
          const bgFill = iconFill ? iconColor + '15' : 'none';
          const strokeColor = iconColor;
          const cornerRadius = styleParams.elementRoundness * 8 * scale;

          // Different icon shapes based on style
          if (template.styleFamily === 'brutalist' || template.styleFamily === 'swiss') {
            // Geometric sharp icons
            return (
              <g key={index}>
                {/* Container */}
                <rect
                  x={x}
                  y={y}
                  width={size}
                  height={size}
                  fill={bgFill}
                  stroke={strokeColor}
                  strokeWidth={iconStroke}
                />
                {/* Simple geometric shape inside */}
                <polygon
                  points={`${x + size * 0.5},${y + size * 0.2} ${x + size * 0.8},${y + size * 0.8} ${x + size * 0.2},${y + size * 0.8}`}
                  fill={isHighlighted ? iconColor : 'none'}
                  stroke={strokeColor}
                  strokeWidth={iconStroke}
                />
              </g>
            );
          }

          if (template.styleFamily === 'neubrutalist') {
            // Bold with offset shadow
            return (
              <g key={index}>
                {/* Shadow */}
                <rect
                  x={x + shadowOffset}
                  y={y + shadowOffset}
                  width={size}
                  height={size}
                  fill={styleParams.shadowColor}
                />
                {/* Container */}
                <rect
                  x={x}
                  y={y}
                  width={size}
                  height={size}
                  fill={isHighlighted ? iconColor : colors.background}
                  stroke={colors.neutral}
                  strokeWidth={3 * scale}
                />
                {/* Star icon */}
                <circle
                  cx={x + size / 2}
                  cy={y + size / 2}
                  r={size * 0.3}
                  fill={isHighlighted ? colors.background : iconColor}
                />
              </g>
            );
          }

          if (template.styleFamily === 'minimal') {
            // Ultra-thin outlined icons
            return (
              <g key={index}>
                <circle
                  cx={x + size / 2}
                  cy={y + size / 2}
                  r={size * 0.4}
                  fill="none"
                  stroke={iconColor}
                  strokeWidth={0.75 * scale}
                />
                {/* Simple line icon inside */}
                <line
                  x1={x + size * 0.35}
                  x2={x + size * 0.65}
                  y1={y + size * 0.5}
                  y2={y + size * 0.5}
                  stroke={iconColor}
                  strokeWidth={0.75 * scale}
                />
                <line
                  x1={x + size * 0.5}
                  x2={x + size * 0.5}
                  y1={y + size * 0.35}
                  y2={y + size * 0.65}
                  stroke={iconColor}
                  strokeWidth={0.75 * scale}
                />
              </g>
            );
          }

          if (template.styleFamily === 'bento') {
            // Duotone rounded cards
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={size}
                  height={size}
                  fill={iconColor + '10'}
                  rx={12 * scale}
                />
                {/* Duotone circle icon */}
                <circle
                  cx={x + size / 2}
                  cy={y + size * 0.45}
                  r={size * 0.25}
                  fill={iconColor + '40'}
                />
                <circle
                  cx={x + size / 2}
                  cy={y + size * 0.45}
                  r={size * 0.15}
                  fill={iconColor}
                />
                {/* Label placeholder */}
                <rect
                  x={x + size * 0.2}
                  y={y + size * 0.75}
                  width={size * 0.6}
                  height={4 * scale}
                  fill={colors.neutral + '30'}
                  rx={2 * scale}
                />
              </g>
            );
          }

          if (template.styleFamily === 'bold') {
            // Solid filled icons
            return (
              <g key={index}>
                <circle
                  cx={x + size / 2}
                  cy={y + size / 2}
                  r={size * 0.45}
                  fill={iconColor}
                />
                {/* Inner symbol */}
                <rect
                  x={x + size * 0.35}
                  y={y + size * 0.35}
                  width={size * 0.3}
                  height={size * 0.3}
                  fill={colors.background}
                  rx={2 * scale}
                />
              </g>
            );
          }

          if (template.styleFamily === 'editorial') {
            // Elegant linear icons
            return (
              <g key={index}>
                {/* Thin border square */}
                <rect
                  x={x}
                  y={y}
                  width={size}
                  height={size}
                  fill="none"
                  stroke={iconColor}
                  strokeWidth={1 * scale}
                />
                {/* Diamond shape */}
                <polygon
                  points={`${x + size * 0.5},${y + size * 0.15} ${x + size * 0.85},${y + size * 0.5} ${x + size * 0.5},${y + size * 0.85} ${x + size * 0.15},${y + size * 0.5}`}
                  fill="none"
                  stroke={iconColor}
                  strokeWidth={1 * scale}
                />
              </g>
            );
          }

          if (template.styleFamily === 'corporate') {
            // Professional rounded icons with subtle shadow
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={size}
                  height={size}
                  fill={colors.background}
                  rx={cornerRadius}
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"
                />
                <rect
                  x={x}
                  y={y}
                  width={size}
                  height={size}
                  fill="none"
                  stroke={iconColor + '30'}
                  strokeWidth={1 * scale}
                  rx={cornerRadius}
                />
                {/* Circle icon */}
                <circle
                  cx={x + size / 2}
                  cy={y + size / 2}
                  r={size * 0.3}
                  fill={iconColor + '20'}
                  stroke={iconColor}
                  strokeWidth={1.5 * scale}
                />
              </g>
            );
          }

          // Clean style (default) - simple outlined icons
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={size}
                height={size}
                fill={bgFill}
                stroke={iconColor + '40'}
                strokeWidth={1 * scale}
                rx={cornerRadius}
              />
              {/* Simple circle icon */}
              <circle
                cx={x + size / 2}
                cy={y + size / 2}
                r={size * 0.3}
                fill="none"
                stroke={iconColor}
                strokeWidth={1.5 * scale}
              />
              {/* Checkmark inside */}
              <path
                d={`M ${x + size * 0.35} ${y + size * 0.5} L ${x + size * 0.45} ${y + size * 0.6} L ${x + size * 0.65} ${y + size * 0.4}`}
                fill="none"
                stroke={iconColor}
                strokeWidth={1.5 * scale}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        };

        return (
          <g>
            {iconRegions.map((region, index) => {
              const x = region.bounds.x * gridWidth + baseSpacing;
              const y = region.bounds.y * gridHeight + baseSpacing;
              const w = region.bounds.w * gridWidth - baseSpacing * 2;
              const h = region.bounds.h * gridHeight - baseSpacing * 2;
              const size = Math.min(w, h);

              return renderIcon(
                x + (w - size) / 2, // Center horizontally
                y + (h - size) / 2, // Center vertically
                size,
                index
              );
            })}
          </g>
        );
      }

      default:
        return null;
    }
  }, [layout, template, width, height, scale, baseSpacing, colors, typeScaleFactor, styleParams, elementRadius, lineThickness, accentThickness, accentOpacity, adjustedTitleWeight, adjustedBodyWeight]);

  // Render basic regions (headers, bodies without special content)
  const regions = useMemo(() => {
    const gridWidth = width / layout.grid.columns;
    const gridHeight = height / layout.grid.rows;

    // Skip rendering body/media for layouts with special content
    const hasSpecialContent = [
      'data', 'data-bar-vertical', 'data-bar-horizontal', 'data-line',
      'data-pie', 'data-donut', 'data-scatter', 'data-area', 'data-stacked-bar',
      'timeline', 'comparison', 'quote', 'media', 'agenda', 'iconography'
    ].includes(layout.type);

    return layout.regions.map((region) => {
      const x = region.bounds.x * gridWidth;
      const y = region.bounds.y * gridHeight;
      const w = region.bounds.w * gridWidth;
      const h = region.bounds.h * gridHeight;

      const isHeader = region.role === 'header';
      const isBody = region.role === 'body';
      const isMedia = region.role === 'media';
      const isCaption = region.role === 'caption';

      // Skip body/media for special layouts
      if (hasSpecialContent && (isBody || isMedia)) {
        return null;
      }

      let content = null;
      let textColor = adjustedNeutralColor;
      let fontSize = bodyStyle.fontSize * scale;

      if (isHeader) {
        textColor = adjustedPrimaryColor;
        fontSize = titleStyle.fontSize * scale * typeScaleFactor * elementScale;
        content = layout.type === 'title' ? 'Presentation Title' : layout.name;
      } else if (isBody) {
        content = getPlaceholderText(layout.type);
      } else if (isCaption) {
        fontSize = fontSize * 0.8;
        content = 'Caption text goes here';
        textColor = adjustedNeutralColor + 'AA';
      }

      if (!content) return null;

      return (
        <g key={region.id}>
          <text
            x={x + baseSpacing}
            y={isHeader ? y + h / 2 : y + fontSize}
            fill={textColor}
            fontSize={fontSize}
            fontWeight={isHeader ? adjustedTitleWeight : adjustedBodyWeight}
            fontFamily={isHeader ? titleStyle.fontFamily : bodyStyle.fontFamily}
            dominantBaseline={isHeader ? 'middle' : 'hanging'}
          >
            {content}
          </text>
        </g>
      );
    });
  }, [layout, template, width, height, scale, baseSpacing, colors, titleStyle, bodyStyle, typeScaleFactor, adjustedTitleWeight, adjustedBodyWeight, adjustedPrimaryColor, adjustedNeutralColor, elementScale]);

  // Render accent lines - style family affects appearance
  const accents = useMemo(() => {
    // Minimal style has no accent, others vary in thickness and length
    if (styleParams.accentOpacity < 0.6) {
      // Minimal: very subtle thin line
      return (
        <line
          x1={baseSpacing * 3}
          y1={height - baseSpacing * 2}
          x2={width * 0.15}
          y2={height - baseSpacing * 2}
          stroke={colors.accent}
          strokeWidth={accentThickness * 0.5}
          opacity={accentOpacity * 0.7}
        />
      );
    }

    if (styleParams.decorativeElements) {
      // Editorial/Bold: more prominent accent with possible second line
      return (
        <g>
          <line
            x1={baseSpacing * 2}
            y1={height - baseSpacing * 2}
            x2={width * 0.3}
            y2={height - baseSpacing * 2}
            stroke={colors.accent}
            strokeWidth={accentThickness}
            opacity={accentOpacity}
          />
          {styleParams.titleWeightMultiplier > 1.2 && (
            <line
              x1={baseSpacing * 2}
              y1={height - baseSpacing * 2 - accentThickness * 2}
              x2={width * 0.15}
              y2={height - baseSpacing * 2 - accentThickness * 2}
              stroke={colors.primary}
              strokeWidth={accentThickness * 0.5}
              opacity={accentOpacity * 0.5}
            />
          )}
        </g>
      );
    }

    // Clean: standard accent line
    return (
      <line
        x1={baseSpacing * 2}
        y1={height - baseSpacing * 2}
        x2={width * 0.25}
        y2={height - baseSpacing * 2}
        stroke={colors.accent}
        strokeWidth={accentThickness}
        opacity={accentOpacity}
      />
    );
  }, [colors.accent, colors.primary, width, height, baseSpacing, accentThickness, accentOpacity, styleParams]);

  // Region visualization - shows the actual layout structure
  const regionVisualization = useMemo(() => {
    if (!showRegions) return null;

    const roleColors: Record<string, { fill: string; stroke: string; label: string }> = {
      header: { fill: colors.primary + '20', stroke: colors.primary, label: 'Header' },
      body: { fill: colors.secondary + '15', stroke: colors.secondary, label: 'Content' },
      media: { fill: colors.accent + '15', stroke: colors.accent, label: 'Media' },
      caption: { fill: colors.neutral + '10', stroke: colors.neutral, label: 'Caption' },
      footer: { fill: colors.neutral + '10', stroke: colors.neutral, label: 'Footer' },
    };

    return (
      <g>
        {layout.regions.map((region, index) => {
          const x = region.bounds.x * gridWidth;
          const y = region.bounds.y * gridHeight;
          const w = region.bounds.w * gridWidth;
          const h = region.bounds.h * gridHeight;
          const config = roleColors[region.role] || roleColors.body;
          const padding = 2 * scale;

          return (
            <g key={region.id}>
              {/* Region background */}
              <rect
                x={x + padding}
                y={y + padding}
                width={w - padding * 2}
                height={h - padding * 2}
                fill={config.fill}
                stroke={config.stroke}
                strokeWidth={1.5 * scale}
                strokeDasharray={region.role === 'media' ? `${4 * scale} ${2 * scale}` : 'none'}
                rx={elementRadius * 0.5}
              />
              {/* Region label */}
              <text
                x={x + w / 2}
                y={y + h / 2}
                fontSize={Math.min(10 * scale, h * 0.3)}
                fill={config.stroke}
                textAnchor="middle"
                dominantBaseline="middle"
                fontWeight={500}
              >
                {region.role === 'header' ? 'Title' :
                 region.role === 'media' ? (region.id.includes('chart') ? 'Chart' : 'Media') :
                 region.role === 'body' ? (layout.regions.filter(r => r.role === 'body').length > 1 ? `Col ${index + 1}` : 'Content') :
                 config.label}
              </text>
              {/* Dimension indicator for larger regions */}
              {h > 30 * scale && (
                <text
                  x={x + w / 2}
                  y={y + h / 2 + 12 * scale}
                  fontSize={6 * scale}
                  fill={config.stroke + '80'}
                  textAnchor="middle"
                >
                  {Math.round(region.bounds.w)}/{Math.round(region.bounds.h)} cells
                </text>
              )}
            </g>
          );
        })}
        {/* Grid indicator */}
        <text
          x={width - 5 * scale}
          y={height - 5 * scale}
          fontSize={6 * scale}
          fill={colors.neutral + '60'}
          textAnchor="end"
        >
          {layout.grid.columns}×{layout.grid.rows} grid
        </text>
      </g>
    );
  }, [showRegions, layout.regions, layout.grid, gridWidth, gridHeight, colors, scale, elementRadius]);

  const isFullscreen = size === 'fullscreen';

  return (
    <div className={isFullscreen ? "flex flex-col w-full h-full" : "flex flex-col"}>
      <svg
        width={isFullscreen ? "100%" : width}
        height={isFullscreen ? "100%" : height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="rounded-lg shadow-sm border border-slate-200"
        style={isFullscreen ? { maxWidth: '100%', maxHeight: '100%' } : undefined}
      >
        {/* Background - mood-adjusted */}
        <rect width={width} height={height} fill={showRegions ? colors.background : moodBackground} />

        {showRegions ? (
          /* Region visualization mode */
          regionVisualization
        ) : (
          <>
            {/* Special content (charts, timelines, etc.) */}
            {specialContent}

            {/* Basic regions (headers, text) */}
            {regions}

            {/* Accents */}
            {accents}
          </>
        )}
      </svg>

      {showLabel && !isFullscreen && (
        <div className="mt-2 text-center">
          <span className="text-xs font-medium text-slate-600">{layout.name}</span>
          <span className="text-xs text-slate-400 ml-1">({layout.type})</span>
        </div>
      )}
    </div>
  );
}

function getPlaceholderText(layoutType: string): string {
  switch (layoutType) {
    case 'title':
      return 'Subtitle or tagline';
    case 'section':
      return '';
    case 'content':
      return 'Body content goes here...';
    default:
      return '';
  }
}
