# Implementation Plan: Dynamic Template Studio

This document outlines the complete implementation plan for building Dynamic Template Studio from specification to working application.

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Frontend** | React + Vite | 18.x / 5.x |
| **State (UI)** | Zustand | 5.x |
| **State (Server)** | TanStack Query | 5.x |
| **Canvas Rendering** | React-Konva | 18.x |
| **Backend** | Node.js + Express | 22.x / 4.x |
| **Validation** | Zod | 3.x |
| **Database** | PostgreSQL + Drizzle | 16.x / 0.30.x |
| **File Storage** | Cloudflare R2 | - |
| **PPTX Export** | PptxGenJS | 3.x |
| **Keynote Export** | PPTX with Keynote optimization | - |
| **Google Slides** | Google Slides API | v1 |
| **Job Queue** | BullMQ + Redis | 5.x / 7.x |
| **Monorepo** | Turborepo + pnpm | 2.x / 9.x |
| **Unit Testing** | Vitest | 2.x |
| **E2E Testing** | Playwright | 1.x |

---

## Project Structure

```
/kova
├── packages/
│   ├── shared/              # Template schema types, Zod validation
│   └── ui/                  # React component library
├── apps/
│   ├── web/                 # Vite React app (frontend)
│   ├── api/                 # Express API (backend)
│   └── export-worker/       # Background export jobs (BullMQ)
├── PLAN.md
├── PRD.md
├── SPEC.md
├── TESTING.md
└── MVP_FEATURE_LIST.md
```

---

## Implementation Phases

### Phase 1: Foundation (Tasks 1-8)

**Goal:** Set up monorepo, define types, create database schema, scaffold API.

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 1 | Initialize monorepo | Set up Turborepo with pnpm, configure workspaces for packages/ and apps/ | None |
| 2 | Create shared package | TypeScript package with template schema types matching SPEC.md JSON schema | Task 1 |
| 3 | Implement Zod validation | Runtime validation schemas for Template, Tokens, Typography, Layout, Accent, ExportProfile | Task 2 |
| 4 | Set up PostgreSQL + Drizzle | Database schema: users, templates (JSONB), assets, exports tables | Task 1 |
| 5 | Scaffold Express API | Basic Express app with TypeScript, routes for /templates and /assets | Tasks 1, 4 |
| 6 | Configure Cloudflare R2 | S3-compatible storage setup for assets and exports | Task 1 |
| 7 | Set up Vite React app | Frontend scaffold with React 18, Zustand, TanStack Query | Task 1 |
| 8 | Configure CI/CD | GitHub Actions for linting, type-checking, testing | Tasks 1-7 |

**Deliverables:**
- Working monorepo with hot reload
- Template types that match SPEC.md schema exactly
- Database migrations ready to run
- API endpoints returning mock data
- Empty React app with routing

---

### Phase 2: Export Pipeline Core (Tasks 9-18)

**Goal:** Build the export adapter framework and PPTX export. This is prioritized before UI per CLAUDE.md guidance.

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 9 | Define export adapter interface | IExportAdapter interface with export(), validate(), generatePreview() methods | Task 2 |
| 10 | Create internal render model | NormalizedBounds (EMUs), InternalSlide, InternalElement types | Task 9 |
| 11 | Implement template converter | Convert Template JSON to internal model with grid-to-EMU calculations | Task 10 |
| 12 | Build font fallback resolver | Platform font lists, fallback chains, metrics adjustment calculation | Task 9 |
| 13 | Implement PPTX adapter | PptxGenJS integration with master slide generation | Tasks 9-12 |
| 14 | Build master slide generator | Create slide masters for each layout type with placeholders | Task 13 |
| 15 | Add PPTX export tests | Unit tests for validation, integration tests for file structure | Task 13 |
| 16 | Set up BullMQ worker | Background job processing for exports with retry logic | Tasks 5, 13 |
| 17 | Implement export API endpoints | POST /templates/:id/export with job queuing and status polling | Tasks 5, 16 |
| 18 | Add export performance tests | Verify <30 second export time for standard templates | Task 15 |

**Deliverables:**
- Working PPTX export that creates editable master slides
- Font fallback system with platform-specific mappings
- Background export jobs with progress tracking
- Performance baseline meeting 30-second target

---

### Phase 3: Preview System (Tasks 19-28)

**Goal:** Build real-time preview rendering meeting <2 second target.

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 19 | Create preview renderer | Canvas-based slide renderer using React-Konva | Task 7 |
| 20 | Implement render scheduler | Priority queue for visible slides first, requestIdleCallback for background | Task 19 |
| 21 | Build render cache | LRU cache keyed by template hash + slide type | Task 19 |
| 22 | Add Web Worker support | Offload layout computation to worker thread | Task 20 |
| 23 | Implement token resolution | Resolve design tokens to concrete values for rendering | Tasks 3, 19 |
| 24 | Build placeholder content | Generate sample content for each slide type | Task 19 |
| 25 | Create preview components | SlidePreview, PreviewGallery, ZoomControls React components | Tasks 19-24 |
| 26 | Implement variant generation | Algorithm to produce 3-6 distinct variants per slide type | Tasks 19, 23 |
| 27 | Add compare mode | Side-by-side, overlay, and swipe comparison views | Tasks 25, 26 |
| 28 | Add preview performance tests | Verify <2 second generation for 12-slide set | Task 25 |

**Deliverables:**
- Real-time preview updates on template changes
- Variant generation producing distinct outputs
- Compare mode for variant selection
- Performance meeting <2 second target

---

### Phase 4: Brand Setup UI (Tasks 29-38)

**Goal:** Build logo, font, and color upload/management UI.

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 29 | Create FileDropZone component | Drag-drop, click-to-browse, paste support | Task 7 |
| 30 | Implement file validation | MIME type, extension, size checks client-side | Task 29 |
| 31 | Build font parser | Extract metadata using opentype.js (family, weights, styles) | Task 30 |
| 32 | Build logo parser | Extract dimensions, format, dominant colors | Task 30 |
| 33 | Create upload manager | Chunked upload with progress, retry logic | Tasks 29-32, 6 |
| 34 | Build font upload UI | UploadedFontsList, FontPreviewCard, FontRoleSelector | Tasks 31, 33 |
| 35 | Build logo upload UI | LogoUploadZone, LogoThumbnail, setPrimaryAction | Tasks 32, 33 |
| 36 | Create color palette editor | ColorSlot, ColorPickerPopover, HexInput with validation | Task 7 |
| 37 | Implement contrast checker | Real-time WCAG AA contrast ratio calculation | Task 36 |
| 38 | Add "Extract from logo" feature | Suggest palette colors from uploaded logo | Tasks 32, 36 |

**Deliverables:**
- Complete brand setup page
- Font upload with metadata extraction and role assignment
- Logo upload with color extraction
- Color palette editor with contrast warnings

---

### Phase 5: Style Controls UI (Tasks 39-46)

**Goal:** Build style family, mood, and fine-tuning controls.

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 39 | Create StyleFamilySelector | Visual dropdown with thumbnails for clean/editorial/bold/minimal | Task 7 |
| 40 | Create MoodSelector | Visual dropdown for calm/energetic/premium/technical | Task 7 |
| 41 | Build LabeledSlider component | Slider with markers, numeric input, warning indicator | Task 7 |
| 42 | Implement spacing density control | Slider affecting tokens.spacing values | Tasks 41, 3 |
| 43 | Implement type scale control | Slider affecting typography scale | Tasks 41, 3 |
| 44 | Implement contrast control | Slider with accessibility warning integration | Tasks 41, 37 |
| 45 | Build accent style selector | Toggle between shape/line/pattern/gradient with preview | Task 7 |
| 46 | Create live preview integration | Debounced preview updates on control changes | Tasks 39-45, 25 |

**Deliverables:**
- Complete style controls page
- Real-time preview updates on style changes
- Accessibility warnings for invalid contrast

---

### Phase 6: Layout Selection UI (Tasks 47-53)

**Goal:** Build layout library browser and variant management.

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 47 | Create SlideTypeCard component | Preview thumbnail, enable toggle, variant count | Task 25 |
| 48 | Build layout library grid | 10 slide types (title, section, agenda, content, media, comparison, timeline, quote, data, appendix) | Task 47 |
| 49 | Implement variant panel | Expandable panel showing generated variants | Tasks 26, 47 |
| 50 | Add variant selection | Select variant as default for slide type | Task 49 |
| 51 | Build variant comparison | Side-by-side comparison of variants | Tasks 27, 49 |
| 52 | Create layout detail view | Full-size preview with region visualization | Task 47 |
| 53 | Implement batch variant generation | Generate variants for all enabled slide types | Tasks 26, 48 |

**Deliverables:**
- Complete layout selection page
- Variant generation and comparison
- Layout enable/disable toggles

---

### Phase 7: Quality Checks (Tasks 54-60)

**Goal:** Implement validation engine and inline warnings.

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 54 | Create validation engine | Run validators on template state changes (debounced) | Task 3 |
| 55 | Implement contrast validator | WCAG AA (4.5:1) checking for text/background combinations | Task 54 |
| 56 | Implement spacing validator | Minimum margin checks per layout | Task 54 |
| 57 | Implement typography validator | Minimum font size enforcement (18pt title, 12pt body) | Task 54 |
| 58 | Create InlineWarning component | Warning indicator next to controls with auto-fix button | Task 54 |
| 59 | Build WarningsBar | Persistent footer showing all warnings with navigation | Tasks 54-57 |
| 60 | Add validation to export flow | Block export on errors, show warnings in summary | Tasks 54-57, 17 |

**Deliverables:**
- Automatic validation on template changes
- Inline warnings next to relevant controls
- Export blocked for critical issues

---

### Phase 8: Export UI & Additional Formats (Tasks 61-70)

**Goal:** Complete export page and add Keynote/Google Slides support.

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 61 | Create export page | Format selector, options panel, summary panel | Task 7 |
| 62 | Build format cards | PPTX, Keynote, Google Slides with compatibility info | Task 61 |
| 63 | Create font fallback UI | Show original font → fallback mapping for selected format | Tasks 12, 61 |
| 64 | Build export summary | Slide count, estimated size, quality checklist | Tasks 60, 61 |
| 65 | Add export progress UI | Progress bar with cancel button | Tasks 16, 61 |
| 66 | Implement Keynote adapter | Optimized PPTX output with Keynote-friendly settings | Task 13 |
| 67 | Implement Google Slides adapter | Slides API integration with OAuth | Task 9 |
| 68 | Add Google OAuth flow | Authorization URL, token handling, refresh | Task 67 |
| 69 | Add cross-format tests | Verify <5% layout variance across formats | Tasks 66, 67 |
| 70 | Add visual regression tests | Playwright screenshot comparison for exports | Task 69 |

**Deliverables:**
- Complete export page with format selection
- Keynote export via optimized PPTX
- Google Slides export via API
- Cross-format consistency tests

---

### Phase 9: Navigation & Polish (Tasks 71-78)

**Goal:** Complete navigation flow, undo/redo, auto-save.

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 71 | Build app shell | Header, NavigationSidebar, ContentArea layout | Task 7 |
| 72 | Create step navigator | 5-step navigation with completion indicators | Task 71 |
| 73 | Implement undo/redo | History middleware with JSON patch storage | Task 7 |
| 74 | Add auto-save | Debounced local storage persistence | Task 73 |
| 75 | Create project management | Save/load templates, naming, delete | Tasks 4, 5 |
| 76 | Build mini preview panel | Collapsible sidebar showing current template | Task 25 |
| 77 | Add keyboard shortcuts | Undo (Cmd+Z), Redo (Cmd+Shift+Z), Save (Cmd+S) | Task 73 |
| 78 | Implement error boundaries | Graceful error handling with recovery options | Task 71 |

**Deliverables:**
- Complete navigation between all 5 steps
- Undo/redo with keyboard shortcuts
- Auto-save preventing data loss
- Project save/load functionality

---

### Phase 10: Testing & Launch Prep (Tasks 79-85)

**Goal:** Comprehensive testing, performance validation, documentation.

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 79 | Write E2E test suite | Full user flows from brand setup to export | All UI tasks |
| 80 | Conduct performance audit | Verify all performance targets met | Tasks 18, 28 |
| 81 | Accessibility audit | WCAG AA compliance for UI, not just templates | All UI tasks |
| 82 | Cross-browser testing | Chrome, Firefox, Safari, Edge | Task 79 |
| 83 | Create user documentation | Getting started guide, feature documentation | All tasks |
| 84 | Set up error monitoring | Sentry or similar for production error tracking | Task 78 |
| 85 | Production deployment | Vercel/Cloudflare for frontend, Railway/Render for API | All tasks |

**Deliverables:**
- Passing E2E test suite
- Performance targets verified
- Production deployment ready

---

## Critical Files to Create

| File | Purpose |
|------|---------|
| `packages/shared/src/types/template.ts` | TypeScript interfaces matching SPEC.md JSON schema |
| `packages/shared/src/validation/schema.ts` | Zod schemas for runtime validation |
| `apps/api/src/db/schema.ts` | Drizzle database schema |
| `apps/api/src/export/adapters/pptx-adapter.ts` | PPTX export with PptxGenJS |
| `apps/api/src/export/fonts/fallback-resolver.ts` | Font fallback logic |
| `apps/web/src/store/templateStore.ts` | Zustand state with undo/redo |
| `apps/web/src/components/preview/PreviewRenderer.tsx` | Canvas rendering |
| `apps/web/src/lib/validators/index.ts` | Contrast, spacing, typography validators |

---

## Performance Targets (from TESTING.md)

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| Preview generation | <2 seconds for 12 slides | Automated performance test |
| Export generation | <30 seconds for PPTX | Automated performance test |
| Export success rate | 99% | Error monitoring |
| Cross-format variance | <5% | Visual regression tests |

---

## Acceptance Criteria Summary (from TESTING.md)

- [ ] Brand setup: Logos/fonts/colors upload with validation errors for invalid files
- [ ] Style controls: Changing style/mood updates all previews without overlap
- [ ] Layout library: 8-12 slide types render with placeholder content
- [ ] Preview: Variant generation creates 3+ distinct outputs
- [ ] Quality checks: Contrast/spacing warnings trigger for invalid values
- [ ] Export (PPTX): Opens in PowerPoint with editable masters
- [ ] Export (Keynote): Opens without layout shifts
- [ ] Export (Google Slides): Imports with correct layout and fonts
- [ ] Accessibility: Contrast ≥4.5:1, font sizes enforced

---

## Verification

To verify the implementation is complete:

1. **Unit Tests**: `pnpm test` - all tests pass
2. **E2E Tests**: `pnpm test:e2e` - full user flows work
3. **Performance Tests**: `pnpm test:perf` - targets met
4. **Manual Smoke Test**:
   - Create template with custom brand (logo, fonts, colors)
   - Adjust style family and mood
   - Enable 8+ slide types
   - Generate variants
   - Verify no contrast warnings (or fix them)
   - Export to PPTX, open in PowerPoint
   - Export to Google Slides, verify import
5. **Export Verification**:
   - PPTX master slides are editable
   - Text and shapes are not locked
   - Fonts fall back correctly on systems without custom fonts
