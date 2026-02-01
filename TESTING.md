# Testing Regime and Definition of Done

## Definition of done (global)
- Feature meets acceptance criteria.
- No critical or high severity bugs.
- All required tests pass.
- Exported files open correctly in target apps.

## Acceptance criteria table
| Feature | Acceptance criteria | Evidence |
| --- | --- | --- |
| Brand setup | Logos, fonts, and colors upload with validation errors for invalid files | Unit tests + manual upload validation |
| Style controls | Changing style or mood updates all slide previews without overlap | UI tests + visual regression |
| Layout library | 8-12 slide types render with placeholder content and pass layout rules | Snapshot tests + preview checks |
| Preview and variants | Variant generation creates at least 3 distinct outputs per change | UI tests + snapshot diffs |
| Quality checks | Contrast and spacing warnings trigger for invalid values | Unit tests + manual validation |
| Export (PPTX) | Output opens in PowerPoint with editable masters and intact text | Automated export tests + manual smoke |
| Export (Keynote) | Output opens in Keynote without layout shifts | Manual smoke + visual regression |
| Export (Google Slides) | Output imports into Google Slides with correct layout and fonts | Manual smoke + visual regression |
| Performance baseline | Preview under 2 seconds for 12-slide set | Performance tests |
| Accessibility baseline | Contrast >= 4.5:1 and minimum font sizes enforced | Unit tests + lint checks |

## Feature tests

### Brand setup
- Upload logo: accepts png/svg, rejects invalid files.
- Upload font: otf/ttf with validation.
- Color palette editor: allows add/remove, validates hex.
- Safe area rules applied to all layouts.

### Style controls
- Changing style family updates preview for all slide types.
- Mood preset changes typography and spacing consistently.
- Slider controls adjust spacing and type scale without layout overlap.

### Layout library
- Each slide type renders correctly with placeholder content.
- Responsive rules handle long text and wide images.
- All slide types produce valid layouts in preview.

### Preview and variants
- Generate variants creates distinct templates.
- Compare mode shows side-by-side changes.
- Preview updates in under 2 seconds for standard set.

### Quality checks
- Contrast warning triggers for invalid text colors.
- Spacing warning triggers when margins are below minimum.
- Brand compliance warning for missing fonts or colors.

### Export (PPTX)
- Exported file opens in PowerPoint with correct master slides.
- Editable text and shapes remain intact.
- Fonts fall back properly if missing.

### Export (Keynote)
- File opens in Keynote without layout shifts.
- Master slides correctly mapped.

### Export (Google Slides)
- Slides import without layout shifts.
- Google Slides renders correct fonts, with fallbacks.

## Regression tests
- Re-export same template yields consistent output.
- Cross-format export consistency within 5% layout variance.

## Performance tests
- Template generation under 2 seconds for 12-slide set.
- Export under 30 seconds for PPTX.

## Usability tests
- New user can create a template in under 10 minutes.
- Users can export without help after first tutorial.

## Security tests
- Uploaded assets are not accessible without auth.
- Asset deletion removes all user files.
