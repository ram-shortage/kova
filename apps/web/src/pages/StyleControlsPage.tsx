import { useRef } from 'react';
import { useTemplateStore, type StylePreset } from '../store/templateStore';
import { SlidePreview } from '../components/preview/SlidePreview';
import type { StyleFamily, MoodPreset } from '@kova/shared';
import { Download, Upload, Trash2, Save, Check } from 'lucide-react';

interface StyleFamilyOption {
  value: StyleFamily;
  label: string;
  description: string;
  inspiration: string;
}

interface StyleGroup {
  name: string;
  styles: StyleFamilyOption[];
}

const styleGroups: StyleGroup[] = [
  {
    name: 'Modern',
    styles: [
      { value: 'clean', label: 'Clean', description: 'Modern and minimal with clear hierarchy', inspiration: 'Apple' },
      { value: 'minimal', label: 'Minimal', description: 'Sparse elegance with maximum whitespace', inspiration: 'Muji, Aesop' },
      { value: 'bento', label: 'Bento', description: 'Modular compartmentalized layouts', inspiration: 'Apple product' },
      { value: 'tech', label: 'Tech', description: 'Glassmorphism and dark mode aesthetics', inspiration: 'SaaS startups' },
    ],
  },
  {
    name: 'Editorial',
    styles: [
      { value: 'editorial', label: 'Editorial', description: 'Magazine-style with bold typography', inspiration: 'Vogue, GQ' },
      { value: 'luxury', label: 'Luxury', description: 'Sophisticated with metallic accents', inspiration: 'Chanel, Dior' },
      { value: 'scandinavian', label: 'Scandinavian', description: 'Light, airy Nordic minimalism', inspiration: 'IKEA, Muji' },
    ],
  },
  {
    name: 'Bold',
    styles: [
      { value: 'bold', label: 'Bold', description: 'High impact with strong contrasts', inspiration: 'Nike, Spotify' },
      { value: 'brutalist', label: 'Brutalist', description: 'Raw, unpolished with visible structure', inspiration: 'Balenciaga' },
      { value: 'neubrutalist', label: 'Neubrutalist', description: 'Bold shadows and thick borders', inspiration: 'Gumroad, Figma' },
      { value: 'industrial', label: 'Industrial', description: 'Urban grit with exposed elements', inspiration: 'Urban Outfitters' },
    ],
  },
  {
    name: 'Design Classics',
    styles: [
      { value: 'swiss', label: 'Swiss', description: 'Grid-based precision typography', inspiration: 'IBM, SBB' },
      { value: 'bauhaus', label: 'Bauhaus', description: 'Geometric shapes, primary colors', inspiration: 'Bauhaus school' },
      { value: 'artdeco', label: 'Art Deco', description: 'Geometric elegance with gold accents', inspiration: '1920s glamour' },
    ],
  },
  {
    name: 'Retro',
    styles: [
      { value: 'retro70s', label: '70s Retro', description: 'Groovy curves and earthy tones', inspiration: 'Disco era' },
      { value: 'memphis', label: 'Memphis', description: 'Playful 80s patterns and bold colors', inspiration: 'Memphis Group' },
      { value: 'y2k', label: 'Y2K', description: 'Glossy, chrome, holographic vibes', inspiration: 'Early 2000s' },
    ],
  },
  {
    name: 'Expressive',
    styles: [
      { value: 'futuristic', label: 'Futuristic', description: 'Sci-fi neon and holographic effects', inspiration: 'Cyberpunk' },
      { value: 'organic', label: 'Organic', description: 'Natural textures and earth tones', inspiration: 'Wellness brands' },
      { value: 'handcrafted', label: 'Handcrafted', description: 'Artisan feel with imperfect textures', inspiration: 'Indie brands' },
      { value: 'corporate', label: 'Corporate', description: 'Professional polish with structure', inspiration: 'McKinsey' },
    ],
  },
];

const moodPresets: Array<{ value: MoodPreset; label: string; description: string }> = [
  { value: 'calm', label: 'Calm', description: 'Muted colors, warm tones, extra spacing (spa/wellness)' },
  { value: 'energetic', label: 'Energetic', description: 'Vibrant saturated colors, bold elements (Nike/Spotify)' },
  { value: 'premium', label: 'Premium', description: 'Refined gradients, elegant spacing (Cartier/luxury)' },
  { value: 'technical', label: 'Technical', description: 'Cool precision, sharp edges, grid emphasis (Bloomberg)' },
];

export function StyleControlsPage() {
  const {
    template,
    setStyleFamily,
    setMood,
    setSpacingDensity,
    setTypeScale,
    setContrastLevel,
    customStyles,
    excludeAppleFonts,
    setExcludeAppleFonts,
    addCustomStyle,
    removeCustomStyle,
    applyCustomStyle,
    exportStylePreset,
  } = useTemplateStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save current style as a preset
  const handleSaveStyle = () => {
    const name = prompt('Enter a name for this style preset:');
    if (!name) return;

    const preset = exportStylePreset();
    preset.name = name;
    preset.id = `custom-${Date.now()}`;
    preset.createdAt = new Date().toISOString();
    addCustomStyle(preset);
  };

  // Export style to JSON file
  const handleExportStyle = () => {
    const preset = exportStylePreset();
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `style-preset-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import style from JSON file
  const handleImportStyle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const preset = JSON.parse(e.target?.result as string) as StylePreset;
        // Validate required fields
        if (!preset.colors || !preset.typography || !preset.styleFamily) {
          alert('Invalid style preset file');
          return;
        }
        // Generate new ID and timestamp
        preset.id = `imported-${Date.now()}`;
        preset.createdAt = new Date().toISOString();
        preset.name = preset.name || `Imported Style ${Date.now()}`;
        addCustomStyle(preset);
      } catch {
        alert('Failed to parse style preset file');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Controls Panel */}
      <div className="w-full lg:w-80 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Style Controls</h2>
          <p className="text-slate-500 mt-1">Customize the look and feel of your template</p>
        </div>

        {/* Style Family */}
        <section className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Style Family</h3>
          {/* Current font indicator */}
          <div className="mb-3 p-2 bg-slate-50 rounded text-xs">
            <span className="text-slate-500">Font: </span>
            <span className="text-slate-700 font-medium" style={{ fontFamily: template.typography.title.fontFamily }}>
              {template.typography.title.fontFamily.split(',')[0].replace(/['"]/g, '')}
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {styleGroups.map((group) => (
              <div key={group.name}>
                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">{group.name}</h4>
                <div className="space-y-2">
                  {group.styles.map((family) => (
                    <label
                      key={family.value}
                      className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        template.styleFamily === family.value
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="styleFamily"
                        value={family.value}
                        checked={template.styleFamily === family.value}
                        onChange={(e) => setStyleFamily(e.target.value as StyleFamily)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800">{family.label}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded truncate">{family.inspiration}</span>
                        </div>
                        <div className="text-xs text-slate-500 truncate">{family.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mood Preset */}
        <section className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Mood</h3>
          <div className="space-y-2">
            {moodPresets.map((mood) => (
              <label
                key={mood.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  template.mood === mood.value
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="mood"
                  value={mood.value}
                  checked={template.mood === mood.value}
                  onChange={(e) => setMood(e.target.value as MoodPreset)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-800">{mood.label}</span>
                  <div className="text-xs text-slate-500">{mood.description}</div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Fine Tuning */}
        <section className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Fine Tuning</h3>

          <div className="space-y-5">
            {/* Spacing Density */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-600">Spacing Density</label>
                <span className="text-sm text-slate-500">{template.spacingDensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={template.spacingDensity}
                onChange={(e) => setSpacingDensity(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Compact</span>
                <span>Normal</span>
                <span>Spacious</span>
              </div>
            </div>

            {/* Type Scale */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-600">Type Scale</label>
                <span className="text-sm text-slate-500">{template.typeScale.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.1"
                max="1.5"
                step="0.05"
                value={template.typeScale}
                onChange={(e) => setTypeScale(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Subtle</span>
                <span>Standard</span>
                <span>Dramatic</span>
              </div>
            </div>

            {/* Contrast Level */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-600">Contrast Level</label>
                <span className="text-sm text-slate-500">{template.contrastLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={template.contrastLevel}
                onChange={(e) => setContrastLevel(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </section>

        {/* Settings */}
        <section className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Settings</h3>

          {/* Apple Font Exclusion Toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm text-slate-700">Exclude Apple Fonts</span>
              <p className="text-xs text-slate-400">Use cross-platform alternatives</p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={excludeAppleFonts}
                onChange={(e) => setExcludeAppleFonts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
            </div>
          </label>
        </section>

        {/* My Styles */}
        <section className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-700">My Styles</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSaveStyle}
                className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded transition-colors"
                title="Save current style"
              >
                <Save size={16} />
              </button>
              <button
                onClick={handleExportStyle}
                className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded transition-colors"
                title="Export to file"
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded transition-colors"
                title="Import from file"
              >
                <Upload size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportStyle}
                className="hidden"
              />
            </div>
          </div>

          {customStyles.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No saved styles yet. Save your current style or import one.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {customStyles.map((style) => (
                <div
                  key={style.id}
                  className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 hover:border-slate-300 group"
                >
                  {/* Color preview */}
                  <div className="flex gap-0.5">
                    <div
                      className="w-3 h-8 rounded-l"
                      style={{ backgroundColor: style.colors.primary }}
                    />
                    <div
                      className="w-3 h-8"
                      style={{ backgroundColor: style.colors.secondary }}
                    />
                    <div
                      className="w-3 h-8"
                      style={{ backgroundColor: style.colors.accent }}
                    />
                    <div
                      className="w-3 h-8 rounded-r"
                      style={{ backgroundColor: style.colors.background }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{style.name}</p>
                    <p className="text-xs text-slate-400">{style.styleFamily}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => applyCustomStyle(style)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Apply style"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => removeCustomStyle(style.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="Delete style"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Live Preview Panel */}
      <div className="flex-1 min-w-0 bg-white rounded-lg border border-slate-200 p-4 md:p-6">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Live Preview</h3>
        <p className="text-xs text-slate-500 mb-4">These layouts show the most dramatic style differences</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Show layouts that best demonstrate style variations: data, timeline, comparison, quote */}
          {['data', 'timeline', 'comparison', 'quote']
            .map((type) => template.layouts.find((l) => l.type === type))
            .filter((layout): layout is NonNullable<typeof layout> => layout !== undefined)
            .map((layout) => (
              <SlidePreview
                key={layout.type}
                template={template}
                layout={layout}
                size="medium"
              />
            ))}
        </div>
      </div>
    </div>
  );
}
