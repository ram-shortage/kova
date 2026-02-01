/**
 * Template Types - Matching SPEC.md JSON Schema
 * Dynamic Template Studio
 */

// Hex color string pattern: #RRGGBB
export type HexColor = string;

// Token colors as defined in schema
export interface TokenColors {
  primary: HexColor;
  secondary: HexColor;
  neutral: HexColor;
  background: HexColor;
  accent: HexColor;
}

// Spacing tokens
export interface TokenSpacing {
  base: number; // minimum 2
  m: number;    // minimum 8
  l: number;    // minimum 16
}

// Radius tokens
export interface TokenRadius {
  sm: number; // minimum 0
  md: number; // minimum 0
  lg: number; // minimum 0
}

// Complete tokens object
export interface Tokens {
  colors: TokenColors;
  spacing: TokenSpacing;
  radius: TokenRadius;
}

// Typography style
export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;   // title: minimum 18, body: minimum 12
  lineHeight: number; // minimum 1
  weight: number;     // 100-900
}

// Typography with title and body
export interface Typography {
  title: TypographyStyle;
  body: TypographyStyle;
}

// Region bounds on grid
export interface RegionBounds {
  x: number; // minimum 0
  y: number; // minimum 0
  w: number; // minimum 0
  h: number; // minimum 0
}

// Region role types
export type RegionRole = 'header' | 'body' | 'footer' | 'media' | 'caption';

// Region definition
export interface Region {
  id: string;
  role: RegionRole;
  bounds: RegionBounds;
}

// Chart types for data visualization layouts
export type ChartType =
  | 'bar-vertical'
  | 'bar-horizontal'
  | 'line'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'area'
  | 'stacked-bar';

// Layout types (11 base types + chart variants)
export type LayoutType =
  | 'title'
  | 'section'
  | 'agenda'
  | 'content'
  | 'media'
  | 'comparison'
  | 'timeline'
  | 'quote'
  | 'data'
  | 'data-bar-vertical'
  | 'data-bar-horizontal'
  | 'data-line'
  | 'data-pie'
  | 'data-donut'
  | 'data-scatter'
  | 'data-area'
  | 'data-stacked-bar'
  | 'iconography'
  | 'appendix';

// Content types for layout rules
export type ContentType = 'text' | 'image' | 'chart' | 'table';

// Layout rules
export interface LayoutRules {
  minFontSize?: number;  // minimum 10
  maxLineCount?: number; // minimum 1
  contentTypes?: ContentType[];
}

// Grid configuration
export interface GridConfig {
  columns: number; // minimum 1
  rows: number;    // minimum 1
  gutter: number;  // minimum 0
}

// Layout definition
export interface Layout {
  name: string;
  type: LayoutType;
  grid: GridConfig;
  regions: Region[];
  rules?: LayoutRules;
  enabled?: boolean; // UI state
  chartType?: ChartType; // For data visualization layouts
}

// Accent types
export type AccentType = 'shape' | 'line' | 'pattern' | 'gradient' | 'iconSet';

// Accent definition
export interface Accent {
  id: string;
  type: AccentType;
  props?: Record<string, unknown>;
}

// Export format types
export type ExportFormat = 'pptx';

// Export profile
export interface ExportProfile {
  format: ExportFormat;
  fontFallbacks: Record<string, string>;
  colorMapping?: Record<string, string>;
  layoutAdaptation?: Record<string, unknown>;
}

// Complete template document
export interface Template {
  id: string;
  name: string;
  description?: string;
  version: string;
  tokens: Tokens;
  typography: Typography;
  accents?: Accent[];
  layouts: Layout[];
  exportProfiles?: ExportProfile[];
}

// Style families - inspired by iconic design movements and brands
// clean: Apple-inspired minimalism with clear hierarchy
// editorial: Magazine-style bold typography (Vogue, GQ)
// bold: High-impact corporate (Nike, Spotify)
// minimal: Sparse elegance with ample whitespace (Muji, Aesop)
// brutalist: Raw, unpolished aesthetic (Balenciaga, Yale School of Art)
// neubrutalist: Bold shadows and thick borders with bright colors
// bento: Modular compartmentalized layouts (Apple product pages)
// swiss: Grid-based precision typography (IBM, Swiss railways)
// corporate: Professional polish with structured layouts (McKinsey, Deloitte)
// Era-based: artdeco, retro70s, y2k
// Industry: tech
// Design movements: bauhaus, memphis, scandinavian
// Mood-based: futuristic, organic, luxury, handcrafted, industrial
export type StyleFamily =
  // Original styles
  | 'clean'
  | 'editorial'
  | 'bold'
  | 'minimal'
  | 'brutalist'
  | 'neubrutalist'
  | 'bento'
  | 'swiss'
  | 'corporate'
  // Era-based styles
  | 'artdeco'
  | 'retro70s'
  | 'y2k'
  // Industry styles
  | 'tech'
  // Design movement styles
  | 'bauhaus'
  | 'memphis'
  | 'scandinavian'
  // Mood-based styles
  | 'futuristic'
  | 'organic'
  | 'luxury'
  | 'handcrafted'
  | 'industrial';

// Mood presets
export type MoodPreset = 'calm' | 'energetic' | 'premium' | 'technical';

// Template state for UI
export interface TemplateState extends Template {
  styleFamily: StyleFamily;
  mood: MoodPreset;
  spacingDensity: number; // 0.5 - 2.0
  typeScale: number;      // 1.1 - 1.5
  contrastLevel: number;  // 0 - 100
}
