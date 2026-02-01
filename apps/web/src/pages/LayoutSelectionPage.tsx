import { useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';
import { SlidePreview } from '../components/preview/SlidePreview';
import type { Layout, LayoutType, Region, GridConfig } from '@kova/shared';

interface LayoutVariant {
  id: string;
  name: string;
  description: string;
  layout: Layout;
}

/**
 * Generate meaningful layout variants for each layout type
 * Each variant has dramatically different visual arrangements
 */
function generateLayoutVariants(baseLayout: Layout): LayoutVariant[] {
  const { type } = baseLayout;

  switch (type) {
    case 'title':
      return [
        {
          id: 'title-centered',
          name: 'Centered',
          description: 'Title centered with subtitle below',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 6, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 2, y: 2, w: 8, h: 2 } },
              { id: 'subtitle', role: 'body', bounds: { x: 3, y: 4, w: 6, h: 1 } },
            ],
          },
        },
        {
          id: 'title-left',
          name: 'Left Aligned',
          description: 'Title left-aligned with accent line',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 6, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 1, w: 7, h: 2 } },
              { id: 'subtitle', role: 'body', bounds: { x: 1, y: 3, w: 5, h: 1 } },
            ],
          },
        },
        {
          id: 'title-bottom',
          name: 'Bottom Heavy',
          description: 'Title at bottom third',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 6, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 4, w: 10, h: 1 } },
              { id: 'subtitle', role: 'body', bounds: { x: 1, y: 5, w: 8, h: 1 } },
            ],
          },
        },
        {
          id: 'title-split',
          name: 'Split Layout',
          description: 'Title left, media right',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 6, gutter: 24 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 0, y: 1, w: 5, h: 3 } },
              { id: 'subtitle', role: 'body', bounds: { x: 0, y: 4, w: 5, h: 1 } },
              { id: 'media', role: 'media', bounds: { x: 6, y: 0, w: 6, h: 6 } },
            ],
          },
        },
      ];

    case 'content':
      return [
        {
          id: 'content-standard',
          name: 'Standard',
          description: 'Title top, content below',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'content', role: 'body', bounds: { x: 1, y: 2, w: 10, h: 5 } },
            ],
          },
        },
        {
          id: 'content-two-column',
          name: 'Two Column',
          description: 'Content split into two columns',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 20 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'left', role: 'body', bounds: { x: 1, y: 2, w: 5, h: 5 } },
              { id: 'right', role: 'body', bounds: { x: 6, y: 2, w: 5, h: 5 } },
            ],
          },
        },
        {
          id: 'content-sidebar',
          name: 'With Sidebar',
          description: 'Main content with narrow sidebar',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'content', role: 'body', bounds: { x: 1, y: 2, w: 7, h: 5 } },
              { id: 'sidebar', role: 'body', bounds: { x: 9, y: 2, w: 2, h: 5 } },
            ],
          },
        },
        {
          id: 'content-compact',
          name: 'Compact',
          description: 'Tighter spacing, more content area',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 8 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 0, y: 0, w: 12, h: 1 } },
              { id: 'content', role: 'body', bounds: { x: 0, y: 1, w: 12, h: 7 } },
            ],
          },
        },
      ];

    case 'data':
      return [
        {
          id: 'data-full',
          name: 'Full Width Chart',
          description: 'Chart spans full width',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'chart', role: 'media', bounds: { x: 0, y: 2, w: 12, h: 5 } },
            ],
          },
        },
        {
          id: 'data-with-legend',
          name: 'Chart + Legend',
          description: 'Chart left, legend/notes right',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 20 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'chart', role: 'media', bounds: { x: 1, y: 2, w: 7, h: 5 } },
              { id: 'legend', role: 'body', bounds: { x: 9, y: 2, w: 2, h: 5 } },
            ],
          },
        },
        {
          id: 'data-dashboard',
          name: 'Dashboard Grid',
          description: 'Multiple smaller charts',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 12 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 0, y: 0, w: 12, h: 1 } },
              { id: 'chart1', role: 'media', bounds: { x: 0, y: 1, w: 6, h: 3 } },
              { id: 'chart2', role: 'media', bounds: { x: 6, y: 1, w: 6, h: 3 } },
              { id: 'chart3', role: 'media', bounds: { x: 0, y: 4, w: 12, h: 3 } },
            ],
          },
        },
        {
          id: 'data-metrics',
          name: 'Key Metrics',
          description: 'Big numbers with supporting chart',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'metrics', role: 'body', bounds: { x: 1, y: 1, w: 10, h: 2 } },
              { id: 'chart', role: 'media', bounds: { x: 1, y: 4, w: 10, h: 3 } },
            ],
          },
        },
      ];

    case 'comparison':
      return [
        {
          id: 'comparison-equal',
          name: 'Equal Split',
          description: 'Two equal columns',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 24 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'left', role: 'body', bounds: { x: 0, y: 2, w: 5, h: 5 } },
              { id: 'right', role: 'body', bounds: { x: 7, y: 2, w: 5, h: 5 } },
            ],
          },
        },
        {
          id: 'comparison-stacked',
          name: 'Stacked',
          description: 'Options stacked vertically',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'top', role: 'body', bounds: { x: 1, y: 1, w: 10, h: 3 } },
              { id: 'bottom', role: 'body', bounds: { x: 1, y: 5, w: 10, h: 3 } },
            ],
          },
        },
        {
          id: 'comparison-asymmetric',
          name: 'Asymmetric',
          description: 'Featured option larger',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'featured', role: 'body', bounds: { x: 0, y: 2, w: 7, h: 5 } },
              { id: 'other', role: 'body', bounds: { x: 8, y: 2, w: 4, h: 5 } },
            ],
          },
        },
        {
          id: 'comparison-triple',
          name: 'Three Options',
          description: 'Compare three items',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 12 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 0, y: 0, w: 12, h: 1 } },
              { id: 'opt1', role: 'body', bounds: { x: 0, y: 2, w: 4, h: 5 } },
              { id: 'opt2', role: 'body', bounds: { x: 4, y: 2, w: 4, h: 5 } },
              { id: 'opt3', role: 'body', bounds: { x: 8, y: 2, w: 4, h: 5 } },
            ],
          },
        },
      ];

    case 'timeline':
      return [
        {
          id: 'timeline-horizontal',
          name: 'Horizontal',
          description: 'Timeline flows left to right',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'timeline', role: 'body', bounds: { x: 0, y: 2, w: 12, h: 5 } },
            ],
          },
        },
        {
          id: 'timeline-vertical',
          name: 'Vertical',
          description: 'Timeline flows top to bottom',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 5, h: 1 } },
              { id: 'timeline', role: 'body', bounds: { x: 1, y: 1, w: 3, h: 7 } },
              { id: 'detail', role: 'body', bounds: { x: 5, y: 1, w: 6, h: 7 } },
            ],
          },
        },
        {
          id: 'timeline-cards',
          name: 'Card Grid',
          description: 'Milestones as cards',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 12 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 0, y: 0, w: 12, h: 1 } },
              { id: 'card1', role: 'body', bounds: { x: 0, y: 2, w: 3, h: 5 } },
              { id: 'card2', role: 'body', bounds: { x: 3, y: 2, w: 3, h: 5 } },
              { id: 'card3', role: 'body', bounds: { x: 6, y: 2, w: 3, h: 5 } },
              { id: 'card4', role: 'body', bounds: { x: 9, y: 2, w: 3, h: 5 } },
            ],
          },
        },
        {
          id: 'timeline-roadmap',
          name: 'Roadmap',
          description: 'Phased with descriptions',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'phases', role: 'body', bounds: { x: 0, y: 1, w: 12, h: 2 } },
              { id: 'details', role: 'body', bounds: { x: 1, y: 4, w: 10, h: 3 } },
            ],
          },
        },
      ];

    case 'quote':
      return [
        {
          id: 'quote-centered',
          name: 'Centered',
          description: 'Quote centered on slide',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'quote', role: 'body', bounds: { x: 2, y: 2, w: 8, h: 3 } },
              { id: 'attribution', role: 'caption', bounds: { x: 3, y: 5, w: 6, h: 1 } },
            ],
          },
        },
        {
          id: 'quote-left',
          name: 'Left Aligned',
          description: 'Quote aligned left with accent',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'quote', role: 'body', bounds: { x: 1, y: 1, w: 7, h: 4 } },
              { id: 'attribution', role: 'caption', bounds: { x: 1, y: 5, w: 5, h: 1 } },
            ],
          },
        },
        {
          id: 'quote-with-image',
          name: 'With Portrait',
          description: 'Quote with speaker image',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 20 },
            regions: [
              { id: 'image', role: 'media', bounds: { x: 1, y: 1, w: 3, h: 5 } },
              { id: 'quote', role: 'body', bounds: { x: 5, y: 2, w: 6, h: 3 } },
              { id: 'attribution', role: 'caption', bounds: { x: 5, y: 5, w: 6, h: 1 } },
            ],
          },
        },
        {
          id: 'quote-full',
          name: 'Full Bleed',
          description: 'Large dramatic quote',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 8 },
            regions: [
              { id: 'quote', role: 'body', bounds: { x: 1, y: 1, w: 10, h: 5 } },
              { id: 'attribution', role: 'caption', bounds: { x: 1, y: 7, w: 10, h: 1 } },
            ],
          },
        },
      ];

    case 'media':
      return [
        {
          id: 'media-full',
          name: 'Full Bleed',
          description: 'Media fills the slide',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 0 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'media', role: 'media', bounds: { x: 0, y: 1, w: 12, h: 7 } },
            ],
          },
        },
        {
          id: 'media-captioned',
          name: 'With Caption',
          description: 'Media with description below',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'media', role: 'media', bounds: { x: 1, y: 1, w: 10, h: 5 } },
              { id: 'caption', role: 'caption', bounds: { x: 1, y: 6, w: 10, h: 2 } },
            ],
          },
        },
        {
          id: 'media-side-text',
          name: 'Side by Side',
          description: 'Media left, text right',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 20 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 0, y: 0, w: 12, h: 1 } },
              { id: 'media', role: 'media', bounds: { x: 0, y: 1, w: 6, h: 6 } },
              { id: 'content', role: 'body', bounds: { x: 7, y: 2, w: 5, h: 5 } },
            ],
          },
        },
        {
          id: 'media-gallery',
          name: 'Gallery',
          description: 'Multiple images grid',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 8 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 0, y: 0, w: 12, h: 1 } },
              { id: 'img1', role: 'media', bounds: { x: 0, y: 1, w: 6, h: 3 } },
              { id: 'img2', role: 'media', bounds: { x: 6, y: 1, w: 6, h: 3 } },
              { id: 'img3', role: 'media', bounds: { x: 0, y: 4, w: 4, h: 4 } },
              { id: 'img4', role: 'media', bounds: { x: 4, y: 4, w: 8, h: 4 } },
            ],
          },
        },
      ];

    case 'agenda':
      return [
        {
          id: 'agenda-list',
          name: 'Numbered List',
          description: 'Simple numbered items',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'items', role: 'body', bounds: { x: 1, y: 2, w: 10, h: 5 } },
            ],
          },
        },
        {
          id: 'agenda-two-col',
          name: 'Two Columns',
          description: 'Items split into columns',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 20 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'left', role: 'body', bounds: { x: 1, y: 2, w: 5, h: 5 } },
              { id: 'right', role: 'body', bounds: { x: 6, y: 2, w: 5, h: 5 } },
            ],
          },
        },
        {
          id: 'agenda-cards',
          name: 'Card Grid',
          description: 'Each topic as a card',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 12 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 0, y: 0, w: 12, h: 1 } },
              { id: 'card1', role: 'body', bounds: { x: 0, y: 2, w: 4, h: 3 } },
              { id: 'card2', role: 'body', bounds: { x: 4, y: 2, w: 4, h: 3 } },
              { id: 'card3', role: 'body', bounds: { x: 8, y: 2, w: 4, h: 3 } },
              { id: 'card4', role: 'body', bounds: { x: 2, y: 5, w: 4, h: 3 } },
              { id: 'card5', role: 'body', bounds: { x: 6, y: 5, w: 4, h: 3 } },
            ],
          },
        },
        {
          id: 'agenda-timeline',
          name: 'Timeline Style',
          description: 'Agenda as time blocks',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'times', role: 'caption', bounds: { x: 0, y: 2, w: 2, h: 5 } },
              { id: 'items', role: 'body', bounds: { x: 2, y: 2, w: 9, h: 5 } },
            ],
          },
        },
      ];

    case 'section':
      return [
        {
          id: 'section-centered',
          name: 'Centered',
          description: 'Section title centered',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 6, gutter: 16 },
            regions: [
              { id: 'section-title', role: 'header', bounds: { x: 2, y: 2, w: 8, h: 2 } },
            ],
          },
        },
        {
          id: 'section-left',
          name: 'Left Aligned',
          description: 'Section title left with accent',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 6, gutter: 16 },
            regions: [
              { id: 'section-title', role: 'header', bounds: { x: 1, y: 2, w: 6, h: 2 } },
            ],
          },
        },
        {
          id: 'section-numbered',
          name: 'With Number',
          description: 'Large section number',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 6, gutter: 16 },
            regions: [
              { id: 'number', role: 'caption', bounds: { x: 1, y: 1, w: 2, h: 3 } },
              { id: 'section-title', role: 'header', bounds: { x: 3, y: 2, w: 8, h: 2 } },
            ],
          },
        },
        {
          id: 'section-bottom',
          name: 'Bottom Third',
          description: 'Title in lower portion',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 6, gutter: 16 },
            regions: [
              { id: 'section-title', role: 'header', bounds: { x: 1, y: 4, w: 10, h: 2 } },
            ],
          },
        },
      ];

    case 'iconography':
      return [
        {
          id: 'iconography-trio',
          name: 'Three Icons',
          description: 'Three icons in a row with labels',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'icon-1', role: 'media', bounds: { x: 1, y: 2, w: 3, h: 3 } },
              { id: 'icon-2', role: 'media', bounds: { x: 4.5, y: 2, w: 3, h: 3 } },
              { id: 'icon-3', role: 'media', bounds: { x: 8, y: 2, w: 3, h: 3 } },
              { id: 'labels', role: 'caption', bounds: { x: 1, y: 6, w: 10, h: 1 } },
            ],
          },
        },
        {
          id: 'iconography-quad',
          name: 'Four Icons',
          description: 'Four icons in a 2x2 grid',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'icon-1', role: 'media', bounds: { x: 2, y: 2, w: 3, h: 2 } },
              { id: 'icon-2', role: 'media', bounds: { x: 7, y: 2, w: 3, h: 2 } },
              { id: 'icon-3', role: 'media', bounds: { x: 2, y: 5, w: 3, h: 2 } },
              { id: 'icon-4', role: 'media', bounds: { x: 7, y: 5, w: 3, h: 2 } },
            ],
          },
        },
        {
          id: 'iconography-featured',
          name: 'Featured Icon',
          description: 'One large icon with supporting icons',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'main-icon', role: 'media', bounds: { x: 1, y: 2, w: 5, h: 5 } },
              { id: 'icon-1', role: 'media', bounds: { x: 7, y: 2, w: 2, h: 2 } },
              { id: 'icon-2', role: 'media', bounds: { x: 9.5, y: 2, w: 2, h: 2 } },
              { id: 'icon-3', role: 'media', bounds: { x: 7, y: 5, w: 2, h: 2 } },
              { id: 'icon-4', role: 'media', bounds: { x: 9.5, y: 5, w: 2, h: 2 } },
            ],
          },
        },
        {
          id: 'iconography-strip',
          name: 'Icon Strip',
          description: 'Horizontal row of icons',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 12 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'icon-1', role: 'media', bounds: { x: 1, y: 3, w: 2, h: 2 } },
              { id: 'icon-2', role: 'media', bounds: { x: 3.5, y: 3, w: 2, h: 2 } },
              { id: 'icon-3', role: 'media', bounds: { x: 6, y: 3, w: 2, h: 2 } },
              { id: 'icon-4', role: 'media', bounds: { x: 8.5, y: 3, w: 2, h: 2 } },
              { id: 'description', role: 'body', bounds: { x: 1, y: 6, w: 10, h: 1 } },
            ],
          },
        },
      ];

    case 'appendix':
      return [
        {
          id: 'appendix-standard',
          name: 'Standard',
          description: 'Simple reference layout',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'content', role: 'body', bounds: { x: 1, y: 2, w: 10, h: 6 } },
            ],
          },
        },
        {
          id: 'appendix-dense',
          name: 'Dense',
          description: 'Maximum content area',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 8 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 0, y: 0, w: 12, h: 1 } },
              { id: 'content', role: 'body', bounds: { x: 0, y: 1, w: 12, h: 7 } },
            ],
          },
        },
        {
          id: 'appendix-sources',
          name: 'Sources',
          description: 'Formatted for citations',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 16 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 1, y: 0, w: 10, h: 1 } },
              { id: 'sources', role: 'body', bounds: { x: 1, y: 2, w: 5, h: 5 } },
              { id: 'notes', role: 'body', bounds: { x: 7, y: 2, w: 4, h: 5 } },
            ],
          },
        },
        {
          id: 'appendix-data',
          name: 'Data Table',
          description: 'Optimized for tables',
          layout: {
            ...baseLayout,
            grid: { columns: 12, rows: 8, gutter: 12 },
            regions: [
              { id: 'title', role: 'header', bounds: { x: 0, y: 0, w: 12, h: 1 } },
              { id: 'table', role: 'media', bounds: { x: 0, y: 1, w: 12, h: 7 } },
            ],
          },
        },
      ];

    default:
      return [
        {
          id: 'default-1',
          name: 'Default',
          description: 'Standard layout',
          layout: baseLayout,
        },
      ];
  }
}

export function LayoutSelectionPage() {
  const { template, toggleLayout, updateLayout } = useTemplateStore();
  const [selectedLayoutType, setSelectedLayoutType] = useState<LayoutType | null>(null);
  const [variants, setVariants] = useState<LayoutVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const enabledCount = template.layouts.filter((l) => l.enabled).length;

  const showVariants = async (layoutType: LayoutType) => {
    setIsGenerating(true);
    setSelectedLayoutType(layoutType);

    // Brief delay for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 200));

    const baseLayout = template.layouts.find((l) => l.type === layoutType)!;
    const generatedVariants = generateLayoutVariants(baseLayout);

    // Find if current layout matches any variant
    const currentVariant = generatedVariants.find(v =>
      JSON.stringify(v.layout.regions) === JSON.stringify(baseLayout.regions) &&
      JSON.stringify(v.layout.grid) === JSON.stringify(baseLayout.grid)
    );

    setVariants(generatedVariants);
    setSelectedVariantId(currentVariant?.id || null);
    setIsGenerating(false);
  };

  const closeVariants = () => {
    setSelectedLayoutType(null);
    setVariants([]);
    setSelectedVariantId(null);
  };

  const selectVariant = (variant: LayoutVariant) => {
    if (!selectedLayoutType) return;

    setSelectedVariantId(variant.id);
    // Apply the variant to the template
    updateLayout(selectedLayoutType, variant.layout);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Layout Selection</h2>
          <p className="text-slate-500 mt-1">
            Choose which slide types to include ({enabledCount} of {template.layouts.length} enabled)
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Layout Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 order-2 lg:order-1">
          {template.layouts.map((layout) => (
            <div
              key={layout.type}
              className={`bg-white rounded-lg border p-4 ${
                layout.enabled ? 'border-primary' : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-700">{layout.name}</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layout.enabled ?? true}
                    onChange={(e) => toggleLayout(layout.type, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Preview */}
              <div
                className="cursor-pointer"
                onClick={() => layout.enabled && showVariants(layout.type)}
              >
                <SlidePreview
                  template={template}
                  layout={layout}
                  size="small"
                  showLabel={false}
                />
              </div>

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400 capitalize">{layout.type}</span>
                {layout.enabled && (
                  <button
                    onClick={() => showVariants(layout.type)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    Variants
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Variant Panel */}
        {selectedLayoutType && (
          <div className="w-full lg:w-96 bg-white rounded-lg border border-slate-200 p-4 lg:p-5 max-h-[50vh] lg:max-h-[calc(100vh-8rem)] flex flex-col order-1 lg:order-2">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h3 className="text-lg font-medium text-slate-800">
                  {template.layouts.find((l) => l.type === selectedLayoutType)?.name}
                </h3>
                <p className="text-xs text-slate-500">{variants.length} layout variants</p>
              </div>
              <button
                onClick={closeVariants}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto flex-1">

            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="animate-spin text-primary" size={24} />
                <span className="ml-2 text-slate-500">Loading variants...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {variants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;

                  return (
                    <div
                      key={variant.id}
                      onClick={() => selectVariant(variant)}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-slate-200 hover:border-primary'
                      }`}
                    >
                      <SlidePreview
                        template={template}
                        layout={variant.layout}
                        size="medium"
                        showLabel={false}
                        showRegions={true}
                      />
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">
                            {variant.name}
                          </span>
                          {isSelected && (
                            <span className="text-xs text-primary flex items-center gap-1">
                              <Check size={12} />
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {variant.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
