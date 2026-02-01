import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Template,
  TemplateState,
  Layout,
  Tokens,
  Typography,
  StyleFamily,
  MoodPreset,
  Accent
} from '@kova/shared';

/**
 * Style-specific typography recommendations
 * Each style family has curated fonts that match its aesthetic
 */
const styleFontConfig: Record<StyleFamily, { title: string; body: string; titleWeight: number; bodyWeight: number }> = {
  clean: {
    title: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
    titleWeight: 600,
    bodyWeight: 400,
  },
  editorial: {
    title: 'Playfair Display, Georgia, "Times New Roman", serif',
    body: 'Georgia, "Times New Roman", serif',
    titleWeight: 700,
    bodyWeight: 400,
  },
  bold: {
    title: 'Montserrat, "Helvetica Neue", Helvetica, Arial, sans-serif',
    body: 'Montserrat, "Helvetica Neue", Helvetica, Arial, sans-serif',
    titleWeight: 800,
    bodyWeight: 500,
  },
  minimal: {
    title: 'Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
    body: 'Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
    titleWeight: 300,
    bodyWeight: 300,
  },
  brutalist: {
    title: '"Courier New", Courier, monospace',
    body: '"Courier New", Courier, monospace',
    titleWeight: 700,
    bodyWeight: 400,
  },
  neubrutalist: {
    title: '"Space Grotesk", Archivo, "Helvetica Neue", sans-serif',
    body: '"Space Grotesk", Archivo, "Helvetica Neue", sans-serif',
    titleWeight: 700,
    bodyWeight: 500,
  },
  bento: {
    title: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
    titleWeight: 600,
    bodyWeight: 400,
  },
  swiss: {
    title: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
    body: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
    titleWeight: 700,
    bodyWeight: 400,
  },
  corporate: {
    title: 'Calibri, "Segoe UI", Roboto, Arial, sans-serif',
    body: 'Calibri, "Segoe UI", Roboto, Arial, sans-serif',
    titleWeight: 600,
    bodyWeight: 400,
  },
  // Era-based styles
  artdeco: {
    title: '"Poiret One", "Playfair Display", Georgia, serif',
    body: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
    titleWeight: 400,
    bodyWeight: 400,
  },
  retro70s: {
    title: 'Righteous, "Cooper Black", Georgia, serif',
    body: 'Poppins, "Segoe UI", Arial, sans-serif',
    titleWeight: 400,
    bodyWeight: 400,
  },
  y2k: {
    title: 'Nunito, "Trebuchet MS", Verdana, sans-serif',
    body: 'Nunito, "Trebuchet MS", Verdana, sans-serif',
    titleWeight: 800,
    bodyWeight: 500,
  },
  // Industry styles
  tech: {
    title: 'Inter, Roboto, "Segoe UI", Arial, sans-serif',
    body: 'Inter, Roboto, "Segoe UI", Arial, sans-serif',
    titleWeight: 600,
    bodyWeight: 400,
  },
  // Design movement styles
  bauhaus: {
    title: 'Montserrat, Futura, "Helvetica Neue", sans-serif',
    body: 'Montserrat, Futura, "Helvetica Neue", sans-serif',
    titleWeight: 700,
    bodyWeight: 400,
  },
  memphis: {
    title: '"Bebas Neue", Impact, "Arial Black", sans-serif',
    body: 'Poppins, "Segoe UI", Arial, sans-serif',
    titleWeight: 400,
    bodyWeight: 500,
  },
  scandinavian: {
    title: 'Raleway, "Work Sans", "Helvetica Neue", sans-serif',
    body: 'Raleway, "Work Sans", "Helvetica Neue", sans-serif',
    titleWeight: 300,
    bodyWeight: 300,
  },
  // Mood-based styles
  futuristic: {
    title: '"Orbitron", "Roboto Mono", Consolas, monospace',
    body: 'Inter, Roboto, "Segoe UI", sans-serif',
    titleWeight: 700,
    bodyWeight: 400,
  },
  organic: {
    title: 'Lora, Georgia, "Times New Roman", serif',
    body: 'Lato, "Open Sans", "Segoe UI", sans-serif',
    titleWeight: 500,
    bodyWeight: 400,
  },
  luxury: {
    title: '"Playfair Display", Didot, Georgia, serif',
    body: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
    titleWeight: 600,
    bodyWeight: 400,
  },
  handcrafted: {
    title: 'Caveat, "Comic Sans MS", cursive',
    body: 'Lato, "Open Sans", Arial, sans-serif',
    titleWeight: 700,
    bodyWeight: 400,
  },
  industrial: {
    title: '"Oswald", "Impact", "Arial Black", sans-serif',
    body: '"Roboto Condensed", "Arial Narrow", Arial, sans-serif',
    titleWeight: 700,
    bodyWeight: 400,
  },
};

/**
 * Iconography style configuration per style family
 * Defines icon style, weight, and visual treatment
 */
export type IconStyle = 'outline' | 'solid' | 'duotone' | 'linear' | 'hand-drawn';
export type IconCorners = 'sharp' | 'rounded' | 'soft';

export interface IconographyConfig {
  style: IconStyle;
  strokeWeight: number; // 1-3
  corners: IconCorners;
  filled: boolean;
  description: string;
}

export const styleIconographyConfig: Record<StyleFamily, IconographyConfig> = {
  clean: {
    style: 'outline',
    strokeWeight: 1.5,
    corners: 'rounded',
    filled: false,
    description: 'Simple outlined icons with consistent stroke weight',
  },
  editorial: {
    style: 'linear',
    strokeWeight: 1,
    corners: 'sharp',
    filled: false,
    description: 'Elegant thin-line icons with refined details',
  },
  bold: {
    style: 'solid',
    strokeWeight: 2,
    corners: 'rounded',
    filled: true,
    description: 'Strong filled icons with high visual impact',
  },
  minimal: {
    style: 'outline',
    strokeWeight: 1,
    corners: 'rounded',
    filled: false,
    description: 'Ultra-light outlined icons with minimal detail',
  },
  brutalist: {
    style: 'outline',
    strokeWeight: 3,
    corners: 'sharp',
    filled: false,
    description: 'Raw thick-stroke icons with hard edges',
  },
  neubrutalist: {
    style: 'solid',
    strokeWeight: 2.5,
    corners: 'sharp',
    filled: true,
    description: 'Bold filled icons with thick outlines',
  },
  bento: {
    style: 'duotone',
    strokeWeight: 1.5,
    corners: 'soft',
    filled: true,
    description: 'Two-tone icons with depth and dimension',
  },
  swiss: {
    style: 'outline',
    strokeWeight: 2,
    corners: 'sharp',
    filled: false,
    description: 'Geometric icons with precise construction',
  },
  corporate: {
    style: 'outline',
    strokeWeight: 1.5,
    corners: 'rounded',
    filled: false,
    description: 'Professional icons with balanced proportions',
  },
  // Era-based styles
  artdeco: {
    style: 'linear',
    strokeWeight: 1,
    corners: 'sharp',
    filled: false,
    description: 'Geometric angular icons with Art Deco symmetry',
  },
  retro70s: {
    style: 'solid',
    strokeWeight: 2,
    corners: 'soft',
    filled: true,
    description: 'Rounded groovy icons with organic curves',
  },
  y2k: {
    style: 'duotone',
    strokeWeight: 2,
    corners: 'soft',
    filled: true,
    description: 'Glossy 3D-style icons with metallic feel',
  },
  // Industry styles
  tech: {
    style: 'outline',
    strokeWeight: 1.5,
    corners: 'rounded',
    filled: false,
    description: 'Clean tech icons with modern aesthetic',
  },
  // Design movement styles
  bauhaus: {
    style: 'solid',
    strokeWeight: 2,
    corners: 'sharp',
    filled: true,
    description: 'Geometric primary-color icons with Bauhaus simplicity',
  },
  memphis: {
    style: 'solid',
    strokeWeight: 2.5,
    corners: 'rounded',
    filled: true,
    description: 'Bold colorful icons with playful Memphis patterns',
  },
  scandinavian: {
    style: 'outline',
    strokeWeight: 1,
    corners: 'soft',
    filled: false,
    description: 'Minimal functional icons with natural simplicity',
  },
  // Mood-based styles
  futuristic: {
    style: 'outline',
    strokeWeight: 1.5,
    corners: 'sharp',
    filled: false,
    description: 'Sci-fi inspired icons with neon glow aesthetic',
  },
  organic: {
    style: 'outline',
    strokeWeight: 1.5,
    corners: 'soft',
    filled: false,
    description: 'Nature-inspired icons with organic flowing lines',
  },
  luxury: {
    style: 'linear',
    strokeWeight: 1,
    corners: 'sharp',
    filled: false,
    description: 'Refined elegant icons with sophisticated detail',
  },
  handcrafted: {
    style: 'hand-drawn',
    strokeWeight: 2,
    corners: 'soft',
    filled: false,
    description: 'Sketchy imperfect icons with authentic handmade feel',
  },
  industrial: {
    style: 'solid',
    strokeWeight: 2.5,
    corners: 'sharp',
    filled: true,
    description: 'Bold utilitarian icons with industrial strength',
  },
};

// Default tokens
const defaultTokens: Tokens = {
  colors: {
    primary: '#0A2A43',
    secondary: '#3D6B82',
    neutral: '#2B2B2B',
    background: '#FFFFFF',
    accent: '#E1A73B',
  },
  spacing: {
    base: 4,
    m: 12,
    l: 24,
  },
  radius: {
    sm: 2,
    md: 6,
    lg: 12,
  },
};

// Default typography - uses 'clean' style fonts as default
const defaultTypography: Typography = {
  title: {
    fontFamily: styleFontConfig.clean.title,
    fontSize: 34,
    lineHeight: 1.1,
    weight: styleFontConfig.clean.titleWeight,
  },
  body: {
    fontFamily: styleFontConfig.clean.body,
    fontSize: 14,
    lineHeight: 1.4,
    weight: styleFontConfig.clean.bodyWeight,
  },
};

/**
 * Default Layouts - Following Design Best Practices
 *
 * Grid System: 12 columns × 9 rows (optimized for 16:9 slides)
 *
 * Design Principles Applied:
 *
 * 1. GOLDEN RATIO (φ = 1.618)
 *    - Two-column splits use 7:4 ratio (≈1.75, close to φ)
 *    - Vertical content zones follow golden proportions
 *
 * 2. RULE OF THIRDS
 *    - Key horizontal positions: columns 4 and 8
 *    - Key vertical positions: rows 3 and 6
 *    - Headers align to top third, content in middle third
 *
 * 3. CONSISTENT MARGINS
 *    - Left/Right: 1 column (8.3% of width)
 *    - Top: 1 row (11% of height)
 *    - Bottom: 1 row (11% of height)
 *    - Content area: columns 1-10, rows 1-7
 *
 * 4. OPTICAL CENTER
 *    - Visual center is ~5% above mathematical center
 *    - Content positioned accordingly for balance
 *
 * 5. BREATHING ROOM
 *    - Gap between header and body: 0.5-1 row
 *    - Consistent gutter spacing between columns
 */
const defaultLayouts: Layout[] = [
  {
    // TITLE SLIDE - Centered, optical center positioning
    // Title at ~40% from top (optical center), subtitle below
    name: 'Title Slide',
    type: 'title',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1.5, y: 3, w: 9, h: 2 } },    // Centered, optical center
      { id: 'subtitle', role: 'body', bounds: { x: 2, y: 5.5, w: 8, h: 1 } },   // Slightly narrower, golden ratio below
    ],
    rules: { minFontSize: 18, maxLineCount: 3, contentTypes: ['text'] },
    enabled: true,
  },
  {
    // SECTION HEADER - Large centered text at optical center
    name: 'Section Header',
    type: 'section',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'section-title', role: 'header', bounds: { x: 1.5, y: 3.5, w: 9, h: 2 } }, // Optical center
    ],
    rules: { minFontSize: 24, maxLineCount: 2, contentTypes: ['text'] },
    enabled: true,
  },
  {
    // AGENDA - Header + list items with proper margins
    name: 'Agenda',
    type: 'agenda',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },     // Top margin respected
      { id: 'items', role: 'body', bounds: { x: 1, y: 2.5, w: 10, h: 5.5 } },   // Content with breathing room
    ],
    rules: { minFontSize: 14, maxLineCount: 10, contentTypes: ['text'] },
    enabled: true,
  },
  {
    // CONTENT - Standard header + body layout
    name: 'Content',
    type: 'content',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'content', role: 'body', bounds: { x: 1, y: 2.5, w: 10, h: 5.5 } },
    ],
    rules: { minFontSize: 12, contentTypes: ['text', 'image'] },
    enabled: true,
  },
  {
    // MEDIA - Header, large media area, caption footer
    // Media uses golden ratio height proportion
    name: 'Media',
    type: 'media',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'media', role: 'media', bounds: { x: 1, y: 2.5, w: 10, h: 5 } },    // ~62% of content area (φ)
      { id: 'caption', role: 'caption', bounds: { x: 1, y: 7.75, w: 10, h: 0.75 } },
    ],
    rules: { minFontSize: 12, contentTypes: ['image', 'chart'] },
    enabled: true,
  },
  {
    // COMPARISON - Golden ratio column split (7:4 ≈ 1.75)
    // Left column is dominant (7 cols), right is supporting (4 cols)
    name: 'Comparison',
    type: 'comparison',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'left', role: 'body', bounds: { x: 1, y: 2.5, w: 4.75, h: 5.5 } },   // Equal split with gap
      { id: 'right', role: 'body', bounds: { x: 6.25, y: 2.5, w: 4.75, h: 5.5 } }, // 0.5 col gap between
    ],
    rules: { minFontSize: 12, contentTypes: ['text', 'image'] },
    enabled: true,
  },
  {
    // TIMELINE - Header + horizontal timeline area
    name: 'Timeline',
    type: 'timeline',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'timeline', role: 'body', bounds: { x: 0.5, y: 2.5, w: 11, h: 5.5 } }, // Wider for timeline
    ],
    rules: { minFontSize: 12, contentTypes: ['text'] },
    enabled: true,
  },
  {
    // QUOTE - Centered with generous margins, golden proportions
    // Quote at optical center, attribution below with proper spacing
    name: 'Quote',
    type: 'quote',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'quote', role: 'body', bounds: { x: 2, y: 2.5, w: 8, h: 3.5 } },     // Centered, ~golden height
      { id: 'attribution', role: 'caption', bounds: { x: 3, y: 6.5, w: 6, h: 1 } }, // Narrower, offset
    ],
    rules: { minFontSize: 18, maxLineCount: 4, contentTypes: ['text'] },
    enabled: true,
  },
  {
    // DATA - Header + chart area optimized for visualizations (default bar chart)
    name: 'Bar Chart (Vertical)',
    type: 'data-bar-vertical',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'chart', role: 'media', bounds: { x: 0.75, y: 2.5, w: 10.5, h: 5.75 } },
    ],
    rules: { minFontSize: 12, contentTypes: ['chart', 'table'] },
    enabled: true,
  },
  {
    // DATA - Horizontal bar chart
    name: 'Bar Chart (Horizontal)',
    type: 'data-bar-horizontal',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'chart', role: 'media', bounds: { x: 0.75, y: 2.5, w: 10.5, h: 5.75 } },
    ],
    rules: { minFontSize: 12, contentTypes: ['chart', 'table'] },
    enabled: false,
  },
  {
    // DATA - Line chart for trends
    name: 'Line Chart',
    type: 'data-line',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'chart', role: 'media', bounds: { x: 0.75, y: 2.5, w: 10.5, h: 5.75 } },
    ],
    rules: { minFontSize: 12, contentTypes: ['chart', 'table'] },
    enabled: false,
  },
  {
    // DATA - Pie chart for proportions
    name: 'Pie Chart',
    type: 'data-pie',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'chart', role: 'media', bounds: { x: 2, y: 2.5, w: 8, h: 5.75 } }, // Centered for pie
    ],
    rules: { minFontSize: 12, contentTypes: ['chart', 'table'] },
    enabled: false,
  },
  {
    // DATA - Donut chart (pie with hole)
    name: 'Donut Chart',
    type: 'data-donut',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'chart', role: 'media', bounds: { x: 2, y: 2.5, w: 8, h: 5.75 } }, // Centered for donut
    ],
    rules: { minFontSize: 12, contentTypes: ['chart', 'table'] },
    enabled: false,
  },
  {
    // DATA - Scatter plot for correlations
    name: 'Scatter Plot',
    type: 'data-scatter',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'chart', role: 'media', bounds: { x: 0.75, y: 2.5, w: 10.5, h: 5.75 } },
    ],
    rules: { minFontSize: 12, contentTypes: ['chart', 'table'] },
    enabled: false,
  },
  {
    // DATA - Area chart for cumulative data
    name: 'Area Chart',
    type: 'data-area',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'chart', role: 'media', bounds: { x: 0.75, y: 2.5, w: 10.5, h: 5.75 } },
    ],
    rules: { minFontSize: 12, contentTypes: ['chart', 'table'] },
    enabled: false,
  },
  {
    // DATA - Stacked bar chart for composition
    name: 'Stacked Bar Chart',
    type: 'data-stacked-bar',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'chart', role: 'media', bounds: { x: 0.75, y: 2.5, w: 10.5, h: 5.75 } },
    ],
    rules: { minFontSize: 12, contentTypes: ['chart', 'table'] },
    enabled: false,
  },
  {
    // ICONOGRAPHY - Evenly spaced icons following rule of thirds
    // Icons positioned at 1/4, 1/2, 3/4 horizontal positions
    name: 'Iconography',
    type: 'iconography',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 10, h: 1 } },
      { id: 'icon-1', role: 'media', bounds: { x: 1, y: 2.75, w: 3, h: 3 } },    // Left third
      { id: 'icon-2', role: 'media', bounds: { x: 4.5, y: 2.75, w: 3, h: 3 } },  // Center
      { id: 'icon-3', role: 'media', bounds: { x: 8, y: 2.75, w: 3, h: 3 } },    // Right third
      { id: 'labels', role: 'caption', bounds: { x: 1, y: 6.25, w: 10, h: 1.5 } },
    ],
    rules: { minFontSize: 12, contentTypes: ['image', 'text'] },
    enabled: true,
  },
  {
    // APPENDIX - Dense content layout with more body space
    name: 'Appendix',
    type: 'appendix',
    grid: { columns: 12, rows: 9, gutter: 16 },
    regions: [
      { id: 'title', role: 'header', bounds: { x: 1, y: 0.75, w: 10, h: 0.75 } }, // Smaller header
      { id: 'content', role: 'body', bounds: { x: 1, y: 1.75, w: 10, h: 6.5 } },  // More content space
    ],
    rules: { minFontSize: 10, contentTypes: ['text', 'table'] },
    enabled: false,
  },
];

// Uploaded asset type
interface UploadedAsset {
  id: string;
  name: string;
  type: 'logo' | 'font';
  url: string;
  metadata?: Record<string, unknown>;
}

// Custom style preset type
export interface StylePreset {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  colors: Tokens['colors'];
  typography: {
    titleFont: string;
    bodyFont: string;
    titleWeight: number;
    bodyWeight: number;
  };
  styleFamily: StyleFamily;
  mood: MoodPreset;
  spacingDensity: number;
  typeScale: number;
  contrastLevel: number;
}

// Store state
interface TemplateStore {
  // Template data
  template: TemplateState;

  // Uploaded assets
  logos: UploadedAsset[];
  fonts: UploadedAsset[];

  // Custom style presets
  customStyles: StylePreset[];

  // Settings
  excludeAppleFonts: boolean;

  // Navigation
  currentStep: number;

  // History for undo/redo
  history: TemplateState[];
  historyIndex: number;

  // Actions
  setColors: (colors: Partial<Tokens['colors']>) => void;
  setSpacing: (spacing: Partial<Tokens['spacing']>) => void;
  setTypography: (typography: Partial<Typography>) => void;
  setStyleFamily: (family: StyleFamily) => void;
  setMood: (mood: MoodPreset) => void;
  setSpacingDensity: (density: number) => void;
  setTypeScale: (scale: number) => void;
  setContrastLevel: (level: number) => void;
  toggleLayout: (layoutType: string, enabled: boolean) => void;
  updateLayout: (layoutType: string, layout: Layout) => void;
  setCurrentStep: (step: number) => void;
  addLogo: (logo: UploadedAsset) => void;
  addFont: (font: UploadedAsset) => void;
  removeLogo: (id: string) => void;
  removeFont: (id: string) => void;
  undo: () => void;
  redo: () => void;
  resetTemplate: () => void;

  // Settings actions
  setExcludeAppleFonts: (exclude: boolean) => void;

  // Custom styles actions
  addCustomStyle: (style: StylePreset) => void;
  removeCustomStyle: (id: string) => void;
  applyCustomStyle: (style: StylePreset) => void;
  exportStylePreset: () => StylePreset;
}

// Create initial template state
const createInitialTemplate = (): TemplateState => ({
  id: 'new-template',
  name: 'Untitled Template',
  version: '1.0.0',
  tokens: defaultTokens,
  typography: defaultTypography,
  layouts: defaultLayouts,
  accents: [],
  styleFamily: 'clean',
  mood: 'calm',
  spacingDensity: 1.0,
  typeScale: 1.25,
  contrastLevel: 50,
});

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      template: createInitialTemplate(),
      logos: [],
      fonts: [],
      customStyles: [],
      excludeAppleFonts: false,
      currentStep: 0,
      history: [createInitialTemplate()],
      historyIndex: 0,

      setColors: (colors) => {
        const state = get();
        const newTemplate = {
          ...state.template,
          tokens: {
            ...state.template.tokens,
            colors: { ...state.template.tokens.colors, ...colors },
          },
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newTemplate);
        set({
          template: newTemplate,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      setSpacing: (spacing) => {
        const state = get();
        const newTemplate = {
          ...state.template,
          tokens: {
            ...state.template.tokens,
            spacing: { ...state.template.tokens.spacing, ...spacing },
          },
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newTemplate);
        set({
          template: newTemplate,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      setTypography: (typography) => {
        const state = get();
        const newTemplate = {
          ...state.template,
          typography: {
            title: { ...state.template.typography.title, ...typography.title },
            body: { ...state.template.typography.body, ...typography.body },
          },
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newTemplate);
        set({
          template: newTemplate,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      setStyleFamily: (family) => {
        const state = get();
        const fontConfig = styleFontConfig[family];
        const newTemplate = {
          ...state.template,
          styleFamily: family,
          // Update typography to match the style family
          typography: {
            title: {
              ...state.template.typography.title,
              fontFamily: fontConfig.title,
              weight: fontConfig.titleWeight,
            },
            body: {
              ...state.template.typography.body,
              fontFamily: fontConfig.body,
              weight: fontConfig.bodyWeight,
            },
          },
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newTemplate);
        set({
          template: newTemplate,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      setMood: (mood) => {
        const state = get();
        const newTemplate = { ...state.template, mood };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newTemplate);
        set({
          template: newTemplate,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      setSpacingDensity: (density) => {
        const state = get();
        const newTemplate = { ...state.template, spacingDensity: density };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newTemplate);
        set({
          template: newTemplate,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      setTypeScale: (scale) => {
        const state = get();
        const newTemplate = { ...state.template, typeScale: scale };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newTemplate);
        set({
          template: newTemplate,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      setContrastLevel: (level) => {
        const state = get();
        const newTemplate = { ...state.template, contrastLevel: level };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newTemplate);
        set({
          template: newTemplate,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      toggleLayout: (layoutType, enabled) => {
        const state = get();
        const newTemplate = {
          ...state.template,
          layouts: state.template.layouts.map((l) =>
            l.type === layoutType ? { ...l, enabled } : l
          ),
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newTemplate);
        set({
          template: newTemplate,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      updateLayout: (layoutType, layout) => {
        const state = get();
        const newTemplate = {
          ...state.template,
          layouts: state.template.layouts.map((l) =>
            l.type === layoutType ? { ...layout, type: layoutType, enabled: l.enabled } : l
          ),
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newTemplate);
        set({
          template: newTemplate,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      setCurrentStep: (step) => set({ currentStep: step }),

      addLogo: (logo) => {
        set((state) => ({
          logos: [...state.logos, logo],
        }));
      },

      addFont: (font) => {
        set((state) => ({
          fonts: [...state.fonts, font],
        }));
      },

      removeLogo: (id) => {
        set((state) => ({
          logos: state.logos.filter((l) => l.id !== id),
        }));
      },

      removeFont: (id) => {
        set((state) => ({
          fonts: state.fonts.filter((f) => f.id !== id),
        }));
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          set({
            template: state.history[state.historyIndex - 1],
            historyIndex: state.historyIndex - 1,
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          set({
            template: state.history[state.historyIndex + 1],
            historyIndex: state.historyIndex + 1,
          });
        }
      },

      resetTemplate: () => {
        const initial = createInitialTemplate();
        set({
          template: initial,
          history: [initial],
          historyIndex: 0,
          logos: [],
          fonts: [],
        });
      },

      // Settings actions
      setExcludeAppleFonts: (exclude) => set({ excludeAppleFonts: exclude }),

      // Custom styles actions
      addCustomStyle: (style) => {
        set((state) => ({
          customStyles: [...state.customStyles, style],
        }));
      },

      removeCustomStyle: (id) => {
        set((state) => ({
          customStyles: state.customStyles.filter((s) => s.id !== id),
        }));
      },

      applyCustomStyle: (style) => {
        const state = get();
        const fontConfig = styleFontConfig[style.styleFamily] || styleFontConfig.clean;
        const newTemplate = {
          ...state.template,
          tokens: {
            ...state.template.tokens,
            colors: style.colors,
          },
          typography: {
            title: {
              ...state.template.typography.title,
              fontFamily: style.typography.titleFont || fontConfig.title,
              weight: style.typography.titleWeight || fontConfig.titleWeight,
            },
            body: {
              ...state.template.typography.body,
              fontFamily: style.typography.bodyFont || fontConfig.body,
              weight: style.typography.bodyWeight || fontConfig.bodyWeight,
            },
          },
          styleFamily: style.styleFamily,
          mood: style.mood,
          spacingDensity: style.spacingDensity,
          typeScale: style.typeScale,
          contrastLevel: style.contrastLevel,
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newTemplate);
        set({
          template: newTemplate,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      exportStylePreset: () => {
        const state = get();
        const { template } = state;
        return {
          id: crypto.randomUUID ? crypto.randomUUID() : `style-${Date.now()}`,
          name: `${template.name} Style`,
          description: `Style preset exported from ${template.name}`,
          createdAt: new Date().toISOString(),
          colors: template.tokens.colors,
          typography: {
            titleFont: template.typography.title.fontFamily,
            bodyFont: template.typography.body.fontFamily,
            titleWeight: template.typography.title.weight,
            bodyWeight: template.typography.body.weight,
          },
          styleFamily: template.styleFamily,
          mood: template.mood,
          spacingDensity: template.spacingDensity,
          typeScale: template.typeScale,
          contrastLevel: template.contrastLevel,
        };
      },
    }),
    {
      name: 'kova-template-store',
      partialize: (state) => ({
        template: state.template,
        logos: state.logos,
        fonts: state.fonts,
        customStyles: state.customStyles,
        excludeAppleFonts: state.excludeAppleFonts,
      }),
    }
  )
);
