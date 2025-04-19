import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TelemetryProvider } from './context/TelemetryContext';
import Navigation from './components/Navigation';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import TelemetryPage from './pages/TelemetryPage';
import AnalysisPage from './pages/AnalysisPage';

function App() {
  return (
    <TelemetryProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/telemetry" element={<TelemetryPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </TelemetryProvider>
  );
}

export default App;
