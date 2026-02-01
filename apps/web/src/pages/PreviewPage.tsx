import { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, Rows, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';
import { SlidePreview } from '../components/preview/SlidePreview';
import { clsx } from 'clsx';

type ViewMode = 'gallery' | 'carousel';

export function PreviewPage() {
  const { template } = useTemplateStore();
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Refs for focusable containers
  const carouselRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const enabledLayouts = template.layouts.filter((l) => l.enabled);

  // Navigation functions
  const goToPreviousSlide = useCallback(() => {
    setSelectedSlideIndex((i) => Math.max(0, i - 1));
  }, []);

  const goToNextSlide = useCallback(() => {
    setSelectedSlideIndex((i) => Math.min(enabledLayouts.length - 1, i + 1));
  }, [enabledLayouts.length]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousSlide();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextSlide();
      } else if (event.key === 'Escape' && showLightbox) {
        event.preventDefault();
        setShowLightbox(false);
      }
    },
    [goToPreviousSlide, goToNextSlide, showLightbox]
  );

  // Attach keyboard listener when lightbox is open or carousel is focused
  useEffect(() => {
    if (showLightbox) {
      // When lightbox is open, listen for keyboard events globally
      document.addEventListener('keydown', handleKeyDown);
      // Focus the lightbox for accessibility
      lightboxRef.current?.focus();
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showLightbox, handleKeyDown]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.5));

  return (
    <div className="p-4 md:p-6">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800">Preview Gallery</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Review all {enabledLayouts.length} enabled slide types
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('gallery')}
              className={clsx(
                'p-2 rounded',
                viewMode === 'gallery' ? 'bg-white shadow-sm' : 'text-slate-500'
              )}
              title="Gallery View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('carousel')}
              className={clsx(
                'p-2 rounded',
                viewMode === 'carousel' ? 'bg-white shadow-sm' : 'text-slate-500'
              )}
              title="Carousel View"
            >
              <Rows size={18} />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-2 hover:bg-slate-100 rounded disabled:opacity-50"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-sm text-slate-600 w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2}
              className="p-2 hover:bg-slate-100 rounded disabled:opacity-50"
            >
              <ZoomIn size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery View */}
      {viewMode === 'gallery' && (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${320 * zoomLevel}px, 1fr))`,
          }}
        >
          {enabledLayouts.map((layout, index) => (
            <div
              key={layout.type}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedSlideIndex(index);
                setShowLightbox(true);
              }}
            >
              <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
                <SlidePreview template={template} layout={layout} size="medium" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-700">{layout.name}</span>
                  <span className="text-xs text-slate-400 ml-2">Slide {index + 1}</span>
                </div>
                <button className="p-1 hover:bg-slate-100 rounded">
                  <Maximize2 size={16} className="text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Carousel View */}
      {viewMode === 'carousel' && (
        <div
          ref={carouselRef}
          className="flex flex-col items-center outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              goToPreviousSlide();
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              goToNextSlide();
            }
          }}
          role="region"
          aria-label="Slide carousel. Use left and right arrow keys to navigate."
          aria-roledescription="carousel"
        >
          {/* Main Slide */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <SlidePreview
              template={template}
              layout={enabledLayouts[selectedSlideIndex]}
              size="large"
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={goToPreviousSlide}
              disabled={selectedSlideIndex === 0}
              className="px-4 py-2 bg-slate-100 rounded-lg disabled:opacity-50 hover:bg-slate-200 transition-colors"
              aria-label="Previous slide"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600" aria-live="polite">
              {selectedSlideIndex + 1} / {enabledLayouts.length}
            </span>
            <button
              onClick={goToNextSlide}
              disabled={selectedSlideIndex === enabledLayouts.length - 1}
              className="px-4 py-2 bg-slate-100 rounded-lg disabled:opacity-50 hover:bg-slate-200 transition-colors"
              aria-label="Next slide"
            >
              Next
            </button>
          </div>
          {/* Keyboard hint */}
          <p className="text-xs text-slate-400 mb-4">
            Use arrow keys to navigate when focused
          </p>

          {/* Thumbnail Strip */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {enabledLayouts.map((layout, index) => (
              <button
                key={layout.type}
                onClick={() => setSelectedSlideIndex(index)}
                className={clsx(
                  'flex-shrink-0 border-2 rounded-lg p-1',
                  index === selectedSlideIndex ? 'border-primary' : 'border-transparent'
                )}
              >
                <SlidePreview
                  template={template}
                  layout={layout}
                  size="small"
                  showLabel={false}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center outline-none p-4"
          onClick={() => setShowLightbox(false)}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="Slide preview lightbox. Use left and right arrow keys to navigate, Escape to close."
        >
          <div
            className="bg-white rounded-lg p-6 flex flex-col focus:ring-2 focus:ring-primary focus:ring-offset-2"
            style={{ width: '90vw', height: '90vh', maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0">
              <SlidePreview
                template={template}
                layout={enabledLayouts[selectedSlideIndex]}
                size="fullscreen"
              />
            </div>
            <div className="mt-4 flex justify-between items-center flex-shrink-0">
              <button
                onClick={goToPreviousSlide}
                disabled={selectedSlideIndex === 0}
                className="px-4 py-2 bg-slate-100 rounded-lg disabled:opacity-50 hover:bg-slate-200 transition-colors"
                aria-label="Previous slide"
              >
                Previous
              </button>
              <div className="text-center">
                <span className="text-slate-600 block" aria-live="polite">
                  {enabledLayouts[selectedSlideIndex].name}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedSlideIndex + 1} / {enabledLayouts.length} - Arrow keys to navigate, Esc to close
                </span>
              </div>
              <button
                onClick={goToNextSlide}
                disabled={selectedSlideIndex === enabledLayouts.length - 1}
                className="px-4 py-2 bg-slate-100 rounded-lg disabled:opacity-50 hover:bg-slate-200 transition-colors"
                aria-label="Next slide"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
