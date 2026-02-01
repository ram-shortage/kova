/**
 * PPTX Export Adapter
 * Uses PptxGenJS to create PowerPoint files with editable master slides
 *
 * Style-Aware Rendering:
 * Charts, timelines, and comparisons adapt to the template's style family,
 * ensuring visual consistency with the chosen design aesthetic.
 */

import PptxGenJS from 'pptxgenjs';
import type { Template, Layout, LayoutType, StyleFamily } from '@kova/shared';
import {
  IExportAdapter,
  ExportResult,
  ExportOptions,
  ExportWarning,
  AdapterCapabilities,
  resolveFontFallback,
} from './adapter.js';

// Slide dimensions in inches (16:9 aspect ratio)
const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 5.625;

// Convert grid units to inches
function gridToInches(
  value: number,
  gridSize: number,
  totalSize: number
): number {
  return (value / gridSize) * totalSize;
}

/**
 * Style Parameters for PPTX Export
 * These control how charts, timelines, and other visual elements are rendered
 * based on the template's style family.
 */
interface StyleParams {
  // Shape styling
  elementRoundness: number;       // 0 = sharp corners, 1+ = rounded
  borderThickness: number;        // Border/stroke width
  shadowOffset: number;           // Drop shadow offset (0 = none)
  useGradients: boolean;          // Whether to use gradient fills

  // Chart specific
  chartStyle: 'filled' | 'outlined' | 'gradient' | 'minimal' | 'stacked';
  barGap: number;                 // Gap between bars (multiplier)

  // Line styling
  lineThickness: number;          // Line weight for timelines, etc.
  lineStyle: 'solid' | 'dashed';  // Line pattern

  // Element styling
  accentThickness: number;        // Accent element thickness
  decorativeElements: boolean;    // Whether to add decorative shapes

  // Typography adjustments
  labelStyle: 'normal' | 'uppercase' | 'small';
}

/**
 * Get style parameters for a given style family
 */
function getStyleParams(styleFamily: StyleFamily): StyleParams {
  switch (styleFamily) {
    case 'clean':
      // Apple-inspired: subtle refinement, minimal decoration
      return {
        elementRoundness: 0.15,
        borderThickness: 0,
        shadowOffset: 0,
        useGradients: false,
        chartStyle: 'filled',
        barGap: 0.3,
        lineThickness: 1.5,
        lineStyle: 'solid',
        accentThickness: 2,
        decorativeElements: false,
        labelStyle: 'normal',
      };

    case 'editorial':
      // Magazine-style: bold contrasts, sharp edges
      return {
        elementRoundness: 0,
        borderThickness: 2,
        shadowOffset: 0,
        useGradients: false,
        chartStyle: 'outlined',
        barGap: 0.4,
        lineThickness: 3,
        lineStyle: 'solid',
        accentThickness: 4,
        decorativeElements: true,
        labelStyle: 'uppercase',
      };

    case 'bold':
      // Nike/Spotify: high-impact, energetic, gradients
      return {
        elementRoundness: 0.1,
        borderThickness: 0,
        shadowOffset: 0,
        useGradients: true,
        chartStyle: 'gradient',
        barGap: 0.25,
        lineThickness: 4,
        lineStyle: 'solid',
        accentThickness: 6,
        decorativeElements: true,
        labelStyle: 'uppercase',
      };

    case 'minimal':
      // Muji/Aesop: sparse, elegant, thin lines
      return {
        elementRoundness: 0,
        borderThickness: 0.5,
        shadowOffset: 0,
        useGradients: false,
        chartStyle: 'minimal',
        barGap: 0.5,
        lineThickness: 0.75,
        lineStyle: 'solid',
        accentThickness: 1,
        decorativeElements: false,
        labelStyle: 'small',
      };

    case 'brutalist':
      // Raw, harsh, intentionally jarring
      return {
        elementRoundness: 0,
        borderThickness: 4,
        shadowOffset: 0,
        useGradients: false,
        chartStyle: 'outlined',
        barGap: 0.15,
        lineThickness: 5,
        lineStyle: 'solid',
        accentThickness: 8,
        decorativeElements: true,
        labelStyle: 'uppercase',
      };

    case 'neubrutalist':
      // Modern brutalism: bold shadows, thick borders
      return {
        elementRoundness: 0.08,
        borderThickness: 3,
        shadowOffset: 4,
        useGradients: false,
        chartStyle: 'filled',
        barGap: 0.2,
        lineThickness: 3,
        lineStyle: 'solid',
        accentThickness: 5,
        decorativeElements: true,
        labelStyle: 'normal',
      };

    case 'bento':
      // Apple product pages: modular boxes, rounded corners
      return {
        elementRoundness: 0.25,
        borderThickness: 0,
        shadowOffset: 0,
        useGradients: true,
        chartStyle: 'filled',
        barGap: 0.35,
        lineThickness: 0,
        lineStyle: 'solid',
        accentThickness: 0,
        decorativeElements: false,
        labelStyle: 'normal',
      };

    case 'swiss':
      // IBM/Swiss railways: grid precision, clean geometry
      return {
        elementRoundness: 0,
        borderThickness: 1,
        shadowOffset: 0,
        useGradients: false,
        chartStyle: 'outlined',
        barGap: 0.3,
        lineThickness: 2,
        lineStyle: 'solid',
        accentThickness: 2,
        decorativeElements: false,
        labelStyle: 'normal',
      };

    case 'corporate':
      // McKinsey/Deloitte: professional, structured
      return {
        elementRoundness: 0.1,
        borderThickness: 1,
        shadowOffset: 2,
        useGradients: false,
        chartStyle: 'stacked',
        barGap: 0.25,
        lineThickness: 2,
        lineStyle: 'solid',
        accentThickness: 3,
        decorativeElements: false,
        labelStyle: 'normal',
      };

    // === ERA-BASED STYLES ===

    case 'artdeco':
      // 1920s glamour: geometric patterns, gold accents, angular sunburst motifs
      return {
        elementRoundness: 0,              // Sharp geometric angles
        borderThickness: 2,               // Defined borders
        shadowOffset: 0,
        useGradients: true,               // Gold gradient effects
        chartStyle: 'outlined',           // Elegant outlined bars
        barGap: 0.35,                     // Generous spacing
        lineThickness: 2,
        lineStyle: 'solid',
        accentThickness: 3,               // Bold accent lines
        decorativeElements: true,         // Geometric ornaments
        labelStyle: 'uppercase',          // Classic caps
      };

    case 'retro70s':
      // Groovy 70s: rounded shapes, warm feel, wavy organic lines
      return {
        elementRoundness: 0.4,            // Very rounded, bubble-like
        borderThickness: 3,               // Bold outlines
        shadowOffset: 3,                  // Layered depth
        useGradients: true,               // Sunset gradients
        chartStyle: 'filled',             // Solid retro fills
        barGap: 0.2,                      // Tight grouping
        lineThickness: 4,                 // Thick groovy lines
        lineStyle: 'solid',
        accentThickness: 5,
        decorativeElements: true,         // Circles, waves
        labelStyle: 'normal',             // Friendly lowercase
      };

    case 'y2k':
      // Late 90s/early 2000s: chrome, gradients, futuristic curves, glossy
      return {
        elementRoundness: 0.3,            // Smooth curves
        borderThickness: 1,               // Thin chrome borders
        shadowOffset: 2,                  // Glossy depth
        useGradients: true,               // Essential Y2K chrome gradients
        chartStyle: 'gradient',           // Shiny metallic bars
        barGap: 0.25,
        lineThickness: 2,
        lineStyle: 'solid',
        accentThickness: 2,
        decorativeElements: true,         // Stars, swooshes
        labelStyle: 'normal',
      };

    // === INDUSTRY STYLES ===

    case 'tech':
      // Silicon Valley: data-driven, grid-based, monospace, clean precision
      return {
        elementRoundness: 0.05,           // Slightly rounded
        borderThickness: 1,
        shadowOffset: 0,
        useGradients: false,              // Flat design
        chartStyle: 'filled',             // Clean data viz
        barGap: 0.2,                      // Dense data
        lineThickness: 1.5,
        lineStyle: 'solid',
        accentThickness: 2,
        decorativeElements: false,        // Pure function
        labelStyle: 'small',              // Monospace feel
      };

    // === DESIGN MOVEMENT STYLES ===

    case 'bauhaus':
      // 1920s German: primary colors, circles/squares/triangles, strict grid
      return {
        elementRoundness: 0,              // Pure geometric
        borderThickness: 3,               // Bold defined shapes
        shadowOffset: 0,                  // Flat, no depth
        useGradients: false,              // Solid primary colors
        chartStyle: 'filled',             // Bold solid fills
        barGap: 0.3,
        lineThickness: 3,                 // Strong structural lines
        lineStyle: 'solid',
        accentThickness: 4,
        decorativeElements: true,         // Geometric shapes as decoration
        labelStyle: 'uppercase',          // Clean sans-serif caps
      };

    case 'memphis':
      // 1980s Italian: playful geometry, squiggles, dots, bold contrasts
      return {
        elementRoundness: 0.2,            // Mix of shapes
        borderThickness: 3,               // Bold outlines
        shadowOffset: 4,                  // Offset shadows (signature Memphis)
        useGradients: false,              // Solid colors
        chartStyle: 'filled',
        barGap: 0.25,
        lineThickness: 3,
        lineStyle: 'dashed',              // Playful dashed lines
        accentThickness: 4,
        decorativeElements: true,         // Squiggles, dots, triangles
        labelStyle: 'normal',
      };

    case 'scandinavian':
      // Nordic: soft curves, natural feel, light, airy, minimal ornamentation
      return {
        elementRoundness: 0.15,           // Soft organic curves
        borderThickness: 0,               // No harsh borders
        shadowOffset: 0,
        useGradients: false,
        chartStyle: 'minimal',            // Light touch
        barGap: 0.4,                      // Breathing room
        lineThickness: 1,                 // Delicate lines
        lineStyle: 'solid',
        accentThickness: 1,
        decorativeElements: false,        // Form follows function
        labelStyle: 'small',              // Understated
      };

    // === MOOD-BASED STYLES ===

    case 'futuristic':
      // Sci-fi: glowing effects, angular geometry, tech-forward, neon lines
      return {
        elementRoundness: 0.05,           // Sharp with slight softening
        borderThickness: 1,
        shadowOffset: 0,
        useGradients: true,               // Glowing gradients
        chartStyle: 'gradient',           // Illuminated bars
        barGap: 0.3,
        lineThickness: 2,
        lineStyle: 'solid',
        accentThickness: 2,
        decorativeElements: true,         // Tech patterns
        labelStyle: 'uppercase',          // HUD-style labels
      };

    case 'organic':
      // Natural: flowing curves, asymmetric, soft edges, nature-inspired
      return {
        elementRoundness: 0.5,            // Very rounded, blob-like
        borderThickness: 0,               // No hard edges
        shadowOffset: 1,                  // Soft natural shadow
        useGradients: true,               // Natural gradients
        chartStyle: 'filled',
        barGap: 0.35,
        lineThickness: 2,
        lineStyle: 'solid',               // Flowing lines
        accentThickness: 3,
        decorativeElements: false,        // Let shapes breathe
        labelStyle: 'normal',
      };

    case 'luxury':
      // High-end: thin lines, generous spacing, refined details, understated
      return {
        elementRoundness: 0.08,           // Subtle refinement
        borderThickness: 0.5,             // Hairline borders
        shadowOffset: 1,                  // Subtle depth
        useGradients: false,
        chartStyle: 'minimal',            // Restrained elegance
        barGap: 0.45,                     // Generous white space
        lineThickness: 0.75,              // Delicate lines
        lineStyle: 'solid',
        accentThickness: 1,               // Subtle accents
        decorativeElements: false,        // Less is more
        labelStyle: 'small',              // Refined typography
      };

    case 'handcrafted':
      // Artisanal: imperfect shapes, sketch-like, warm, textured, human touch
      return {
        elementRoundness: 0.2,            // Slightly imperfect
        borderThickness: 2,               // Hand-drawn weight
        shadowOffset: 2,                  // Layered depth
        useGradients: false,              // Solid, authentic
        chartStyle: 'filled',
        barGap: 0.3,
        lineThickness: 2.5,               // Brush-stroke weight
        lineStyle: 'solid',
        accentThickness: 3,
        decorativeElements: true,         // Hand-drawn flourishes
        labelStyle: 'normal',             // Friendly, approachable
      };

    case 'industrial':
      // Factory: raw materials, exposed structure, utilitarian, bold, functional
      return {
        elementRoundness: 0,              // Hard machine edges
        borderThickness: 4,               // Heavy structural
        shadowOffset: 0,
        useGradients: false,              // Raw, unfinished
        chartStyle: 'outlined',           // Structural framework
        barGap: 0.15,                     // Tight, efficient
        lineThickness: 4,                 // Heavy-duty lines
        lineStyle: 'solid',
        accentThickness: 6,               // Bold markers
        decorativeElements: false,        // Pure function
        labelStyle: 'uppercase',          // Stencil-like
      };

    default:
      return {
        elementRoundness: 0.1,
        borderThickness: 1,
        shadowOffset: 0,
        useGradients: false,
        chartStyle: 'filled',
        barGap: 0.3,
        lineThickness: 2,
        lineStyle: 'solid',
        accentThickness: 2,
        decorativeElements: false,
        labelStyle: 'normal',
      };
  }
}

export class PptxAdapter implements IExportAdapter {
  readonly format = 'pptx' as const;
  readonly capabilities: AdapterCapabilities = {
    supportsMasterSlides: true,
    supportsEditableText: true,
    supportsEditableShapes: true,
    supportsGradients: true,
    supportsCustomFonts: true,
    maxSlideCount: 500,
  };

  async export(options: ExportOptions): Promise<ExportResult> {
    const startTime = Date.now();
    const warnings: ExportWarning[] = [];
    const { template } = options;

    try {
      // Validate template
      const validation = await this.validate(template);
      if (!validation.valid) {
        return {
          success: false,
          warnings: [],
          errors: validation.errors.map((e) => ({
            code: 'VALIDATION_ERROR',
            message: e,
            recoverable: false,
          })),
          metrics: {
            startTime,
            endTime: Date.now(),
            slideCount: 0,
            masterSlideCount: 0,
            fontSubstitutions: 0,
          },
        };
      }

      // Create presentation
      const pptx = new PptxGenJS();
      pptx.author = 'Dynamic Template Studio';
      pptx.title = template.name;
      pptx.subject = template.description || 'Generated presentation template';

      // Set layout to 16:9
      pptx.defineLayout({ name: 'LAYOUT_16x9', width: SLIDE_WIDTH, height: SLIDE_HEIGHT });
      pptx.layout = 'LAYOUT_16x9';

      // Resolve fonts with fallbacks
      const titleFont = resolveFontFallback(template.typography.title.fontFamily, 'pptx');
      const bodyFont = resolveFontFallback(template.typography.body.fontFamily, 'pptx');

      if (titleFont !== template.typography.title.fontFamily) {
        warnings.push({
          code: 'FONT_SUBSTITUTED',
          message: `Title font "${template.typography.title.fontFamily}" substituted with "${titleFont}"`,
          severity: 'medium',
        });
      }

      if (bodyFont !== template.typography.body.fontFamily) {
        warnings.push({
          code: 'FONT_SUBSTITUTED',
          message: `Body font "${template.typography.body.fontFamily}" substituted with "${bodyFont}"`,
          severity: 'medium',
        });
      }

      // Define master slides for each enabled layout
      const enabledLayouts = template.layouts.filter((l) => l.enabled !== false);
      let masterSlideCount = 0;

      for (const layout of enabledLayouts) {
        this.defineMasterSlide(pptx, layout, template, titleFont, bodyFont);
        masterSlideCount++;
      }

      // Create sample slides from each master
      for (const layout of enabledLayouts) {
        this.createSlideFromLayout(pptx, layout, template, titleFont, bodyFont);
      }

      // Generate output
      const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;

      return {
        success: true,
        buffer,
        warnings,
        errors: [],
        metrics: {
          startTime,
          endTime: Date.now(),
          slideCount: enabledLayouts.length,
          masterSlideCount,
          fontSubstitutions: warnings.filter((w) => w.code === 'FONT_SUBSTITUTED').length,
        },
      };
    } catch (error) {
      return {
        success: false,
        warnings,
        errors: [
          {
            code: 'EXPORT_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
            recoverable: false,
          },
        ],
        metrics: {
          startTime,
          endTime: Date.now(),
          slideCount: 0,
          masterSlideCount: 0,
          fontSubstitutions: 0,
        },
      };
    }
  }

  async validate(template: Template): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check required fields
    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.tokens) errors.push('Tokens are required');
    if (!template.typography) errors.push('Typography is required');
    if (!template.layouts || template.layouts.length === 0) {
      errors.push('At least one layout is required');
    }

    // If critical fields are missing, return early to avoid null reference errors
    if (!template.tokens || !template.typography) {
      return {
        valid: false,
        errors,
      };
    }

    // Check font sizes meet minimums
    if (template.typography.title && template.typography.title.fontSize < 18) {
      errors.push('Title font size must be at least 18pt');
    }
    if (template.typography.body && template.typography.body.fontSize < 12) {
      errors.push('Body font size must be at least 12pt');
    }

    // Check color format
    const hexPattern = /^#[0-9a-fA-F]{6}$/;
    const colors = template.tokens.colors;
    if (colors) {
      for (const [key, value] of Object.entries(colors)) {
        if (!hexPattern.test(value)) {
          errors.push(`Invalid color format for ${key}: ${value}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private defineMasterSlide(
    pptx: PptxGenJS,
    layout: Layout,
    template: Template,
    titleFont: string,
    bodyFont: string
  ): void {
    const { colors } = template.tokens;
    const masterName = `MASTER_${layout.type.toUpperCase()}`;

    // Define slide master
    pptx.defineSlideMaster({
      title: masterName,
      background: { color: colors.background.replace('#', '') },
    });
  }

  private createSlideFromLayout(
    pptx: PptxGenJS,
    layout: Layout,
    template: Template,
    titleFont: string,
    bodyFont: string
  ): void {
    const { colors } = template.tokens;
    const { title: titleTypo, body: bodyTypo } = template.typography;
    const masterName = `MASTER_${layout.type.toUpperCase()}`;

    const slide = pptx.addSlide({ masterName });

    // Add content based on layout type
    for (const region of layout.regions) {
      const x = gridToInches(region.bounds.x, layout.grid.columns, SLIDE_WIDTH);
      const y = gridToInches(region.bounds.y, layout.grid.rows, SLIDE_HEIGHT);
      const w = gridToInches(region.bounds.w, layout.grid.columns, SLIDE_WIDTH);
      const h = gridToInches(region.bounds.h, layout.grid.rows, SLIDE_HEIGHT);

      const padding = 0.1;

      if (region.role === 'header') {
        slide.addText(this.getPlaceholderTitle(layout.type), {
          x: x + padding,
          y: y + padding,
          w: w - padding * 2,
          h: h - padding * 2,
          fontFace: titleFont,
          fontSize: titleTypo.fontSize * 0.75, // Scale for presentation
          color: colors.primary.replace('#', ''),
          bold: titleTypo.weight >= 600,
          valign: 'middle',
        });
      } else if (region.role === 'body') {
        // Skip placeholder text for layouts with special visual content
        const specialLayoutTypes: LayoutType[] = [
          'data', 'data-bar-vertical', 'data-bar-horizontal', 'data-line',
          'data-pie', 'data-donut', 'data-scatter', 'data-area', 'data-stacked-bar',
          'timeline', 'comparison', 'iconography'
        ];
        if (!specialLayoutTypes.includes(layout.type)) {
          slide.addText(this.getPlaceholderBody(layout.type), {
            x: x + padding,
            y: y + padding,
            w: w - padding * 2,
            h: h - padding * 2,
            fontFace: bodyFont,
            fontSize: bodyTypo.fontSize * 0.75,
            color: colors.neutral.replace('#', ''),
            valign: 'top',
          });
        }
      } else if (region.role === 'media') {
        // Skip media placeholder for layouts with special visual content
        const specialMediaLayouts: LayoutType[] = [
          'data', 'data-bar-vertical', 'data-bar-horizontal', 'data-line',
          'data-pie', 'data-donut', 'data-scatter', 'data-area', 'data-stacked-bar',
          'iconography'
        ];
        if (!specialMediaLayouts.includes(layout.type)) {
          slide.addShape('rect', {
            x: x + padding,
            y: y + padding,
            w: w - padding * 2,
            h: h - padding * 2,
            fill: { color: colors.secondary.replace('#', ''), transparency: 85 },
            line: { color: colors.secondary.replace('#', ''), width: 1.5, dashType: 'dash' },
          });

          // Add a simple image icon representation
          const iconSize = Math.min(w, h) * 0.25;
          const iconX = x + w / 2 - iconSize / 2;
          const iconY = y + h / 2 - iconSize / 2 - 0.15;

          // Mountain/landscape icon shape
          slide.addShape('rect', {
            x: iconX,
            y: iconY,
            w: iconSize,
            h: iconSize * 0.75,
            fill: { color: colors.secondary.replace('#', ''), transparency: 60 },
          });

          slide.addText('Insert Image or Video', {
            x: x + padding,
            y: y + h / 2 + iconSize * 0.3,
            w: w - padding * 2,
            h: 0.35,
            fontFace: bodyFont,
            fontSize: 11,
            color: colors.secondary.replace('#', ''),
            align: 'center',
            valign: 'middle',
          });

          slide.addText('Drag and drop or click to upload', {
            x: x + padding,
            y: y + h / 2 + iconSize * 0.3 + 0.3,
            w: w - padding * 2,
            h: 0.25,
            fontFace: bodyFont,
            fontSize: 9,
            color: colors.neutral.replace('#', ''),
            transparency: 50,
            align: 'center',
            valign: 'middle',
          });
        }
      } else if (region.role === 'caption') {
        const captionText = this.getCaptionText(layout.type);
        slide.addText(captionText, {
          x: x + padding,
          y: y + padding,
          w: w - padding * 2,
          h: h - padding * 2,
          fontFace: bodyFont,
          fontSize: bodyTypo.fontSize * 0.6,
          color: colors.neutral.replace('#', ''),
          transparency: 40, // 40% transparency for muted caption text
          italic: true,
        });
      }
    }

    // Add special visualizations for specific layout types (charts, timelines, etc.)
    this.addSpecialLayoutContent(slide, layout, template, titleFont, bodyFont);

    // Add accent line if present
    if (template.accents && template.accents.some((a) => a.type === 'line')) {
      slide.addShape('line', {
        x: 0.5,
        y: SLIDE_HEIGHT - 0.3,
        w: 2,
        h: 0,
        line: { color: colors.accent.replace('#', ''), width: 2 },
      });
    }
  }

  private getPlaceholderTitle(layoutType: LayoutType): string {
    const titles: Record<LayoutType, string> = {
      title: 'Annual Strategy Review',
      section: 'Strategic Initiatives',
      agenda: 'Today\'s Agenda',
      content: 'Key Performance Metrics',
      media: 'Product Showcase',
      comparison: 'Solution Comparison',
      timeline: 'Project Roadmap',
      quote: '',
      data: 'Quarterly Revenue Analysis',
      'data-bar-vertical': 'Quarterly Revenue Analysis',
      'data-bar-horizontal': 'Performance by Category',
      'data-line': 'Growth Trends Over Time',
      'data-pie': 'Revenue Distribution',
      'data-donut': 'Market Share Breakdown',
      'data-scatter': 'Correlation Analysis',
      'data-area': 'Cumulative Performance',
      'data-stacked-bar': 'Segment Composition',
      iconography: 'Our Core Values',
      appendix: 'Appendix: Supporting Data',
    };
    return titles[layoutType] || 'Slide Title';
  }

  private getPlaceholderBody(layoutType: LayoutType): string {
    const bodies: Record<LayoutType, string> = {
      title: 'Driving Innovation & Growth in 2024',
      section: 'Q4 Performance Overview',
      agenda: '1. Executive Summary\n2. Market Analysis\n3. Strategic Initiatives\n4. Financial Projections\n5. Q&A Session',
      content: 'Our team achieved a 23% increase in customer satisfaction scores this quarter, driven by improved response times and enhanced product features.\n\n• Average response time reduced by 40%\n• Net Promoter Score increased to 72\n• Customer retention rate at 94%',
      media: '',
      comparison: '',
      timeline: '',
      quote: '"Innovation distinguishes between a leader and a follower. We choose to lead."\n\n— Sarah Chen, CEO',
      data: '',
      'data-bar-vertical': '',
      'data-bar-horizontal': '',
      'data-line': '',
      'data-pie': '',
      'data-donut': '',
      'data-scatter': '',
      'data-area': '',
      'data-stacked-bar': '',
      iconography: '',
      appendix: 'This section contains detailed methodology, data sources, and additional analysis referenced in the main presentation. All figures are based on Q4 2024 audited financial statements.',
    };
    return bodies[layoutType] || 'Content placeholder';
  }

  private getCaptionText(layoutType: LayoutType): string {
    const captions: Record<LayoutType, string> = {
      title: 'Confidential — For internal use only',
      section: '',
      agenda: 'Time: 60 minutes',
      content: 'Source: Internal analytics dashboard, Q4 2024',
      media: 'Figure 1: Product demonstration video',
      comparison: 'Based on standard enterprise configuration',
      timeline: 'Dates subject to change based on resource availability',
      quote: 'Annual Leadership Summit, 2024',
      data: 'Data as of December 31, 2024',
      'data-bar-vertical': 'Data as of December 31, 2024',
      'data-bar-horizontal': 'Source: Internal metrics, Q4 2024',
      'data-line': 'Trend data: January - December 2024',
      'data-pie': 'Distribution as of fiscal year end',
      'data-donut': 'Market share data, Q4 2024',
      'data-scatter': 'R-squared: 0.87',
      'data-area': 'Cumulative figures, YTD 2024',
      'data-stacked-bar': 'Segment breakdown by quarter',
      iconography: 'Company values established 2018',
      appendix: 'Reference: See detailed methodology in Section A.1',
    };
    return captions[layoutType] || 'Caption text';
  }

  private addSpecialLayoutContent(
    slide: PptxGenJS.Slide,
    layout: Layout,
    template: Template,
    titleFont: string,
    bodyFont: string
  ): void {
    const { colors } = template.tokens;
    const { body: bodyTypo } = template.typography;
    // Get style-specific parameters (default to 'clean' if not set)
    const styleFamily = (template as { styleFamily?: StyleFamily }).styleFamily || 'clean';
    const styleParams = getStyleParams(styleFamily);

    switch (layout.type) {
      case 'data':
      case 'data-bar-vertical':
        this.addDataChartContent(slide, layout, colors, bodyFont, bodyTypo.fontSize, styleParams, 'bar-vertical');
        break;
      case 'data-bar-horizontal':
        this.addDataChartContent(slide, layout, colors, bodyFont, bodyTypo.fontSize, styleParams, 'bar-horizontal');
        break;
      case 'data-line':
        this.addDataChartContent(slide, layout, colors, bodyFont, bodyTypo.fontSize, styleParams, 'line');
        break;
      case 'data-pie':
        this.addDataChartContent(slide, layout, colors, bodyFont, bodyTypo.fontSize, styleParams, 'pie');
        break;
      case 'data-donut':
        this.addDataChartContent(slide, layout, colors, bodyFont, bodyTypo.fontSize, styleParams, 'donut');
        break;
      case 'data-scatter':
        this.addDataChartContent(slide, layout, colors, bodyFont, bodyTypo.fontSize, styleParams, 'scatter');
        break;
      case 'data-area':
        this.addDataChartContent(slide, layout, colors, bodyFont, bodyTypo.fontSize, styleParams, 'area');
        break;
      case 'data-stacked-bar':
        this.addDataChartContent(slide, layout, colors, bodyFont, bodyTypo.fontSize, styleParams, 'stacked-bar');
        break;
      case 'timeline':
        this.addTimelineContent(slide, layout, colors, bodyFont, bodyTypo.fontSize, styleParams);
        break;
      case 'comparison':
        this.addComparisonContent(slide, layout, colors, bodyFont, bodyTypo.fontSize, styleParams);
        break;
      case 'iconography':
        this.addIconographyContent(slide, layout, colors, bodyFont, bodyTypo.fontSize, styleParams);
        break;
      case 'media':
        // Media placeholder is already handled in region rendering
        break;
    }
  }

  /**
   * Add actual editable PowerPoint charts using PptxGenJS chart API.
   * These are real Excel-backed charts that users can edit after download.
   */
  private addDataChartContent(
    slide: PptxGenJS.Slide,
    layout: Layout,
    colors: Template['tokens']['colors'],
    bodyFont: string,
    baseFontSize: number,
    styleParams: StyleParams,
    chartType: string = 'bar-vertical'
  ): void {
    // Find the media/chart region
    const chartRegion = layout.regions.find(r => r.role === 'media' || r.id?.includes('chart'));
    if (!chartRegion) return;

    const x = gridToInches(chartRegion.bounds.x, layout.grid.columns, SLIDE_WIDTH);
    const y = gridToInches(chartRegion.bounds.y, layout.grid.rows, SLIDE_HEIGHT);
    const w = gridToInches(chartRegion.bounds.w, layout.grid.columns, SLIDE_WIDTH);
    const h = gridToInches(chartRegion.bounds.h, layout.grid.rows, SLIDE_HEIGHT);

    // Sample data for charts - users can edit this data in PowerPoint
    const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
    const values = [42, 58, 65, 78];

    // Chart colors from template
    const primaryColor = colors.primary.replace('#', '');
    const secondaryColor = colors.secondary.replace('#', '');
    const accentColor = colors.accent.replace('#', '');
    const neutralColor = colors.neutral.replace('#', '');

    // Common chart options
    const commonOptions: PptxGenJS.IChartOpts = {
      x, y, w, h,
      showLegend: false,
      showTitle: false,
      showValue: true,
      catAxisLabelColor: neutralColor,
      valAxisLabelColor: neutralColor,
      catAxisLabelFontFace: bodyFont,
      valAxisLabelFontFace: bodyFont,
      catAxisLabelFontSize: baseFontSize * 0.6,
      valAxisLabelFontSize: baseFontSize * 0.6,
      dataLabelFontFace: bodyFont,
      dataLabelFontSize: baseFontSize * 0.5,
      dataLabelColor: neutralColor,
    };

    // Route to specific chart type
    switch (chartType) {
      case 'line':
        this.renderLineChart(slide, labels, values, primaryColor, accentColor, commonOptions);
        break;
      case 'area':
        this.renderAreaChart(slide, labels, values, primaryColor, accentColor, commonOptions);
        break;
      case 'pie':
        this.renderPieChart(slide, labels, values, [primaryColor, secondaryColor, accentColor, neutralColor], commonOptions);
        break;
      case 'donut':
        this.renderDonutChart(slide, labels, values, [primaryColor, secondaryColor, accentColor, neutralColor], commonOptions);
        break;
      case 'scatter':
        this.renderScatterChart(slide, primaryColor, accentColor, commonOptions);
        break;
      case 'bar-horizontal':
        this.renderHorizontalBarChart(slide, labels, values, primaryColor, accentColor, commonOptions);
        break;
      case 'stacked-bar':
        this.renderStackedBarChart(slide, labels, [primaryColor, secondaryColor, accentColor], commonOptions);
        break;
      case 'bar-vertical':
      default:
        this.renderVerticalBarChart(slide, labels, values, primaryColor, accentColor, commonOptions);
        break;
    }
  }

  /**
   * Render an actual editable vertical bar chart
   */
  private renderVerticalBarChart(
    slide: PptxGenJS.Slide,
    labels: string[],
    values: number[],
    primaryColor: string,
    accentColor: string,
    options: PptxGenJS.IChartOpts
  ): void {
    // Create chart data with highlighted last bar
    const chartColors = values.map((_, i) => i === values.length - 1 ? accentColor : primaryColor);

    slide.addChart('bar', [
      {
        name: 'Revenue',
        labels,
        values,
      }
    ], {
      ...options,
      barDir: 'col', // Vertical bars
      barGapWidthPct: 50,
      chartColors,
      dataBorder: { pt: 0, color: 'FFFFFF' },
      dataLabelPosition: 'outEnd',
      showValue: true,
      valAxisHidden: true,
      catGridLine: { style: 'none' },
      valGridLine: { style: 'none' },
    });
  }

  /**
   * Render an actual editable horizontal bar chart
   */
  private renderHorizontalBarChart(
    slide: PptxGenJS.Slide,
    labels: string[],
    values: number[],
    primaryColor: string,
    accentColor: string,
    options: PptxGenJS.IChartOpts
  ): void {
    const chartColors = values.map((_, i) => i === values.length - 1 ? accentColor : primaryColor);

    slide.addChart('bar', [
      {
        name: 'Performance',
        labels,
        values,
      }
    ], {
      ...options,
      barDir: 'bar', // Horizontal bars
      barGapWidthPct: 40,
      chartColors,
      dataBorder: { pt: 0, color: 'FFFFFF' },
      dataLabelPosition: 'outEnd',
      showValue: true,
      valAxisHidden: true,
      catGridLine: { style: 'none' },
      valGridLine: { style: 'none' },
    });
  }

  /**
   * Render an actual editable line chart
   */
  private renderLineChart(
    slide: PptxGenJS.Slide,
    labels: string[],
    values: number[],
    primaryColor: string,
    accentColor: string,
    options: PptxGenJS.IChartOpts
  ): void {
    slide.addChart('line', [
      {
        name: 'Trend',
        labels,
        values,
      }
    ], {
      ...options,
      chartColors: [primaryColor],
      lineDataSymbol: 'circle',
      lineDataSymbolSize: 8,
      lineSize: 2,
      catGridLine: { style: 'none' },
      valGridLine: { color: 'CCCCCC', style: 'dash', size: 0.5 },
      showValue: false,
    });
  }

  /**
   * Render an actual editable area chart
   */
  private renderAreaChart(
    slide: PptxGenJS.Slide,
    labels: string[],
    values: number[],
    primaryColor: string,
    accentColor: string,
    options: PptxGenJS.IChartOpts
  ): void {
    slide.addChart('area', [
      {
        name: 'Growth',
        labels,
        values,
      }
    ], {
      ...options,
      chartColors: [primaryColor],
      catGridLine: { style: 'none' },
      valGridLine: { color: 'CCCCCC', style: 'dash', size: 0.5 },
      showValue: false,
    });
  }

  /**
   * Render an actual editable pie chart
   */
  private renderPieChart(
    slide: PptxGenJS.Slide,
    labels: string[],
    values: number[],
    chartColors: string[],
    options: PptxGenJS.IChartOpts
  ): void {
    // Pie chart data format
    const pieLabels = ['Product A', 'Product B', 'Product C', 'Other'];
    const pieValues = [35, 25, 22, 18];

    slide.addChart('pie', [
      {
        name: 'Distribution',
        labels: pieLabels,
        values: pieValues,
      }
    ], {
      ...options,
      chartColors,
      showLegend: true,
      legendPos: 'r',
      showLeaderLines: true,
      showPercent: true,
      showValue: false,
    });
  }

  /**
   * Render an actual editable donut chart
   */
  private renderDonutChart(
    slide: PptxGenJS.Slide,
    labels: string[],
    values: number[],
    chartColors: string[],
    options: PptxGenJS.IChartOpts
  ): void {
    const donutLabels = ['Category A', 'Category B', 'Category C', 'Category D'];
    const donutValues = [30, 28, 25, 17];

    slide.addChart('doughnut', [
      {
        name: 'Breakdown',
        labels: donutLabels,
        values: donutValues,
      }
    ], {
      ...options,
      chartColors,
      showLegend: true,
      legendPos: 'r',
      showPercent: true,
      showValue: false,
      holeSize: 50,
    });
  }

  /**
   * Render an actual editable scatter chart
   * Note: PptxGenJS scatter charts need X values as labels and Y as values
   */
  private renderScatterChart(
    slide: PptxGenJS.Slide,
    primaryColor: string,
    accentColor: string,
    options: PptxGenJS.IChartOpts
  ): void {
    // Scatter chart format: X values as labels, Y values as values
    slide.addChart('scatter', [
      {
        name: 'Data Points',
        labels: [10, 20, 30, 40, 50, 60, 70, 80],
        values: [25, 45, 35, 55, 48, 72, 65, 85],
      }
    ], {
      ...options,
      chartColors: [primaryColor],
      lineDataSymbol: 'circle',
      lineDataSymbolSize: 6,
      lineSize: 0, // No connecting line
      catGridLine: { color: 'CCCCCC', style: 'dash', size: 0.5 },
      valGridLine: { color: 'CCCCCC', style: 'dash', size: 0.5 },
      showValue: false,
    });
  }

  /**
   * Render an actual editable stacked bar chart
   */
  private renderStackedBarChart(
    slide: PptxGenJS.Slide,
    labels: string[],
    chartColors: string[],
    options: PptxGenJS.IChartOpts
  ): void {
    slide.addChart('bar', [
      {
        name: 'Series A',
        labels,
        values: [20, 25, 30, 28],
      },
      {
        name: 'Series B',
        labels,
        values: [15, 18, 22, 25],
      },
      {
        name: 'Series C',
        labels,
        values: [10, 15, 13, 18],
      }
    ], {
      ...options,
      barDir: 'col',
      barGrouping: 'stacked',
      chartColors,
      dataBorder: { pt: 0, color: 'FFFFFF' },
      showValue: false,
      showLegend: true,
      legendPos: 'b',
      catGridLine: { style: 'none' },
      valGridLine: { style: 'none' },
    });
  }

  private addTimelineContent(
    slide: PptxGenJS.Slide,
    layout: Layout,
    colors: Template['tokens']['colors'],
    bodyFont: string,
    baseFontSize: number,
    styleParams: StyleParams
  ): void {
    // Find the body region for timeline content
    const bodyRegion = layout.regions.find(r => r.role === 'body');
    if (!bodyRegion) return;

    const x = gridToInches(bodyRegion.bounds.x, layout.grid.columns, SLIDE_WIDTH);
    const y = gridToInches(bodyRegion.bounds.y, layout.grid.rows, SLIDE_HEIGHT);
    const w = gridToInches(bodyRegion.bounds.w, layout.grid.columns, SLIDE_WIDTH);
    const h = gridToInches(bodyRegion.bounds.h, layout.grid.rows, SLIDE_HEIGHT);

    const milestones = [
      { year: '2024', label: 'Research', desc: 'Market analysis complete' },
      { year: '2025', label: 'Design', desc: 'Product prototype ready' },
      { year: '2026', label: 'Launch', desc: 'Global market release' },
      { year: '2027', label: 'Scale', desc: 'International expansion' },
    ];

    const lineY = y + h * 0.4;
    const padding = 0.3;
    const pointSpacing = (w - padding * 2) / (milestones.length - 1);

    // Style-specific label formatting
    const formatLabel = (label: string) =>
      styleParams.labelStyle === 'uppercase' ? label.toUpperCase() : label;

    // Bento style: Card-based timeline
    if (styleParams.chartStyle === 'filled' && styleParams.elementRoundness > 0.2) {
      const cardW = (w - padding * 2) / milestones.length - 0.15;
      const cardH = h * 0.7;
      const cardY = y + h * 0.15;

      milestones.forEach((milestone, i) => {
        const cardX = x + padding + i * (cardW + 0.15);
        const isFirst = i === 0;

        // Card shadow
        if (styleParams.shadowOffset > 0) {
          slide.addShape('rect', {
            x: cardX + styleParams.shadowOffset * 0.02,
            y: cardY + styleParams.shadowOffset * 0.02,
            w: cardW,
            h: cardH,
            fill: { color: '000000', transparency: 85 },
            rectRadius: styleParams.elementRoundness * 0.15,
          });
        }

        // Card background
        slide.addShape('rect', {
          x: cardX,
          y: cardY,
          w: cardW,
          h: cardH,
          fill: { color: isFirst ? colors.primary.replace('#', '') : colors.secondary.replace('#', ''), transparency: isFirst ? 0 : 85 },
          rectRadius: styleParams.elementRoundness * 0.15,
        });

        // Year
        slide.addText(milestone.year, {
          x: cardX,
          y: cardY + 0.15,
          w: cardW,
          h: 0.3,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.55,
          color: isFirst ? colors.background.replace('#', '') : colors.primary.replace('#', ''),
          align: 'center',
          bold: true,
        });

        // Label
        slide.addText(formatLabel(milestone.label), {
          x: cardX,
          y: cardY + cardH * 0.4,
          w: cardW,
          h: 0.3,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.5,
          color: isFirst ? colors.background.replace('#', '') : colors.neutral.replace('#', ''),
          align: 'center',
          bold: true,
        });

        // Description
        slide.addText(milestone.desc, {
          x: cardX + 0.1,
          y: cardY + cardH * 0.6,
          w: cardW - 0.2,
          h: 0.4,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.35,
          color: isFirst ? colors.background.replace('#', '') : colors.neutral.replace('#', ''),
          transparency: isFirst ? 30 : 40,
          align: 'center',
        });
      });
      return;
    }

    // Brutalist/Swiss style: Grid-based with strong lines
    if (styleParams.borderThickness >= 3 || styleParams.chartStyle === 'outlined') {
      // Thick timeline line
      slide.addShape('line', {
        x: x + padding,
        y: lineY,
        w: w - padding * 2,
        h: 0,
        line: { color: colors.primary.replace('#', ''), width: styleParams.lineThickness },
      });

      milestones.forEach((milestone, i) => {
        const pointX = x + padding + i * pointSpacing;
        const isFirst = i === 0;

        // Square marker (brutalist) or circle (swiss)
        const markerSize = 0.25;
        if (styleParams.elementRoundness === 0) {
          slide.addShape('rect', {
            x: pointX - markerSize / 2,
            y: lineY - markerSize / 2,
            w: markerSize,
            h: markerSize,
            fill: { color: isFirst ? colors.accent.replace('#', '') : colors.primary.replace('#', '') },
            line: { color: colors.primary.replace('#', ''), width: styleParams.borderThickness * 0.5 },
          });
        } else {
          slide.addShape('ellipse', {
            x: pointX - markerSize / 2,
            y: lineY - markerSize / 2,
            w: markerSize,
            h: markerSize,
            fill: { color: colors.background.replace('#', '') },
            line: { color: isFirst ? colors.accent.replace('#', '') : colors.primary.replace('#', ''), width: 2 },
          });
        }

        // Year - bold, uppercase for brutalist
        slide.addText(formatLabel(milestone.year), {
          x: pointX - 0.5,
          y: lineY - 0.6,
          w: 1,
          h: 0.35,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.65,
          color: colors.primary.replace('#', ''),
          align: 'center',
          bold: true,
        });

        // Label
        slide.addText(formatLabel(milestone.label), {
          x: pointX - 0.6,
          y: lineY + 0.25,
          w: 1.2,
          h: 0.3,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.5,
          color: colors.neutral.replace('#', ''),
          align: 'center',
          bold: true,
        });
      });
      return;
    }

    // Minimal style: Thin line with subtle markers
    if (styleParams.chartStyle === 'minimal') {
      // Thin timeline line
      slide.addShape('line', {
        x: x + padding,
        y: lineY,
        w: w - padding * 2,
        h: 0,
        line: { color: colors.neutral.replace('#', ''), width: 0.75, transparency: 50 },
      });

      milestones.forEach((milestone, i) => {
        const pointX = x + padding + i * pointSpacing;

        // Small dot marker
        slide.addShape('ellipse', {
          x: pointX - 0.04,
          y: lineY - 0.04,
          w: 0.08,
          h: 0.08,
          fill: { color: i === 0 ? colors.accent.replace('#', '') : colors.neutral.replace('#', '') },
        });

        // Year - light weight
        slide.addText(milestone.year, {
          x: pointX - 0.4,
          y: lineY - 0.45,
          w: 0.8,
          h: 0.25,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.45,
          color: colors.neutral.replace('#', ''),
          transparency: 30,
          align: 'center',
        });

        // Label
        slide.addText(milestone.label, {
          x: pointX - 0.5,
          y: lineY + 0.2,
          w: 1,
          h: 0.25,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.45,
          color: colors.neutral.replace('#', ''),
          align: 'center',
        });
      });
      return;
    }

    // Default style (clean, corporate, bold)
    // Timeline line
    slide.addShape('line', {
      x: x + padding,
      y: lineY,
      w: w - padding * 2,
      h: 0,
      line: { color: colors.secondary.replace('#', ''), width: styleParams.lineThickness },
    });

    milestones.forEach((milestone, i) => {
      const pointX = x + padding + i * pointSpacing;
      const isFirst = i === 0;
      const markerSize = 0.2;

      // Shadow for markers (corporate/neubrutalist)
      if (styleParams.shadowOffset > 0) {
        slide.addShape('ellipse', {
          x: pointX - markerSize / 2 + styleParams.shadowOffset * 0.015,
          y: lineY - markerSize / 2 + styleParams.shadowOffset * 0.015,
          w: markerSize,
          h: markerSize,
          fill: { color: '000000', transparency: 80 },
        });
      }

      // Circle marker
      slide.addShape('ellipse', {
        x: pointX - markerSize / 2,
        y: lineY - markerSize / 2,
        w: markerSize,
        h: markerSize,
        fill: { color: isFirst ? colors.accent.replace('#', '') : colors.primary.replace('#', '') },
      });

      // Year label
      slide.addText(formatLabel(milestone.year), {
        x: pointX - 0.4,
        y: lineY - 0.55,
        w: 0.8,
        h: 0.3,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.6,
        color: colors.primary.replace('#', ''),
        align: 'center',
        bold: true,
      });

      // Phase label
      slide.addText(formatLabel(milestone.label), {
        x: pointX - 0.5,
        y: lineY + 0.2,
        w: 1,
        h: 0.25,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.55,
        color: colors.neutral.replace('#', ''),
        align: 'center',
        bold: true,
      });

      // Description
      slide.addText(milestone.desc, {
        x: pointX - 0.7,
        y: lineY + 0.45,
        w: 1.4,
        h: 0.3,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.4,
        color: colors.neutral.replace('#', ''),
        transparency: 40,
        align: 'center',
      });
    });
  }

  private addComparisonContent(
    slide: PptxGenJS.Slide,
    layout: Layout,
    colors: Template['tokens']['colors'],
    bodyFont: string,
    baseFontSize: number,
    styleParams: StyleParams
  ): void {
    // Find the body region
    const bodyRegion = layout.regions.find(r => r.role === 'body');
    if (!bodyRegion) return;

    const x = gridToInches(bodyRegion.bounds.x, layout.grid.columns, SLIDE_WIDTH);
    const y = gridToInches(bodyRegion.bounds.y, layout.grid.rows, SLIDE_HEIGHT);
    const w = gridToInches(bodyRegion.bounds.w, layout.grid.columns, SLIDE_WIDTH);
    const h = gridToInches(bodyRegion.bounds.h, layout.grid.rows, SLIDE_HEIGHT);

    const gap = 0.4;
    const cardWidth = (w - gap) / 2;
    const cardHeight = h * 0.88;
    const padding = 0.18;
    const cornerRadius = styleParams.elementRoundness * 0.12;

    // Style-specific label formatting
    const formatLabel = (label: string) =>
      styleParams.labelStyle === 'uppercase' ? label.toUpperCase() : label;

    const optionAFeatures = ['Lower upfront cost', 'Standard support', 'Basic analytics', '99.5% uptime SLA'];
    const optionBFeatures = ['Premium features', 'Priority support 24/7', 'Advanced analytics', '99.99% uptime SLA'];

    // Bento style: Filled cards with subtle gradients
    if (styleParams.chartStyle === 'filled' && styleParams.elementRoundness > 0.2) {
      // Option A - subtle card
      slide.addShape('rect', {
        x: x,
        y: y,
        w: cardWidth,
        h: cardHeight,
        fill: { color: colors.secondary.replace('#', ''), transparency: 88 },
        rectRadius: cornerRadius,
      });

      slide.addText(formatLabel('Option A'), {
        x: x + padding,
        y: y + padding,
        w: cardWidth - padding * 2,
        h: 0.4,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.75,
        color: colors.primary.replace('#', ''),
        bold: true,
      });

      optionAFeatures.forEach((feature, i) => {
        slide.addText(`•  ${feature}`, {
          x: x + padding,
          y: y + 0.7 + i * 0.38,
          w: cardWidth - padding * 2,
          h: 0.32,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.48,
          color: colors.neutral.replace('#', ''),
        });
      });

      // Option B - highlighted card
      slide.addShape('rect', {
        x: x + cardWidth + gap,
        y: y,
        w: cardWidth,
        h: cardHeight,
        fill: { color: colors.primary.replace('#', '') },
        rectRadius: cornerRadius,
      });

      slide.addText(formatLabel('Option B') + '  ★', {
        x: x + cardWidth + gap + padding,
        y: y + padding,
        w: cardWidth - padding * 2,
        h: 0.4,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.75,
        color: colors.background.replace('#', ''),
        bold: true,
      });

      optionBFeatures.forEach((feature, i) => {
        slide.addText(`•  ${feature}`, {
          x: x + cardWidth + gap + padding,
          y: y + 0.7 + i * 0.38,
          w: cardWidth - padding * 2,
          h: 0.32,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.48,
          color: colors.background.replace('#', ''),
          transparency: 15,
        });
      });
      return;
    }

    // Brutalist/Editorial style: Bold borders, stark contrast
    if (styleParams.borderThickness >= 2) {
      // Option A - thick border
      slide.addShape('rect', {
        x: x,
        y: y,
        w: cardWidth,
        h: cardHeight,
        fill: { color: colors.background.replace('#', '') },
        line: { color: colors.primary.replace('#', ''), width: styleParams.borderThickness },
      });

      slide.addText(formatLabel('PLAN A'), {
        x: x + padding,
        y: y + padding,
        w: cardWidth - padding * 2,
        h: 0.45,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.8,
        color: colors.primary.replace('#', ''),
        bold: true,
      });

      // Thick divider line
      slide.addShape('line', {
        x: x + padding,
        y: y + 0.6,
        w: cardWidth - padding * 2,
        h: 0,
        line: { color: colors.primary.replace('#', ''), width: styleParams.borderThickness * 0.5 },
      });

      optionAFeatures.forEach((feature, i) => {
        slide.addText(formatLabel(feature), {
          x: x + padding,
          y: y + 0.75 + i * 0.4,
          w: cardWidth - padding * 2,
          h: 0.35,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.5,
          color: colors.neutral.replace('#', ''),
        });
      });

      // Option B - filled accent
      slide.addShape('rect', {
        x: x + cardWidth + gap,
        y: y,
        w: cardWidth,
        h: cardHeight,
        fill: { color: colors.accent.replace('#', '') },
        line: { color: colors.primary.replace('#', ''), width: styleParams.borderThickness },
      });

      slide.addText(formatLabel('PLAN B ★'), {
        x: x + cardWidth + gap + padding,
        y: y + padding,
        w: cardWidth - padding * 2,
        h: 0.45,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.8,
        color: colors.primary.replace('#', ''),
        bold: true,
      });

      slide.addShape('line', {
        x: x + cardWidth + gap + padding,
        y: y + 0.6,
        w: cardWidth - padding * 2,
        h: 0,
        line: { color: colors.primary.replace('#', ''), width: styleParams.borderThickness * 0.5 },
      });

      optionBFeatures.forEach((feature, i) => {
        slide.addText(formatLabel(feature), {
          x: x + cardWidth + gap + padding,
          y: y + 0.75 + i * 0.4,
          w: cardWidth - padding * 2,
          h: 0.35,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.5,
          color: colors.primary.replace('#', ''),
        });
      });
      return;
    }

    // Minimal style: Subtle dividers, light touch
    if (styleParams.chartStyle === 'minimal') {
      // Just a vertical divider line
      slide.addShape('line', {
        x: x + cardWidth + gap / 2,
        y: y,
        w: 0,
        h: cardHeight,
        line: { color: colors.neutral.replace('#', ''), width: 0.5, transparency: 60 },
      });

      // Option A
      slide.addText('Option A', {
        x: x,
        y: y,
        w: cardWidth,
        h: 0.35,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.6,
        color: colors.neutral.replace('#', ''),
        transparency: 30,
      });

      optionAFeatures.forEach((feature, i) => {
        slide.addText(feature, {
          x: x,
          y: y + 0.5 + i * 0.35,
          w: cardWidth,
          h: 0.3,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.45,
          color: colors.neutral.replace('#', ''),
        });
      });

      // Option B
      slide.addText('Option B  •  Recommended', {
        x: x + cardWidth + gap,
        y: y,
        w: cardWidth,
        h: 0.35,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.6,
        color: colors.primary.replace('#', ''),
      });

      optionBFeatures.forEach((feature, i) => {
        slide.addText(feature, {
          x: x + cardWidth + gap,
          y: y + 0.5 + i * 0.35,
          w: cardWidth,
          h: 0.3,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.45,
          color: colors.neutral.replace('#', ''),
        });
      });
      return;
    }

    // Default/Corporate style: Clean cards with shadows
    // Option A shadow
    if (styleParams.shadowOffset > 0) {
      slide.addShape('rect', {
        x: x + styleParams.shadowOffset * 0.02,
        y: y + styleParams.shadowOffset * 0.02,
        w: cardWidth,
        h: cardHeight,
        fill: { color: '000000', transparency: 85 },
        rectRadius: cornerRadius,
      });
    }

    // Option A card
    slide.addShape('rect', {
      x: x,
      y: y,
      w: cardWidth,
      h: cardHeight,
      fill: { color: colors.primary.replace('#', ''), transparency: 92 },
      line: styleParams.borderThickness > 0 ? { color: colors.primary.replace('#', ''), width: styleParams.borderThickness } : undefined,
      rectRadius: cornerRadius,
    });

    slide.addText(formatLabel('Option A'), {
      x: x + padding,
      y: y + padding,
      w: cardWidth - padding * 2,
      h: 0.38,
      fontFace: bodyFont,
      fontSize: baseFontSize * 0.7,
      color: colors.primary.replace('#', ''),
      bold: true,
    });

    optionAFeatures.forEach((feature, i) => {
      slide.addText(`✓  ${feature}`, {
        x: x + padding,
        y: y + 0.6 + i * 0.36,
        w: cardWidth - padding * 2,
        h: 0.3,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.5,
        color: colors.neutral.replace('#', ''),
      });
    });

    // Option B shadow
    if (styleParams.shadowOffset > 0) {
      slide.addShape('rect', {
        x: x + cardWidth + gap + styleParams.shadowOffset * 0.02,
        y: y + styleParams.shadowOffset * 0.02,
        w: cardWidth,
        h: cardHeight,
        fill: { color: '000000', transparency: 85 },
        rectRadius: cornerRadius,
      });
    }

    // Option B card (highlighted)
    slide.addShape('rect', {
      x: x + cardWidth + gap,
      y: y,
      w: cardWidth,
      h: cardHeight,
      fill: { color: colors.accent.replace('#', ''), transparency: 88 },
      line: { color: colors.accent.replace('#', ''), width: Math.max(styleParams.borderThickness, 2) },
      rectRadius: cornerRadius,
    });

    slide.addText(formatLabel('Option B') + '  ★ Recommended', {
      x: x + cardWidth + gap + padding,
      y: y + padding,
      w: cardWidth - padding * 2,
      h: 0.38,
      fontFace: bodyFont,
      fontSize: baseFontSize * 0.7,
      color: colors.accent.replace('#', ''),
      bold: true,
    });

    optionBFeatures.forEach((feature, i) => {
      slide.addText(`✓  ${feature}`, {
        x: x + cardWidth + gap + padding,
        y: y + 0.6 + i * 0.36,
        w: cardWidth - padding * 2,
        h: 0.3,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.5,
        color: colors.neutral.replace('#', ''),
      });
    });
  }

  private addIconographyContent(
    slide: PptxGenJS.Slide,
    layout: Layout,
    colors: Template['tokens']['colors'],
    bodyFont: string,
    baseFontSize: number,
    styleParams: StyleParams
  ): void {
    // Find all media regions (these are the icon placeholders)
    const mediaRegions = layout.regions.filter(r => r.role === 'media');
    if (mediaRegions.length === 0) return;

    // Sample icons with labels and descriptions for each region
    const sampleIcons = [
      { symbol: '★', label: 'Excellence', desc: 'Striving for the highest quality' },
      { symbol: '◆', label: 'Innovation', desc: 'Pioneering new solutions' },
      { symbol: '●', label: 'Integrity', desc: 'Building trust through action' },
      { symbol: '▲', label: 'Growth', desc: 'Continuous improvement' },
      { symbol: '■', label: 'Teamwork', desc: 'Achieving more together' },
      { symbol: '♦', label: 'Focus', desc: 'Delivering on priorities' },
    ];

    // Style-specific label formatting
    const formatLabel = (label: string) =>
      styleParams.labelStyle === 'uppercase' ? label.toUpperCase() : label;

    mediaRegions.forEach((region, i) => {
      const icon = sampleIcons[i % sampleIcons.length];

      const x = gridToInches(region.bounds.x, layout.grid.columns, SLIDE_WIDTH);
      const y = gridToInches(region.bounds.y, layout.grid.rows, SLIDE_HEIGHT);
      const w = gridToInches(region.bounds.w, layout.grid.columns, SLIDE_WIDTH);
      const h = gridToInches(region.bounds.h, layout.grid.rows, SLIDE_HEIGHT);

      const iconSize = Math.min(w, h) * 0.5;
      const iconX = x + (w - iconSize) / 2;
      const iconY = y + h * 0.08;

      // Bento style: Filled rounded squares with gradient feel
      if (styleParams.chartStyle === 'filled' && styleParams.elementRoundness > 0.2) {
        // Rounded square background
        slide.addShape('rect', {
          x: iconX,
          y: iconY,
          w: iconSize,
          h: iconSize,
          fill: { color: i === 0 ? colors.accent.replace('#', '') : colors.primary.replace('#', ''), transparency: i === 0 ? 0 : 10 },
          rectRadius: styleParams.elementRoundness * 0.15,
        });

        slide.addText(icon.symbol, {
          x: iconX,
          y: iconY,
          w: iconSize,
          h: iconSize,
          fontFace: bodyFont,
          fontSize: baseFontSize * 1.4,
          color: colors.background.replace('#', ''),
          align: 'center',
          valign: 'middle',
        });

        slide.addText(formatLabel(icon.label), {
          x: x,
          y: iconY + iconSize + 0.18,
          w: w,
          h: 0.35,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.6,
          color: colors.neutral.replace('#', ''),
          align: 'center',
          bold: true,
        });

        slide.addText(icon.desc, {
          x: x,
          y: iconY + iconSize + 0.52,
          w: w,
          h: 0.4,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.4,
          color: colors.neutral.replace('#', ''),
          transparency: 40,
          align: 'center',
        });
        return;
      }

      // Brutalist/Editorial style: Bold shapes, thick borders
      if (styleParams.borderThickness >= 2) {
        // Square with thick border
        slide.addShape('rect', {
          x: iconX,
          y: iconY,
          w: iconSize,
          h: iconSize,
          fill: { color: i === 0 ? colors.accent.replace('#', '') : colors.background.replace('#', '') },
          line: { color: colors.primary.replace('#', ''), width: styleParams.borderThickness },
        });

        slide.addText(icon.symbol, {
          x: iconX,
          y: iconY,
          w: iconSize,
          h: iconSize,
          fontFace: bodyFont,
          fontSize: baseFontSize * 1.3,
          color: i === 0 ? colors.background.replace('#', '') : colors.primary.replace('#', ''),
          align: 'center',
          valign: 'middle',
        });

        slide.addText(formatLabel(icon.label), {
          x: x,
          y: iconY + iconSize + 0.15,
          w: w,
          h: 0.38,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.65,
          color: colors.primary.replace('#', ''),
          align: 'center',
          bold: true,
        });
        return;
      }

      // Minimal style: No backgrounds, just symbols
      if (styleParams.chartStyle === 'minimal') {
        slide.addText(icon.symbol, {
          x: iconX,
          y: iconY,
          w: iconSize,
          h: iconSize,
          fontFace: bodyFont,
          fontSize: baseFontSize * 1.5,
          color: colors.neutral.replace('#', ''),
          transparency: 30,
          align: 'center',
          valign: 'middle',
        });

        slide.addText(icon.label, {
          x: x,
          y: iconY + iconSize + 0.1,
          w: w,
          h: 0.3,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.5,
          color: colors.neutral.replace('#', ''),
          align: 'center',
        });

        slide.addText(icon.desc, {
          x: x,
          y: iconY + iconSize + 0.4,
          w: w,
          h: 0.35,
          fontFace: bodyFont,
          fontSize: baseFontSize * 0.38,
          color: colors.neutral.replace('#', ''),
          transparency: 50,
          align: 'center',
        });
        return;
      }

      // Default/Corporate style: Circles with subtle styling
      // Shadow for neubrutalist/corporate
      if (styleParams.shadowOffset > 0) {
        slide.addShape('ellipse', {
          x: iconX + styleParams.shadowOffset * 0.02,
          y: iconY + styleParams.shadowOffset * 0.02,
          w: iconSize,
          h: iconSize,
          fill: { color: '000000', transparency: 85 },
        });
      }

      // Icon circle background
      slide.addShape('ellipse', {
        x: iconX,
        y: iconY,
        w: iconSize,
        h: iconSize,
        fill: { color: colors.primary.replace('#', ''), transparency: 88 },
        line: styleParams.borderThickness > 0
          ? { color: colors.primary.replace('#', ''), width: styleParams.borderThickness }
          : undefined,
      });

      // Icon symbol
      slide.addText(icon.symbol, {
        x: iconX,
        y: iconY,
        w: iconSize,
        h: iconSize,
        fontFace: bodyFont,
        fontSize: baseFontSize * 1.2,
        color: colors.primary.replace('#', ''),
        align: 'center',
        valign: 'middle',
      });

      // Label below icon
      slide.addText(formatLabel(icon.label), {
        x: x,
        y: iconY + iconSize + 0.15,
        w: w,
        h: 0.35,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.65,
        color: colors.neutral.replace('#', ''),
        align: 'center',
        bold: true,
      });

      // Description below label
      slide.addText(icon.desc, {
        x: x,
        y: iconY + iconSize + 0.5,
        w: w,
        h: 0.4,
        fontFace: bodyFont,
        fontSize: baseFontSize * 0.45,
        color: colors.neutral.replace('#', ''),
        transparency: 35,
        align: 'center',
      });
    });
  }

  /**
   * Extended icon library for user reference
   * These can be used as bullets, decorative elements, or value representations
   */
  static readonly ICON_LIBRARY = {
    // Shapes
    shapes: {
      circle: '●',
      circleOutline: '○',
      square: '■',
      squareOutline: '□',
      diamond: '◆',
      diamondOutline: '◇',
      triangle: '▲',
      triangleDown: '▼',
      triangleRight: '▶',
      triangleLeft: '◀',
    },
    // Stars & Ratings
    stars: {
      star: '★',
      starOutline: '☆',
      sparkle: '✦',
      sparkleAlt: '✧',
      asterisk: '✱',
      florette: '✿',
    },
    // Checkmarks & Status
    status: {
      check: '✓',
      checkBold: '✔',
      cross: '✗',
      crossBold: '✘',
      plus: '+',
      minus: '−',
    },
    // Arrows & Direction
    arrows: {
      right: '→',
      left: '←',
      up: '↑',
      down: '↓',
      doubleRight: '»',
      doubleLeft: '«',
      rightBold: '➔',
      circleRight: '➜',
    },
    // Bullets & Lists
    bullets: {
      bullet: '•',
      dash: '–',
      diamond: '◆',
      arrow: '▸',
      circle: '○',
      square: '▪',
      triangleSmall: '‣',
    },
    // Business & Abstract
    business: {
      target: '◎',
      gear: '⚙',
      lightning: '⚡',
      flag: '⚑',
      crown: '♔',
      heart: '♥',
      club: '♣',
      spade: '♠',
    },
    // Numbers in circles
    numberedCircles: {
      one: '①',
      two: '②',
      three: '③',
      four: '④',
      five: '⑤',
      six: '⑥',
      seven: '⑦',
      eight: '⑧',
      nine: '⑨',
      ten: '⑩',
    },
    // Letters in circles
    letteredCircles: {
      a: 'Ⓐ',
      b: 'Ⓑ',
      c: 'Ⓒ',
      d: 'Ⓓ',
      e: 'Ⓔ',
      f: 'Ⓕ',
    },
  };
}

// Export singleton instance
export const pptxAdapter = new PptxAdapter();
