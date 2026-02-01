/**
 * Comprehensive Template Store Tests
 * Tests for Zustand store with undo/redo and persistence
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useTemplateStore } from '../store/templateStore';

describe('useTemplateStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useTemplateStore.getState().resetTemplate();
    });
  });

  describe('initial state', () => {
    it('should have initial template with correct structure', () => {
      const { template } = useTemplateStore.getState();

      expect(template.id).toBe('new-template');
      expect(template.name).toBe('Untitled Template');
      expect(template.version).toBe('1.0.0');
    });

    it('should have default colors', () => {
      const { template } = useTemplateStore.getState();

      expect(template.tokens.colors.primary).toBe('#0A2A43');
      expect(template.tokens.colors.secondary).toBe('#3D6B82');
      expect(template.tokens.colors.neutral).toBe('#2B2B2B');
      expect(template.tokens.colors.background).toBe('#FFFFFF');
      expect(template.tokens.colors.accent).toBe('#E1A73B');
    });

    it('should have default spacing', () => {
      const { template } = useTemplateStore.getState();

      expect(template.tokens.spacing.base).toBe(4);
      expect(template.tokens.spacing.m).toBe(12);
      expect(template.tokens.spacing.l).toBe(24);
    });

    it('should have default typography', () => {
      const { template } = useTemplateStore.getState();

      expect(template.typography.title.fontFamily).toBe('Arial');
      expect(template.typography.title.fontSize).toBe(34);
      expect(template.typography.body.fontFamily).toBe('Arial');
      expect(template.typography.body.fontSize).toBe(14);
    });

    it('should have 10 default layouts', () => {
      const { template } = useTemplateStore.getState();

      expect(template.layouts.length).toBe(10);
    });

    it('should have default style settings', () => {
      const { template } = useTemplateStore.getState();

      expect(template.styleFamily).toBe('clean');
      expect(template.mood).toBe('calm');
      expect(template.spacingDensity).toBe(1.0);
      expect(template.typeScale).toBe(1.25);
      expect(template.contrastLevel).toBe(50);
    });

    it('should have empty assets', () => {
      const { logos, fonts } = useTemplateStore.getState();

      expect(logos).toHaveLength(0);
      expect(fonts).toHaveLength(0);
    });

    it('should have initial history state', () => {
      const { history, historyIndex } = useTemplateStore.getState();

      expect(history.length).toBe(1);
      expect(historyIndex).toBe(0);
    });
  });

  describe('setColors', () => {
    it('should update primary color', () => {
      act(() => {
        useTemplateStore.getState().setColors({ primary: '#FF0000' });
      });

      const { template } = useTemplateStore.getState();
      expect(template.tokens.colors.primary).toBe('#FF0000');
    });

    it('should preserve other colors when updating one', () => {
      const originalSecondary = useTemplateStore.getState().template.tokens.colors.secondary;

      act(() => {
        useTemplateStore.getState().setColors({ primary: '#FF0000' });
      });

      const { template } = useTemplateStore.getState();
      expect(template.tokens.colors.secondary).toBe(originalSecondary);
    });

    it('should update multiple colors at once', () => {
      act(() => {
        useTemplateStore.getState().setColors({
          primary: '#111111',
          secondary: '#222222',
        });
      });

      const { template } = useTemplateStore.getState();
      expect(template.tokens.colors.primary).toBe('#111111');
      expect(template.tokens.colors.secondary).toBe('#222222');
    });

    it('should add to history', () => {
      act(() => {
        useTemplateStore.getState().setColors({ primary: '#FF0000' });
      });

      const { history, historyIndex } = useTemplateStore.getState();
      expect(history.length).toBe(2);
      expect(historyIndex).toBe(1);
    });
  });

  describe('setSpacing', () => {
    it('should update base spacing', () => {
      act(() => {
        useTemplateStore.getState().setSpacing({ base: 8 });
      });

      const { template } = useTemplateStore.getState();
      expect(template.tokens.spacing.base).toBe(8);
    });

    it('should preserve other spacing values', () => {
      const originalM = useTemplateStore.getState().template.tokens.spacing.m;

      act(() => {
        useTemplateStore.getState().setSpacing({ base: 8 });
      });

      const { template } = useTemplateStore.getState();
      expect(template.tokens.spacing.m).toBe(originalM);
    });

    it('should update multiple spacing values', () => {
      act(() => {
        useTemplateStore.getState().setSpacing({ base: 8, m: 16, l: 32 });
      });

      const { template } = useTemplateStore.getState();
      expect(template.tokens.spacing.base).toBe(8);
      expect(template.tokens.spacing.m).toBe(16);
      expect(template.tokens.spacing.l).toBe(32);
    });
  });

  describe('setTypography', () => {
    it('should update title typography', () => {
      act(() => {
        useTemplateStore.getState().setTypography({
          title: { fontFamily: 'Georgia', fontSize: 40, lineHeight: 1.2, weight: 700 },
        });
      });

      const { template } = useTemplateStore.getState();
      expect(template.typography.title.fontFamily).toBe('Georgia');
      expect(template.typography.title.fontSize).toBe(40);
    });

    it('should update body typography', () => {
      act(() => {
        useTemplateStore.getState().setTypography({
          body: { fontFamily: 'Verdana', fontSize: 16, lineHeight: 1.6, weight: 300 },
        });
      });

      const { template } = useTemplateStore.getState();
      expect(template.typography.body.fontFamily).toBe('Verdana');
      expect(template.typography.body.fontSize).toBe(16);
    });

    it('should update both title and body', () => {
      act(() => {
        useTemplateStore.getState().setTypography({
          title: { fontFamily: 'Georgia', fontSize: 40, lineHeight: 1.2, weight: 700 },
          body: { fontFamily: 'Verdana', fontSize: 16, lineHeight: 1.6, weight: 300 },
        });
      });

      const { template } = useTemplateStore.getState();
      expect(template.typography.title.fontFamily).toBe('Georgia');
      expect(template.typography.body.fontFamily).toBe('Verdana');
    });
  });

  describe('setStyleFamily', () => {
    it('should update style family to editorial', () => {
      act(() => {
        useTemplateStore.getState().setStyleFamily('editorial');
      });

      const { template } = useTemplateStore.getState();
      expect(template.styleFamily).toBe('editorial');
    });

    it('should update style family to bold', () => {
      act(() => {
        useTemplateStore.getState().setStyleFamily('bold');
      });

      const { template } = useTemplateStore.getState();
      expect(template.styleFamily).toBe('bold');
    });

    it('should update style family to minimal', () => {
      act(() => {
        useTemplateStore.getState().setStyleFamily('minimal');
      });

      const { template } = useTemplateStore.getState();
      expect(template.styleFamily).toBe('minimal');
    });
  });

  describe('setMood', () => {
    it('should update mood to energetic', () => {
      act(() => {
        useTemplateStore.getState().setMood('energetic');
      });

      const { template } = useTemplateStore.getState();
      expect(template.mood).toBe('energetic');
    });

    it('should update mood to premium', () => {
      act(() => {
        useTemplateStore.getState().setMood('premium');
      });

      const { template } = useTemplateStore.getState();
      expect(template.mood).toBe('premium');
    });

    it('should update mood to technical', () => {
      act(() => {
        useTemplateStore.getState().setMood('technical');
      });

      const { template } = useTemplateStore.getState();
      expect(template.mood).toBe('technical');
    });
  });

  describe('setSpacingDensity', () => {
    it('should update spacing density', () => {
      act(() => {
        useTemplateStore.getState().setSpacingDensity(1.5);
      });

      const { template } = useTemplateStore.getState();
      expect(template.spacingDensity).toBe(1.5);
    });

    it('should accept minimum value', () => {
      act(() => {
        useTemplateStore.getState().setSpacingDensity(0.5);
      });

      const { template } = useTemplateStore.getState();
      expect(template.spacingDensity).toBe(0.5);
    });

    it('should accept maximum value', () => {
      act(() => {
        useTemplateStore.getState().setSpacingDensity(2.0);
      });

      const { template } = useTemplateStore.getState();
      expect(template.spacingDensity).toBe(2.0);
    });
  });

  describe('setTypeScale', () => {
    it('should update type scale', () => {
      act(() => {
        useTemplateStore.getState().setTypeScale(1.4);
      });

      const { template } = useTemplateStore.getState();
      expect(template.typeScale).toBe(1.4);
    });

    it('should accept minimum value', () => {
      act(() => {
        useTemplateStore.getState().setTypeScale(1.1);
      });

      const { template } = useTemplateStore.getState();
      expect(template.typeScale).toBe(1.1);
    });

    it('should accept maximum value', () => {
      act(() => {
        useTemplateStore.getState().setTypeScale(1.5);
      });

      const { template } = useTemplateStore.getState();
      expect(template.typeScale).toBe(1.5);
    });
  });

  describe('setContrastLevel', () => {
    it('should update contrast level', () => {
      act(() => {
        useTemplateStore.getState().setContrastLevel(75);
      });

      const { template } = useTemplateStore.getState();
      expect(template.contrastLevel).toBe(75);
    });

    it('should accept minimum value', () => {
      act(() => {
        useTemplateStore.getState().setContrastLevel(0);
      });

      const { template } = useTemplateStore.getState();
      expect(template.contrastLevel).toBe(0);
    });

    it('should accept maximum value', () => {
      act(() => {
        useTemplateStore.getState().setContrastLevel(100);
      });

      const { template } = useTemplateStore.getState();
      expect(template.contrastLevel).toBe(100);
    });
  });

  describe('toggleLayout', () => {
    it('should disable a layout', () => {
      act(() => {
        useTemplateStore.getState().toggleLayout('title', false);
      });

      const { template } = useTemplateStore.getState();
      const titleLayout = template.layouts.find(l => l.type === 'title');
      expect(titleLayout?.enabled).toBe(false);
    });

    it('should enable a layout', () => {
      // Appendix is disabled by default
      act(() => {
        useTemplateStore.getState().toggleLayout('appendix', true);
      });

      const { template } = useTemplateStore.getState();
      const appendixLayout = template.layouts.find(l => l.type === 'appendix');
      expect(appendixLayout?.enabled).toBe(true);
    });

    it('should not affect other layouts', () => {
      const originalContent = useTemplateStore.getState().template.layouts.find(l => l.type === 'content')?.enabled;

      act(() => {
        useTemplateStore.getState().toggleLayout('title', false);
      });

      const { template } = useTemplateStore.getState();
      const contentLayout = template.layouts.find(l => l.type === 'content');
      expect(contentLayout?.enabled).toBe(originalContent);
    });
  });

  describe('asset management', () => {
    const testLogo = {
      id: 'logo-1',
      name: 'company-logo.svg',
      type: 'logo' as const,
      url: 'blob:http://localhost:3000/logo-1',
    };

    const testFont = {
      id: 'font-1',
      name: 'custom-font.ttf',
      type: 'font' as const,
      url: 'blob:http://localhost:3000/font-1',
    };

    describe('addLogo', () => {
      it('should add a logo', () => {
        act(() => {
          useTemplateStore.getState().addLogo(testLogo);
        });

        const { logos } = useTemplateStore.getState();
        expect(logos).toHaveLength(1);
        expect(logos[0].id).toBe('logo-1');
      });

      it('should add multiple logos', () => {
        act(() => {
          useTemplateStore.getState().addLogo(testLogo);
          useTemplateStore.getState().addLogo({ ...testLogo, id: 'logo-2' });
        });

        const { logos } = useTemplateStore.getState();
        expect(logos).toHaveLength(2);
      });
    });

    describe('removeLogo', () => {
      it('should remove a logo by id', () => {
        act(() => {
          useTemplateStore.getState().addLogo(testLogo);
          useTemplateStore.getState().removeLogo('logo-1');
        });

        const { logos } = useTemplateStore.getState();
        expect(logos).toHaveLength(0);
      });

      it('should not affect other logos', () => {
        act(() => {
          useTemplateStore.getState().addLogo(testLogo);
          useTemplateStore.getState().addLogo({ ...testLogo, id: 'logo-2' });
          useTemplateStore.getState().removeLogo('logo-1');
        });

        const { logos } = useTemplateStore.getState();
        expect(logos).toHaveLength(1);
        expect(logos[0].id).toBe('logo-2');
      });
    });

    describe('addFont', () => {
      it('should add a font', () => {
        act(() => {
          useTemplateStore.getState().addFont(testFont);
        });

        const { fonts } = useTemplateStore.getState();
        expect(fonts).toHaveLength(1);
        expect(fonts[0].id).toBe('font-1');
      });
    });

    describe('removeFont', () => {
      it('should remove a font by id', () => {
        act(() => {
          useTemplateStore.getState().addFont(testFont);
          useTemplateStore.getState().removeFont('font-1');
        });

        const { fonts } = useTemplateStore.getState();
        expect(fonts).toHaveLength(0);
      });
    });
  });

  describe('undo/redo', () => {
    it('should undo a change', () => {
      const originalPrimary = useTemplateStore.getState().template.tokens.colors.primary;

      act(() => {
        useTemplateStore.getState().setColors({ primary: '#FF0000' });
      });

      expect(useTemplateStore.getState().template.tokens.colors.primary).toBe('#FF0000');

      act(() => {
        useTemplateStore.getState().undo();
      });

      expect(useTemplateStore.getState().template.tokens.colors.primary).toBe(originalPrimary);
    });

    it('should redo an undone change', () => {
      act(() => {
        useTemplateStore.getState().setColors({ primary: '#FF0000' });
        useTemplateStore.getState().undo();
        useTemplateStore.getState().redo();
      });

      expect(useTemplateStore.getState().template.tokens.colors.primary).toBe('#FF0000');
    });

    it('should not undo past initial state', () => {
      const initialPrimary = useTemplateStore.getState().template.tokens.colors.primary;

      act(() => {
        useTemplateStore.getState().undo();
        useTemplateStore.getState().undo();
        useTemplateStore.getState().undo();
      });

      expect(useTemplateStore.getState().template.tokens.colors.primary).toBe(initialPrimary);
      expect(useTemplateStore.getState().historyIndex).toBe(0);
    });

    it('should not redo past latest state', () => {
      act(() => {
        useTemplateStore.getState().setColors({ primary: '#FF0000' });
      });

      const { historyIndex } = useTemplateStore.getState();

      act(() => {
        useTemplateStore.getState().redo();
        useTemplateStore.getState().redo();
        useTemplateStore.getState().redo();
      });

      expect(useTemplateStore.getState().historyIndex).toBe(historyIndex);
    });

    it('should clear future history on new change after undo', () => {
      act(() => {
        useTemplateStore.getState().setColors({ primary: '#FF0000' });
        useTemplateStore.getState().setColors({ primary: '#00FF00' });
        useTemplateStore.getState().undo();
        useTemplateStore.getState().setColors({ primary: '#0000FF' });
      });

      const { history, historyIndex } = useTemplateStore.getState();
      expect(history.length).toBe(3); // Initial, #FF0000, #0000FF
      expect(historyIndex).toBe(2);
      expect(useTemplateStore.getState().template.tokens.colors.primary).toBe('#0000FF');
    });
  });

  describe('resetTemplate', () => {
    it('should reset template to initial state', () => {
      act(() => {
        useTemplateStore.getState().setColors({ primary: '#FF0000' });
        useTemplateStore.getState().setSpacingDensity(2.0);
        useTemplateStore.getState().addLogo({ id: 'logo-1', name: 'test', type: 'logo', url: 'test' });
        useTemplateStore.getState().resetTemplate();
      });

      const { template, logos, history, historyIndex } = useTemplateStore.getState();
      expect(template.tokens.colors.primary).toBe('#0A2A43');
      expect(template.spacingDensity).toBe(1.0);
      expect(logos).toHaveLength(0);
      expect(history.length).toBe(1);
      expect(historyIndex).toBe(0);
    });
  });

  describe('setCurrentStep', () => {
    it('should update current step', () => {
      act(() => {
        useTemplateStore.getState().setCurrentStep(2);
      });

      expect(useTemplateStore.getState().currentStep).toBe(2);
    });
  });
});
