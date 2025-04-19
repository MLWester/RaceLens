import { createContext, useContext, useState } from 'react';

export const TelemetryContext = createContext();

export const TelemetryProvider = ({ children }) => {
  const [telemetryData, setTelemetryData] = useState(null);
  const [selectedLaps, setSelectedLaps] = useState([]);
  const [sessionMetadata, setSessionMetadata] = useState(null);

  const value = {
    telemetryData,
    setTelemetryData,
    selectedLaps,
    setSelectedLaps,
    sessionMetadata,
    setSessionMetadata,
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