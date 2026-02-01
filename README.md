# Kova - Dynamic Template Studio

A web application for generating professional presentation templates with brand controls, style system, and PowerPoint export.

## Features

- **Brand Setup** - Color palette presets with WCAG AA contrast validation
- **20 Style Families** - Clean, editorial, bold, minimal, brutalist, bento, swiss, corporate, art deco, retro 70s, Y2K, tech, bauhaus, memphis, scandinavian, futuristic, organic, luxury, handcrafted, industrial
- **19 Layout Types** - Including 8 data visualization chart types
- **Real Editable Charts** - Bar, line, pie, donut, scatter, area, and stacked bar charts that are fully editable in PowerPoint
- **Preview Gallery** - Lightbox view with keyboard navigation
- **PPTX Export** - Professional PowerPoint files with editable master slides
- **Responsive UI** - Mobile-friendly interface
- **Undo/Redo** - Full state management with history

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Zustand with persistence |
| Backend | Express + TypeScript |
| Validation | Zod schemas |
| PPTX Export | PptxGenJS |
| Testing | Vitest |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Run development servers
npm run dev:web     # Frontend at http://localhost:3000
npm run dev:api     # API at http://localhost:3001
```

### Running Tests

```bash
# Run all tests
npm run test:shared  # Template validation tests (144 tests)
npm run test:api     # Export and API tests (88 tests)

# Type checking
cd apps/web && npx tsc --noEmit
cd apps/api && npx tsc --noEmit
```

## Project Structure

```
kova/
├── packages/
│   └── shared/              # Template types, Zod validation, contrast utilities
├── apps/
│   ├── web/                 # React + Vite frontend
│   │   └── src/
│   │       ├── store/       # Zustand state management
│   │       ├── pages/       # Brand, Style, Layouts, Preview, Export
│   │       └── components/  # UI components
│   └── api/                 # Express API
│       └── src/
│           ├── routes/      # API endpoints
│           └── export/      # PPTX adapter with PptxGenJS
├── PRD.md                   # Product requirements
├── SPEC.md                  # Technical specification
└── TESTING.md               # Acceptance criteria
```

## Usage

1. **Brand Setup** - Choose colors from presets or enter custom hex values
2. **Style Controls** - Select a style family that matches your brand aesthetic
3. **Layout Selection** - Enable/disable slide types including chart layouts
4. **Preview** - Review all slides in gallery or carousel view
5. **Export** - Download as PowerPoint file with editable charts and master slides

## License

MIT License - see [LICENSE](LICENSE) for details.
