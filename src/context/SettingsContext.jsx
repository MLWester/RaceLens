import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'system',
    units: {
      speed: 'kmh',
      temperature: 'celsius',
      pressure: 'bar'
    },
    defaultView: 'dashboard',
    chartPreferences: {
      showGrid: true,
      showLegend: true,
      animation: true
    },
    exportPreferences: {
      format: 'csv',
      includeMetadata: true,
      timestampFormat: 'ISO'
    }
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('raceLensSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('raceLensSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: typeof value === 'object' ? { ...prev[key], ...value } : value
    }));
  };

  const convertSpeed = (value) => {
    return settings.units.speed === 'mph' ? value * 0.621371 : value;
  };

  const convertTemperature = (value) => {
    return settings.units.temperature === 'fahrenheit' ? (value * 9/5) + 32 : value;
  };

  const convertPressure = (value) => {
    return settings.units.pressure === 'psi' ? value * 14.5038 : value;
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      convertSpeed,
      convertTemperature,
      convertPressure
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 