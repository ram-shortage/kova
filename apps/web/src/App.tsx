import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { BrandSetupPage } from './pages/BrandSetupPage';
import { StyleControlsPage } from './pages/StyleControlsPage';
import { LayoutSelectionPage } from './pages/LayoutSelectionPage';
import { PreviewPage } from './pages/PreviewPage';
import { ExportPage } from './pages/ExportPage';

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/brand" replace />} />
        <Route path="/brand" element={<BrandSetupPage />} />
        <Route path="/style" element={<StyleControlsPage />} />
        <Route path="/layouts" element={<LayoutSelectionPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/export" element={<ExportPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
