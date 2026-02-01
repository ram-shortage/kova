/**
 * Zod Validation Schemas - Runtime validation matching SPEC.md
 */

import { z } from 'zod';

// Hex color validation
const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color (#RRGGBB)');

// Token colors schema
export const tokenColorsSchema = z.object({
  primary: hexColorSchema,
  secondary: hexColorSchema,
  neutral: hexColorSchema,
  background: hexColorSchema,
  accent: hexColorSchema,
});

// Spacing schema
export const tokenSpacingSchema = z.object({
  base: z.number().min(2, 'Base spacing must be at least 2'),
  m: z.number().min(8, 'Medium spacing must be at least 8'),
  l: z.number().min(16, 'Large spacing must be at least 16'),
});

// Radius schema
export const tokenRadiusSchema = z.object({
  sm: z.number().min(0, 'Small radius cannot be negative'),
  md: z.number().min(0, 'Medium radius cannot be negative'),
  lg: z.number().min(0, 'Large radius cannot be negative'),
});

// Complete tokens schema
export const tokensSchema = z.object({
  colors: tokenColorsSchema,
  spacing: tokenSpacingSchema,
  radius: tokenRadiusSchema,
});

// Typography style schema (for title)
export const titleTypographyStyleSchema = z.object({
  fontFamily: z.string().min(1, 'Font family is required'),
  fontSize: z.number().min(18, 'Title font size must be at least 18pt'),
  lineHeight: z.number().min(1, 'Line height must be at least 1'),
  weight: z.number().min(100).max(900, 'Font weight must be between 100 and 900'),
});

// Typography style schema (for body)
export const bodyTypographyStyleSchema = z.object({
  fontFamily: z.string().min(1, 'Font family is required'),
  fontSize: z.number().min(12, 'Body font size must be at least 12pt'),
  lineHeight: z.number().min(1, 'Line height must be at least 1'),
  weight: z.number().min(100).max(900, 'Font weight must be between 100 and 900'),
});

// Typography schema
export const typographySchema = z.object({
  title: titleTypographyStyleSchema,
  body: bodyTypographyStyleSchema,
});

// Region bounds schema
export const regionBoundsSchema = z.object({
  x: z.number().min(0, 'X position cannot be negative'),
  y: z.number().min(0, 'Y position cannot be negative'),
  w: z.number().min(0, 'Width cannot be negative'),
  h: z.number().min(0, 'Height cannot be negative'),
});

// Region role enum
export const regionRoleSchema = z.enum(['header', 'body', 'footer', 'media', 'caption']);

// Region schema
export const regionSchema = z.object({
  id: z.string().min(1, 'Region ID is required'),
  role: regionRoleSchema,
  bounds: regionBoundsSchema,
});

// Chart type enum for data visualization layouts
export const chartTypeSchema = z.enum([
  'bar-vertical',
  'bar-horizontal',
  'line',
  'pie',
  'donut',
  'scatter',
  'area',
  'stacked-bar',
]);

// Layout type enum
export const layoutTypeSchema = z.enum([
  'title',
  'section',
  'agenda',
  'content',
  'media',
  'comparison',
  'timeline',
  'quote',
  'data',
  'data-bar-vertical',
  'data-bar-horizontal',
  'data-line',
  'data-pie',
  'data-donut',
  'data-scatter',
  'data-area',
  'data-stacked-bar',
  'iconography',
  'appendix',
]);

// Content type enum
export const contentTypeSchema = z.enum(['text', 'image', 'chart', 'table']);

// Layout rules schema
export const layoutRulesSchema = z.object({
  minFontSize: z.number().min(10).optional(),
  maxLineCount: z.number().min(1).optional(),
  contentTypes: z.array(contentTypeSchema).optional(),
});

// Grid config schema
export const gridConfigSchema = z.object({
  columns: z.number().min(1, 'Grid must have at least 1 column'),
  rows: z.number().min(1, 'Grid must have at least 1 row'),
  gutter: z.number().min(0, 'Gutter cannot be negative'),
});

// Layout schema
export const layoutSchema = z.object({
  name: z.string().min(1, 'Layout name is required'),
  type: layoutTypeSchema,
  grid: gridConfigSchema,
  regions: z.array(regionSchema).min(1, 'Layout must have at least one region'),
  rules: layoutRulesSchema.optional(),
  enabled: z.boolean().optional().default(true),
  chartType: chartTypeSchema.optional(),
});

// Accent type enum
export const accentTypeSchema = z.enum(['shape', 'line', 'pattern', 'gradient', 'iconSet']);

// Accent schema
export const accentSchema = z.object({
  id: z.string().min(1, 'Accent ID is required'),
  type: accentTypeSchema,
  props: z.record(z.unknown()).optional(),
});

// Export format enum
export const exportFormatSchema = z.enum(['pptx']);

// Export profile schema
export const exportProfileSchema = z.object({
  format: exportFormatSchema,
  fontFallbacks: z.record(z.string()),
  colorMapping: z.record(z.string()).optional(),
  layoutAdaptation: z.record(z.unknown()).optional(),
});

// Complete template schema
export const templateSchema = z.object({
  id: z.string().min(1, 'Template ID is required'),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  version: z.string().min(1, 'Version is required'),
  tokens: tokensSchema,
  typography: typographySchema,
  accents: z.array(accentSchema).optional(),
  layouts: z.array(layoutSchema).min(1, 'Template must have at least one layout'),
  exportProfiles: z.array(exportProfileSchema).optional(),
});

// Style family enum - expanded with modern design movements
export const styleFamilySchema = z.enum([
  'clean',
  'editorial',
  'bold',
  'minimal',
  'brutalist',
  'neubrutalist',
  'bento',
  'swiss',
  'corporate',
]);

// Mood preset enum
export const moodPresetSchema = z.enum(['calm', 'energetic', 'premium', 'technical']);

// Template state schema (for UI)
export const templateStateSchema = templateSchema.extend({
  styleFamily: styleFamilySchema,
  mood: moodPresetSchema,
  spacingDensity: z.number().min(0.5).max(2.0),
  typeScale: z.number().min(1.1).max(1.5),
  contrastLevel: z.number().min(0).max(100),
});

// Validation helper functions
export function validateTemplate(data: unknown) {
  return templateSchema.safeParse(data);
}

export function validateTemplateState(data: unknown) {
  return templateStateSchema.safeParse(data);
}

// Type inference from schemas
export type ValidatedTemplate = z.infer<typeof templateSchema>;
export type ValidatedTemplateState = z.infer<typeof templateStateSchema>;
