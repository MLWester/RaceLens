import { createContext, useContext, useState, useCallback } from 'react';

export const TelemetryContext = createContext();

export const TelemetryProvider = ({ children }) => {
  // Core telemetry data
  const [telemetryData, setTelemetryData] = useState(null);
  const [sessionMetadata, setSessionMetadata] = useState(null);
  
  // Selected data for comparison
  const [selectedLaps, setSelectedLaps] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState(['Speed', 'Throttle', 'Brake']);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Chart configuration
  const [chartConfig, setChartConfig] = useState({
    showThrottle: true,
    showBrake: true,
    showSpeed: true,
    showTireTemps: true,
    showTirePressures: true,
  });

  // Helper functions
  const parseTelemetryData = useCallback((rawData) => {
    try {
      // Ensure rawData is an array and has data
      if (!Array.isArray(rawData) || rawData.length === 0) {
        throw new Error('Invalid telemetry data format');
      }

      // Process raw data to ensure all values are numbers
      const processedRawData = rawData.map(point => ({
        ...point,
        Speed: typeof point.Speed === 'number' ? point.Speed : parseFloat(point.Speed) || 0,
        Time: typeof point.Time === 'number' ? point.Time : parseFloat(point.Time) || 0,
        Throttle: typeof point.Throttle === 'number' ? point.Throttle : parseFloat(point.Throttle) || 0,
        Brake: typeof point.Brake === 'number' ? point.Brake : parseFloat(point.Brake) || 0,
        X: typeof point.X === 'number' ? point.X : parseFloat(point.X) || 0,
        Y: typeof point.Y === 'number' ? point.Y : parseFloat(point.Y) || 0
      }));

      // Group data by lap
      const laps = {};
      let currentLap = 1;
      let lastX = null;
      let lastY = null;

      processedRawData.forEach((point) => {
        // Detect lap completion when position returns close to start (0,0)
        if (lastX !== null && lastY !== null &&
            Math.abs(point.X) < 10 && Math.abs(point.Y) < 10 &&
            (Math.abs(lastX) > 100 || Math.abs(lastY) > 100)) {
          currentLap++;
        }

        if (!laps[currentLap]) {
          laps[currentLap] = [];
        }
        laps[currentLap].push(point);

        lastX = point.X;
        lastY = point.Y;
      });

      // Calculate lap statistics
      const lapStats = Object.entries(laps).map(([lapNumber, lapData]) => {
        const speeds = lapData.map(d => d.Speed);
        const throttle = lapData.map(d => d.Throttle);
        const brake = lapData.map(d => d.Brake);
        
        return {
          lapNumber: parseInt(lapNumber),
          avgSpeed: speeds.reduce((a, b) => a + b, 0) / speeds.length,
          maxSpeed: Math.max(...speeds),
          avgThrottle: throttle.reduce((a, b) => a + b, 0) / throttle.length,
          avgBrake: brake.reduce((a, b) => a + b, 0) / brake.length,
          lapTime: lapData[lapData.length - 1].Time - lapData[0].Time,
        };
      });

      const processedData = {
        rawData: processedRawData,
        laps,
        lapStats,
      };

      console.log('Processed telemetry data:', processedData);
      return processedData;
    } catch (err) {
      console.error('Error parsing telemetry data:', err);
      setError('Error parsing telemetry data');
      return null;
    }
  }, []);

  const value = {
    // State
    telemetryData,
    sessionMetadata,
    selectedLaps,
    selectedMetrics,
    isLoading,
    error,
    chartConfig,

    // Setters
    setTelemetryData: (data) => {
      console.log('Setting telemetry data:', data);
      if (Array.isArray(data)) {
        const processed = parseTelemetryData(data);
        if (processed) {
          setTelemetryData(processed);
          setError(null);
        }
      } else if (data && data.rawData) {
        setTelemetryData(data);
        setError(null);
      } else {
        setError('Invalid telemetry data format');
      }
    },
    setSessionMetadata,
    setSelectedLaps,
    setSelectedMetrics,
    setChartConfig,

    // Actions
    parseTelemetryData,
    setIsLoading,
    setError,

    // Computed values
    getLapData: (lapNumber) => telemetryData?.laps[lapNumber] || [],
    getLapStats: () => telemetryData?.lapStats || [],
    getSelectedLapData: () => 
      selectedLaps.map(lap => ({
        lapNumber: lap,
        data: telemetryData?.laps[lap] || []
      })),
  };

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}; 