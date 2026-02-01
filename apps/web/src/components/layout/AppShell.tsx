import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Palette, Sliders, LayoutGrid, Eye, Download, Undo2, Redo2, Menu, X } from 'lucide-react';
import { useTemplateStore } from '../../store/templateStore';
import { clsx } from 'clsx';

const steps = [
  { path: '/brand', label: 'Brand', icon: Palette },
  { path: '/style', label: 'Style', icon: Sliders },
  { path: '/layouts', label: 'Layouts', icon: LayoutGrid },
  { path: '/preview', label: 'Preview', icon: Eye },
  { path: '/export', label: 'Export', icon: Download },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { template, undo, redo, historyIndex, history } = useTemplateStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentStepIndex = steps.findIndex((s) => s.path === location.pathname);

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <h1 className="text-lg md:text-xl font-semibold text-primary truncate">
            <span className="hidden sm:inline">Dynamic Template Studio</span>
            <span className="sm:hidden">DTS</span>
          </h1>
          <span className="hidden md:inline text-sm text-slate-500">|</span>
          <span className="hidden md:inline text-sm text-slate-600 truncate max-w-[200px]">{template.name}</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className={clsx(
                'p-2 rounded hover:bg-slate-100',
                historyIndex === 0 ? 'text-slate-300' : 'text-slate-600'
              )}
              title="Undo (Cmd+Z)"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className={clsx(
                'p-2 rounded hover:bg-slate-100',
                historyIndex === history.length - 1 ? 'text-slate-300' : 'text-slate-600'
              )}
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo2 size={18} />
            </button>
          </div>

          <button
            onClick={() => handleNavigation('/export')}
            className="bg-primary text-white px-3 md:px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
          >
            <span className="hidden sm:inline">Export Template</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile Navigation Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <nav
          className={clsx(
            'fixed md:static inset-y-0 left-0 z-50 w-56 bg-white border-r border-slate-200 p-4 transform transition-transform duration-200 ease-in-out md:transform-none',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
            'top-[57px] md:top-0' // Account for header height on mobile
          )}
        >
          <div className="space-y-1">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = location.pathname === step.path;
              const isCompleted = index < currentStepIndex;

              return (
                <button
                  key={step.path}
                  onClick={() => handleNavigation(step.path)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : isCompleted
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-500 hover:bg-slate-100'
                  )}
                >
                  <div
                    className={clsx(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                      isActive
                        ? 'bg-primary text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    )}
                  >
                    {index + 1}
                  </div>
                  <Icon size={18} />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-30">
          <div className="flex justify-around py-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = location.pathname === step.path;
              const isCompleted = index < currentStepIndex;

              return (
                <button
                  key={step.path}
                  onClick={() => handleNavigation(step.path)}
                  className={clsx(
                    'flex flex-col items-center gap-1 px-3 py-1 min-w-[56px]',
                    isActive
                      ? 'text-primary'
                      : isCompleted
                      ? 'text-green-600'
                      : 'text-slate-400'
                  )}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium">{step.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
