import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelemetry } from '../context/TelemetryContext';
import LineChart from '../components/charts/LineChart';
import LapSelector from '../components/LapSelector';
import TireDataDisplay from '../components/TireDataDisplay';
import LoadingSpinner from '../components/LoadingSpinner';

const TelemetryPage = () => {
  const navigate = useNavigate();
  const { telemetryData, getLapStats, getLapData } = useTelemetry();
  const [selectedLaps, setSelectedLaps] = useState([]);
  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    if (!telemetryData) {
      navigate('/');
      return;
    }

    // Set the best lap as default selected
    const lapStats = getLapStats();
    if (lapStats.length > 0) {
      const bestLap = lapStats.reduce((best, current) => 
        current.lapTime < best.lapTime ? current : best
      );
      setSelectedLaps([bestLap.lapNumber]);
    }
  }, [telemetryData, getLapStats, navigate]);

  // Update chart dimensions when window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.offsetWidth;
        setChartDimensions({
          width: containerWidth,
          height: Math.min(400, Math.max(250, containerWidth * 0.5))
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!telemetryData) {
    return <LoadingSpinner />;
  }

  const lapStats = getLapStats();

  // Prepare data for charts by combining selected laps
  const combinedLapData = selectedLaps.map(lapNumber => {
    const lapData = getLapData(lapNumber);
    return lapData.map(point => ({
      ...point,
      [`Speed_Lap${lapNumber}`]: point.Speed,
      [`Throttle_Lap${lapNumber}`]: point.Throttle,
      [`Brake_Lap${lapNumber}`]: point.Brake,
      Time: parseFloat(point.Time)
    }));
  }).flat();

  // Create chart lines for each selected lap
  const speedChartLines = selectedLaps.flatMap(lapNumber => [
    { 
      dataKey: `Speed_Lap${lapNumber}`, 
      color: getColorForLap(lapNumber, 0),
      name: `Speed (Lap ${lapNumber})`
    },
    { 
      dataKey: `Throttle_Lap${lapNumber}`, 
      color: getColorForLap(lapNumber, 1),
      name: `Throttle (Lap ${lapNumber})`
    },
    { 
      dataKey: `Brake_Lap${lapNumber}`, 
      color: getColorForLap(lapNumber, 2),
      name: `Brake (Lap ${lapNumber})`
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Detailed Telemetry Analysis
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Compare laps and analyze detailed telemetry data
          </p>
        </div>

        {/* Lap Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-8">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
            Select Laps to Compare
          </h2>
          <div className="space-y-4">
            <LapSelector
              laps={lapStats}
              selectedLaps={selectedLaps}
              onSelectLap={setSelectedLaps}
              maxSelections={3}
            />
            {selectedLaps.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedLaps.map((lapNumber) => (
                  <div
                    key={lapNumber}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: getColorForLap(lapNumber, 0), color: 'white' }}
                  >
                    Lap {lapNumber}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Speed Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-8">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
            Speed and Input Analysis
          </h2>
          <div ref={chartContainerRef} className="w-full">
            <LineChart
              data={combinedLapData}
              lines={speedChartLines}
              xDataKey="Time"
              width={chartDimensions.width}
              height={chartDimensions.height}
            />
          </div>
        </div>

        {/* Tire Data */}
        {selectedLaps.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
              Tire Data Analysis
            </h2>
            <TireDataDisplay
              data={telemetryData}
              selectedLaps={selectedLaps}
              containerWidth={chartDimensions.width}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to generate distinct colors for each lap
const getColorForLap = (lapNumber, dataType = 0) => {
  // Define color sets for different data types
  const colorSets = {
    speed: ['#3B82F6', '#6366F1', '#8B5CF6'],     // Blues
    throttle: ['#10B981', '#14B8A6', '#06B6D4'],   // Greens
    brake: ['#EF4444', '#F43F5E', '#F97316']       // Reds
  };

  // If lapNumber is invalid, return a default color
  if (!lapNumber || typeof lapNumber !== 'number') {
    return '#808080';
  }

  // Ensure dataType is within valid range (0-2)
  const safeDataType = Math.max(0, Math.min(2, dataType));
  
  // Get the appropriate color set based on dataType
  let colorSet;
  switch(safeDataType) {
    case 0: colorSet = colorSets.speed; break;
    case 1: colorSet = colorSets.throttle; break;
    case 2: colorSet = colorSets.brake; break;
    default: colorSet = colorSets.speed;
  }

  // Calculate index safely
  const index = ((lapNumber - 1) % 3 + 3) % 3;
  return colorSet[index];
};

export default TelemetryPage; 