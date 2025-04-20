import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TelemetryProvider } from './context/TelemetryContext';
import { SettingsProvider } from './context/SettingsContext';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import TelemetryPage from './pages/TelemetryPage';
import ComparisonPage from './pages/ComparisonPage';

function App() {
  return (
    <SettingsProvider>
      <TelemetryProvider>
        <Router>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/telemetry" element={<TelemetryPage />} />
                <Route path="/comparison" element={<ComparisonPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </TelemetryProvider>
    </SettingsProvider>
  );
}

export default App;
