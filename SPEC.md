# Detailed Specification

## Architecture overview
- Web app with a template engine and export pipeline.
- Template definitions stored as a structured schema (JSON or YAML).
- Export adapters for PPTX, Keynote, and Google Slides.

## Data model
### Template
- id
- name
- description
- tokens
- layouts
- accents
- typography

### Tokens
- colors: primary, secondary, neutral, background, accent
- typography: font family, weights, sizes, line heights
- spacing: base unit, margins, padding
- radius: corner radius tokens

### Layout definition
- name
- regions: header, body, footer
- grid: columns, rows, gutters
- rules: alignment, min/max content sizes, spacing

### Export profile
- format: pptx | keynote | gslides
- font fallbacks
- color mapping
- layout adaptation rules

## Template schema (v1)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/template-v1.json",
  "title": "Template",
  "type": "object",
  "required": ["id", "name", "version", "tokens", "layouts"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "description": { "type": "string" },
    "version": { "type": "string" },
    "tokens": { "$ref": "#/$defs/tokens" },
    "typography": { "$ref": "#/$defs/typography" },
    "accents": { "type": "array", "items": { "$ref": "#/$defs/accent" } },
    "layouts": { "type": "array", "items": { "$ref": "#/$defs/layout" } },
    "exportProfiles": { "type": "array", "items": { "$ref": "#/$defs/exportProfile" } }
  },
  "$defs": {
    "tokens": {
      "type": "object",
      "required": ["colors", "spacing", "radius"],
      "properties": {
        "colors": {
          "type": "object",
          "required": ["primary", "secondary", "neutral", "background", "accent"],
          "properties": {
            "primary": { "type": "string", "pattern": "^#([0-9a-fA-F]{6})$" },
            "secondary": { "type": "string", "pattern": "^#([0-9a-fA-F]{6})$" },
            "neutral": { "type": "string", "pattern": "^#([0-9a-fA-F]{6})$" },
            "background": { "type": "string", "pattern": "^#([0-9a-fA-F]{6})$" },
            "accent": { "type": "string", "pattern": "^#([0-9a-fA-F]{6})$" }
          }
        },
        "spacing": {
          "type": "object",
          "required": ["base", "m", "l"],
          "properties": {
            "base": { "type": "number", "minimum": 2 },
            "m": { "type": "number", "minimum": 8 },
            "l": { "type": "number", "minimum": 16 }
          }
        },
        "radius": {
          "type": "object",
          "required": ["sm", "md", "lg"],
          "properties": {
            "sm": { "type": "number", "minimum": 0 },
            "md": { "type": "number", "minimum": 0 },
            "lg": { "type": "number", "minimum": 0 }
          }
        }
      }
    },
    "typography": {
      "type": "object",
      "required": ["title", "body"],
      "properties": {
        "title": {
          "type": "object",
          "required": ["fontFamily", "fontSize", "lineHeight", "weight"],
          "properties": {
            "fontFamily": { "type": "string" },
            "fontSize": { "type": "number", "minimum": 18 },
            "lineHeight": { "type": "number", "minimum": 1 },
            "weight": { "type": "number", "minimum": 100, "maximum": 900 }
          }
        },
        "body": {
          "type": "object",
          "required": ["fontFamily", "fontSize", "lineHeight", "weight"],
          "properties": {
            "fontFamily": { "type": "string" },
            "fontSize": { "type": "number", "minimum": 12 },
            "lineHeight": { "type": "number", "minimum": 1 },
            "weight": { "type": "number", "minimum": 100, "maximum": 900 }
          }
        }
      }
    },
    "layout": {
      "type": "object",
      "required": ["name", "type", "grid", "regions"],
      "properties": {
        "name": { "type": "string" },
        "type": {
          "type": "string",
          "enum": ["title", "section", "agenda", "content", "media", "comparison", "timeline", "quote", "data", "appendix"]
        },
        "grid": {
          "type": "object",
          "required": ["columns", "rows", "gutter"],
          "properties": {
            "columns": { "type": "number", "minimum": 1 },
            "rows": { "type": "number", "minimum": 1 },
            "gutter": { "type": "number", "minimum": 0 }
          }
        },
        "regions": {
          "type": "array",
          "items": { "$ref": "#/$defs/region" },
          "minItems": 1
        },
        "rules": { "$ref": "#/$defs/layoutRules" }
      }
    },
    "region": {
      "type": "object",
      "required": ["id", "role", "bounds"],
      "properties": {
        "id": { "type": "string" },
        "role": { "type": "string", "enum": ["header", "body", "footer", "media", "caption"] },
        "bounds": {
          "type": "object",
          "required": ["x", "y", "w", "h"],
          "properties": {
            "x": { "type": "number", "minimum": 0 },
            "y": { "type": "number", "minimum": 0 },
            "w": { "type": "number", "minimum": 0 },
            "h": { "type": "number", "minimum": 0 }
          }
        }
      }
    },
    "layoutRules": {
      "type": "object",
      "properties": {
        "minFontSize": { "type": "number", "minimum": 10 },
        "maxLineCount": { "type": "number", "minimum": 1 },
        "contentTypes": {
          "type": "array",
          "items": { "type": "string", "enum": ["text", "image", "chart", "table"] }
        }
      }
    },
    "accent": {
      "type": "object",
      "required": ["id", "type"],
      "properties": {
        "id": { "type": "string" },
        "type": { "type": "string", "enum": ["shape", "line", "pattern", "gradient", "iconSet"] },
        "props": { "type": "object" }
      }
    },
    "exportProfile": {
      "type": "object",
      "required": ["format", "fontFallbacks"],
      "properties": {
        "format": { "type": "string", "enum": ["pptx", "keynote", "gslides"] },
        "fontFallbacks": { "type": "object" },
        "colorMapping": { "type": "object" },
        "layoutAdaptation": { "type": "object" }
      }
    }
  }
}
```

## Example template (v1)
```json
{
  "id": "tmpl-clean-001",
  "name": "Clean Professional",
  "description": "A neutral, high-contrast business theme.",
  "version": "1.0.0",
  "tokens": {
    "colors": {
      "primary": "#0A2A43",
      "secondary": "#3D6B82",
      "neutral": "#2B2B2B",
      "background": "#FFFFFF",
      "accent": "#E1A73B"
    },
    "spacing": { "base": 4, "m": 12, "l": 24 },
    "radius": { "sm": 2, "md": 6, "lg": 12 }
  },
  "typography": {
    "title": { "fontFamily": "Avenir Next", "fontSize": 34, "lineHeight": 1.1, "weight": 600 },
    "body": { "fontFamily": "Avenir Next", "fontSize": 14, "lineHeight": 1.4, "weight": 400 }
  },
  "accents": [
    { "id": "accent-line-1", "type": "line", "props": { "stroke": "accent", "weight": 2 } }
  ],
  "layouts": [
    {
      "name": "Title Slide",
      "type": "title",
      "grid": { "columns": 12, "rows": 6, "gutter": 16 },
      "regions": [
        { "id": "title", "role": "header", "bounds": { "x": 1, "y": 1, "w": 10, "h": 2 } },
        { "id": "subtitle", "role": "body", "bounds": { "x": 1, "y": 3, "w": 10, "h": 1 } }
      ],
      "rules": { "minFontSize": 18, "maxLineCount": 3, "contentTypes": ["text"] }
    }
  ],
  "exportProfiles": [
    {
      "format": "pptx",
      "fontFallbacks": { "Avenir Next": "Calibri" },
      "colorMapping": { "accent": "accent" },
      "layoutAdaptation": { "scale": 1.0 }
    }
  ]
}
```

## UI requirements
### Brand setup
- Upload fonts (otf/ttf) and logos (svg/png).
- Color palette editor with contrast check.

### Style controls
- Dropdowns for style family and mood.
- Sliders for spacing density, type scale, and contrast.

### Layout selection
- Slide type list with toggles and preview thumbnails.
- Generate variant button with 3-6 options.

### Preview
- Full slide gallery with zoom and compare mode.
- Shows how each slide type renders.

### Export
- Format selector (pptx/keynote/gslides).
- Export summary with warnings.

## Export details
### PPTX
- Generate master slides and layouts.
- Ensure text and shapes are editable.

### Keynote
- Convert layouts to keynote format with theme and master slides.

### Google Slides
- Export using Slides API compatible structures.

## Extensibility
- Template packs stored as versioned schema files.
- Plugin system for new layouts and accent modules.

## Accessibility
- Minimum contrast ratio of 4.5:1 for body text.
- Font sizes above 18pt for titles, 12pt for body.

## Security
- Private storage for assets.
- Option to delete all uploaded assets.

## API endpoints (suggested)
- POST /templates/create
- GET /templates/{id}
- POST /templates/{id}/export
- POST /assets/upload
- GET /assets/{id}
