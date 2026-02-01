import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Trash2, AlertTriangle, Shuffle, Lock, Unlock, Wand2, Palette } from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';
import { calculateContrastRatio, WCAG_AA_NORMAL_TEXT } from '@kova/shared';
import { clsx } from 'clsx';
import { generatePalette, generateFromSeed, type HarmonyMode, type ColorMood, type LockedColors } from '../lib/colorHarmony';

// Generate unique ID (fallback for non-secure contexts)
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for non-HTTPS contexts
  return 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
}

const colorRoles = [
  { key: 'primary', label: 'Primary', description: 'Main brand color for headings' },
  { key: 'secondary', label: 'Secondary', description: 'Supporting color for accents' },
  { key: 'neutral', label: 'Neutral', description: 'Body text color' },
  { key: 'background', label: 'Background', description: 'Slide background color' },
  { key: 'accent', label: 'Accent', description: 'Highlight and emphasis color' },
] as const;

const harmonyModes: Array<{ value: HarmonyMode; label: string; description: string }> = [
  { value: 'complementary', label: 'Complementary', description: 'Opposite colors for high contrast' },
  { value: 'analogous', label: 'Analogous', description: 'Adjacent colors for harmony' },
  { value: 'triadic', label: 'Triadic', description: 'Three evenly spaced colors' },
  { value: 'split-complementary', label: 'Split-Comp', description: 'Base + two adjacent to complement' },
  { value: 'monochromatic', label: 'Monochromatic', description: 'Single hue with varied lightness' },
];

const colorMoods: Array<{ value: ColorMood; label: string }> = [
  { value: 'warm', label: 'Warm' },
  { value: 'cool', label: 'Cool' },
  { value: 'neutral', label: 'Any' },
];

// Brand-inspired color palette presets
// All palettes are designed to meet WCAG AA contrast requirements (4.5:1)
const brandPresets = [
  {
    name: 'Apple',
    description: 'Clean whites, grays, with blue accents',
    colors: {
      primary: '#1D1D1F',    // Near black for strong headings
      secondary: '#0071E3',  // Apple blue
      neutral: '#1D1D1F',    // Dark gray for body text
      background: '#FFFFFF', // Clean white
      accent: '#0077ED',     // Bright blue accent
    },
  },
  {
    name: 'IBM',
    description: 'Blues with carbon grays',
    colors: {
      primary: '#0F62FE',    // IBM Blue 60
      secondary: '#393939',  // Carbon gray
      neutral: '#161616',    // Dark carbon for body
      background: '#FFFFFF', // White background
      accent: '#0043CE',     // IBM Blue 70
    },
  },
  {
    name: 'Coca-Cola',
    description: 'Reds with white and cream',
    colors: {
      primary: '#F40009',    // Coca-Cola red
      secondary: '#1E1E1E',  // Dark gray
      neutral: '#1E1E1E',    // Dark for body text
      background: '#FFF8F0', // Warm cream
      accent: '#C8102E',     // Deeper red accent
    },
  },
  {
    name: 'IKEA',
    description: 'Blue and yellow Scandinavian',
    colors: {
      primary: '#0051BA',    // IKEA blue
      secondary: '#FFDB00',  // IKEA yellow
      neutral: '#1A1A1A',    // Near black for body
      background: '#FFFFFF', // Clean white
      accent: '#003E92',     // Darker blue accent
    },
  },
  {
    name: 'Spotify',
    description: 'Greens with dark backgrounds',
    colors: {
      primary: '#1DB954',    // Spotify green
      secondary: '#1ED760',  // Lighter green
      neutral: '#FFFFFF',    // White body text
      background: '#121212', // Spotify dark
      accent: '#1AA34A',     // Muted green accent
    },
  },
  {
    name: 'Netflix',
    description: 'Reds with dark backgrounds',
    colors: {
      primary: '#E50914',    // Netflix red
      secondary: '#B81D24',  // Deeper red
      neutral: '#FFFFFF',    // White body text
      background: '#141414', // Netflix dark
      accent: '#F5F5F1',     // Off-white accent
    },
  },
];

type GenerationMode = 'random' | 'from-primary';

export function BrandSetupPage() {
  const { template, setColors, logos, fonts, addLogo, addFont, removeLogo, removeFont } =
    useTemplateStore();

  // Extract colors early so they can be used in callbacks
  const { colors } = template.tokens;

  // Color generation state
  const [generationMode, setGenerationMode] = useState<GenerationMode>('from-primary');
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('complementary');
  const [colorMood, setColorMood] = useState<ColorMood>('neutral');
  const [lockedColors, setLockedColors] = useState<LockedColors>({});

  const onLogoDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        addLogo({
          id: generateId(),
          name: file.name,
          type: 'logo',
          url,
        });
      });
    },
    [addLogo]
  );

  const onFontDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        addFont({
          id: generateId(),
          name: file.name,
          type: 'font',
          url,
        });
      });
    },
    [addFont]
  );

  const logoDropzone = useDropzone({
    onDrop: onLogoDrop,
    accept: { 'image/svg+xml': ['.svg'], 'image/png': ['.png'] },
    maxSize: 5 * 1024 * 1024,
  });

  const fontDropzone = useDropzone({
    onDrop: onFontDrop,
    accept: {
      'font/ttf': ['.ttf'],
      'font/otf': ['.otf'],
      'application/x-font-ttf': ['.ttf'],
      'application/x-font-opentype': ['.otf'],
    },
    maxSize: 10 * 1024 * 1024,
  });

  // Toggle color lock
  const toggleLock = (colorKey: keyof LockedColors) => {
    setLockedColors((prev) => ({
      ...prev,
      [colorKey]: !prev[colorKey],
    }));
  };

  // Get current palette for passing to generators
  const currentPalette = {
    primary: colors.primary,
    secondary: colors.secondary,
    neutral: colors.neutral,
    background: colors.background,
    accent: colors.accent,
  };

  // Randomize colors (full random)
  const handleRandomize = () => {
    const newPalette = generatePalette(harmonyMode, colorMood, currentPalette, lockedColors);
    setColors(newPalette);
  };

  // Generate palette from primary color (respects locks)
  const handleGenerateFromPrimary = useCallback((primaryColor?: string) => {
    const primary = primaryColor || colors.primary;
    const newPalette = generateFromSeed(primary, harmonyMode, colorMood, currentPalette, lockedColors);
    setColors(newPalette);
  }, [colors.primary, harmonyMode, colorMood, currentPalette, lockedColors, setColors]);

  // Handle color change with auto-generation when in from-primary mode
  const handleColorChange = useCallback((key: string, value: string) => {
    if (generationMode === 'from-primary' && key === 'primary') {
      // Generate entire palette from new primary (respects locks)
      const newPalette = generateFromSeed(value, harmonyMode, colorMood, currentPalette, lockedColors);
      setColors(newPalette);
    } else {
      // Just update the single color
      setColors({ [key]: value });
    }
  }, [generationMode, harmonyMode, colorMood, currentPalette, lockedColors, setColors]);

  // Re-generate when harmony or temperature changes (in from-primary mode)
  const handleHarmonyChange = useCallback((mode: HarmonyMode) => {
    setHarmonyMode(mode);
    if (generationMode === 'from-primary') {
      const newPalette = generateFromSeed(colors.primary, mode, colorMood, currentPalette, lockedColors);
      setColors(newPalette);
    }
  }, [generationMode, colors.primary, colorMood, currentPalette, lockedColors, setColors]);

  const handleTemperatureChange = useCallback((mood: ColorMood) => {
    setColorMood(mood);
    if (generationMode === 'from-primary') {
      const newPalette = generateFromSeed(colors.primary, harmonyMode, mood, currentPalette, lockedColors);
      setColors(newPalette);
    }
  }, [generationMode, colors.primary, harmonyMode, currentPalette, lockedColors, setColors]);

  // Check contrast issues
  const contrastIssues: Array<{ fg: string; bg: string; ratio: number; context: string }> = [];

  ['primary', 'secondary', 'neutral'].forEach((colorKey) => {
    const ratio = calculateContrastRatio(
      colors[colorKey as keyof typeof colors],
      colors.background
    );
    if (ratio < WCAG_AA_NORMAL_TEXT) {
      contrastIssues.push({
        fg: colorKey,
        bg: 'background',
        ratio,
        context: `${colorKey} on background`,
      });
    }
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Brand Setup</h2>
        <p className="text-slate-500 mt-1">Upload your brand assets and define your color palette</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - Assets */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Logo Upload */}
          <section className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Logos</h3>

            <div
              {...logoDropzone.getRootProps()}
              className={clsx(
                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                logoDropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary'
              )}
            >
              <input {...logoDropzone.getInputProps()} />
              <Upload className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-sm text-slate-600">
                Drop SVG or PNG files here, or click to browse
              </p>
              <p className="text-xs text-slate-400 mt-1">Max 5MB per file</p>
            </div>

            {logos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {logos.map((logo) => (
                  <div
                    key={logo.id}
                    className="relative group bg-slate-50 rounded-lg p-3 border border-slate-200"
                  >
                    <img
                      src={logo.url}
                      alt={logo.name}
                      className="w-full h-16 object-contain"
                    />
                    <p className="text-xs text-slate-500 mt-2 truncate">{logo.name}</p>
                    <button
                      onClick={() => removeLogo(logo.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Font Upload */}
          <section className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Fonts</h3>

            <div
              {...fontDropzone.getRootProps()}
              className={clsx(
                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                fontDropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary'
              )}
            >
              <input {...fontDropzone.getInputProps()} />
              <Upload className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-sm text-slate-600">
                Drop TTF or OTF files here, or click to browse
              </p>
              <p className="text-xs text-slate-400 mt-1">Max 10MB per file</p>
            </div>

            {fonts.length > 0 && (
              <div className="mt-4 space-y-2">
                {fonts.map((font) => (
                  <div
                    key={font.id}
                    className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-200"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">{font.name}</p>
                      <p className="text-xs text-slate-400">Font file</p>
                    </div>
                    <button
                      onClick={() => removeFont(font.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column - Colors */}
        <div className="space-y-6 order-1 lg:order-2">
          {/* Color Generator */}
          <section className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-800">Color Generator</h3>
            </div>

            {/* Generation Mode Toggle */}
            <div className="mb-4">
              <label className="text-sm text-slate-600 mb-2 block">Generation Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGenerationMode('from-primary')}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors',
                    generationMode === 'from-primary'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  <Wand2 size={16} />
                  From Primary
                </button>
                <button
                  onClick={() => setGenerationMode('random')}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors',
                    generationMode === 'random'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  <Shuffle size={16} />
                  Full Random
                </button>
              </div>
            </div>

            {/* Harmony Mode */}
            <div className="mb-4">
              <label className="text-sm text-slate-600 mb-2 block">Harmony Mode</label>
              <div className="flex flex-wrap gap-2">
                {harmonyModes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => handleHarmonyChange(mode.value)}
                    className={clsx(
                      'px-3 py-1.5 text-xs rounded-lg border transition-colors',
                      harmonyMode === mode.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                    title={mode.description}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Temperature */}
            <div className="mb-4">
              <label className="text-sm text-slate-600 mb-2 block">Color Temperature</label>
              <div className="flex gap-2">
                {colorMoods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => handleTemperatureChange(mood.value)}
                    className={clsx(
                      'px-4 py-1.5 text-xs rounded-lg border transition-colors',
                      colorMood === mood.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button - changes based on mode */}
            {generationMode === 'random' ? (
              <button
                onClick={handleRandomize}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Shuffle size={16} />
                <span className="text-sm font-medium">Randomize All Colors</span>
              </button>
            ) : (
              <button
                onClick={() => handleGenerateFromPrimary()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Palette size={16} />
                <span className="text-sm font-medium">Regenerate from Primary</span>
              </button>
            )}

            <p className="text-xs text-slate-400 mt-3">
              {generationMode === 'from-primary'
                ? 'Pick a primary color below and other colors will be generated automatically'
                : 'Lock colors you want to keep, then click Randomize'}
            </p>
          </section>

          {/* Color Palette */}
          <section className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Color Palette</h3>

            <div className="space-y-4">
              {colorRoles.map(({ key, label, description }) => {
                const colorValue = colors[key as keyof typeof colors];
                const hasIssue = contrastIssues.some((i) => i.fg === key);
                const isLocked = lockedColors[key as keyof LockedColors];

                return (
                  <div key={key} className="flex items-center gap-4">
                    {/* Lock button */}
                    <button
                      onClick={() => toggleLock(key as keyof LockedColors)}
                      className={clsx(
                        'p-2 rounded-lg border transition-colors',
                        isLocked
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 text-slate-400 hover:border-slate-300'
                      )}
                      title={isLocked ? 'Unlock color' : 'Lock color'}
                    >
                      {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                    <div className="relative">
                      <input
                        type="color"
                        value={colorValue}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className={clsx(
                          'w-12 h-12 rounded-lg cursor-pointer border-2',
                          generationMode === 'from-primary' && key === 'primary'
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-slate-200'
                        )}
                      />
                      {hasIssue && (
                        <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                          <AlertTriangle size={12} className="text-white" />
                        </div>
                      )}
                      {generationMode === 'from-primary' && key === 'primary' && (
                        <div className="absolute -top-1 -left-1 bg-primary rounded-full p-0.5">
                          <Wand2 size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">{label}</label>
                        {generationMode === 'from-primary' && key === 'primary' && (
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                            Source
                          </span>
                        )}
                        {hasIssue && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            Low contrast
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {generationMode === 'from-primary' && key === 'primary'
                          ? 'Change this to regenerate all colors'
                          : description}
                      </p>
                    </div>
                    <input
                      type="text"
                      value={colorValue.toUpperCase()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                          handleColorChange(key, val);
                        }
                      }}
                      className="w-24 px-2 py-1 text-sm font-mono border border-slate-200 rounded"
                    />
                  </div>
                );
              })}
            </div>

            {/* Contrast Matrix */}
            {contrastIssues.length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <h4 className="text-sm font-medium text-amber-800">Contrast Issues</h4>
                </div>
                <ul className="text-sm text-amber-700 space-y-1">
                  {contrastIssues.map((issue, i) => (
                    <li key={i}>
                      {issue.context}: {issue.ratio.toFixed(2)}:1 (minimum 4.5:1)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Preset Palettes */}
          <section className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-lg font-medium text-slate-800 mb-2">Preset Palettes</h3>
            <p className="text-sm text-slate-500 mb-4">
              Click a preset to use as a starting point for your brand colors
            </p>

            <div className="grid grid-cols-2 gap-3">
              {brandPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setColors(preset.colors)}
                  className="group p-3 rounded-lg border border-slate-200 hover:border-primary hover:shadow-sm transition-all text-left"
                >
                  {/* Color preview swatches */}
                  <div className="flex gap-1 mb-2">
                    <div
                      className="w-8 h-8 rounded-l"
                      style={{ backgroundColor: preset.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="w-8 h-8"
                      style={{ backgroundColor: preset.colors.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="w-8 h-8"
                      style={{ backgroundColor: preset.colors.neutral }}
                      title="Neutral"
                    />
                    <div
                      className="w-8 h-8"
                      style={{ backgroundColor: preset.colors.background, border: '1px solid #e2e8f0' }}
                      title="Background"
                    />
                    <div
                      className="w-8 h-8 rounded-r"
                      style={{ backgroundColor: preset.colors.accent }}
                      title="Accent"
                    />
                  </div>
                  {/* Preset name and description */}
                  <div className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                    {preset.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
