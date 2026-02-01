# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**Implemented** - The MVP is built with all core features functional.

## Project Overview

**Dynamic Template Studio** - A web application for business users to generate professional presentation templates with brand, style, and layout controls. Exports to PowerPoint (PPTX), Keynote, and Google Slides with editable master slides.

**Phase 1 scope:** Template creation with brand system, layout library, and export. No AI content generation. No deck upload/re-theming (planned for Phase 2).

## Development Commands

```bash
# Install dependencies
npm install

# Run development servers
npm run dev:web     # Frontend at http://localhost:3000
npm run dev:api     # API at http://localhost:3001

# Run tests
npm run test:shared # Template validation tests (21 tests)
npm run test:api    # Export and API tests (18 tests)

# Type checking
cd apps/web && npx tsc --noEmit
cd apps/api && npx tsc --noEmit

# Build shared package
cd packages/shared && npm run build
```

## Project Structure

```
kova/
├── packages/
│   └── shared/                 # Template types, Zod validation, contrast utilities
│       └── src/
│           ├── types/template.ts      # TypeScript interfaces
│           ├── validation/schema.ts   # Zod schemas
│           └── validation/contrast.ts # WCAG AA contrast checking
├── apps/
│   ├── web/                    # React + Vite frontend
│   │   └── src/
│   │       ├── store/templateStore.ts # Zustand state with undo/redo
│   │       ├── pages/                 # Brand, Style, Layouts, Preview, Export
│   │       ├── components/            # UI components
│   │       └── lib/validators/        # Real-time validation engine
│   └── api/                    # Express API
│       └── src/
│           ├── routes/               # templates, assets, export endpoints
│           └── export/               # PPTX adapter with PptxGenJS
├── PRD.md                      # Product requirements
├── SPEC.md                     # Technical specification with JSON schema
├── TESTING.md                  # Acceptance criteria
├── MVP_FEATURE_LIST.md         # Feature prioritization
└── PLAN.md                     # Implementation plan
```

## Key Documentation

- `PRD.md` - Product requirements, user stories, success metrics
- `SPEC.md` - Technical specification with complete JSON schema for templates
- `TESTING.md` - Acceptance criteria and test strategy per feature
- `MVP_FEATURE_LIST.md` - Feature prioritization (must-have, should-have, nice-to-have)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Zustand with persistence |
| Server State | TanStack Query |
| Backend | Express + TypeScript |
| Validation | Zod schemas |
| PPTX Export | PptxGenJS |
| Testing | Vitest |

## Architecture

### Template Schema
Templates are JSON documents following SPEC.md schema. Core entities:
- **Tokens** - Colors (hex), spacing (px), radius
- **Typography** - Title (min 18pt) and body (min 12pt) styles
- **Layouts** - 10 slide types with grid-based regions
- **Accents** - Visual elements (shapes, lines, patterns, gradients)
- **Export Profiles** - Per-format font fallbacks

### Export Pipeline
- `apps/api/src/export/adapter.ts` - Abstract interface
- `apps/api/src/export/pptx-adapter.ts` - PptxGenJS implementation
- Font fallback resolver with platform-specific mappings
- Async job processing with progress tracking

### Validation Engine
- `packages/shared/src/validation/schema.ts` - Zod runtime validation
- `packages/shared/src/validation/contrast.ts` - WCAG AA contrast (4.5:1)
- `apps/web/src/lib/validators/` - Real-time UI validation

## Critical Constraints

### Performance
- Preview generation: **<2 seconds** for 12-slide set
- Export generation: **<30 seconds** for PPTX (verified in tests)
- Export success rate: **99%**

### Accessibility
- Minimum contrast ratio: **4.5:1** for body text (enforced)
- Minimum font sizes: **18pt titles, 12pt body** (enforced)
- Automated contrast checking in UI

### Validation Rules
All validation is enforced via Zod schemas:
- Hex colors must match `/^#[0-9a-fA-F]{6}$/`
- Base spacing minimum: 2px
- Layouts must have at least one region
- Font weights: 100-900
