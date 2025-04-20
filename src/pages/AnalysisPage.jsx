import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelemetry } from '../context/TelemetryContext';
import LineChart from '../components/charts/LineChart';
import LapSelector from '../components/LapSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import TrackMap from '../components/TrackMap';
import { Popover } from '@headlessui/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const AnalysisPage = () => {
  const navigate = useNavigate();
  const { telemetryData, getLapStats, getLapData } = useTelemetry();
  const [selectedLaps, setSelectedLaps] = useState([]);
  const [selectedSector, setSelectedSector] = useState(1);

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

  if (!telemetryData) {
    return <LoadingSpinner />;
  }

  const lapStats = getLapStats();
  const selectedLapData = selectedLaps.length > 0 ? getLapData(selectedLaps[0]) : [];

  // Calculate sector times and metrics
  const calculateSectorMetrics = (lapData) => {
    const totalPoints = lapData.length;
    const sectorPoints = Math.floor(totalPoints / 3);
    
    const sectors = {
      sector1: lapData.slice(0, sectorPoints),
      sector2: lapData.slice(sectorPoints, sectorPoints * 2),
      sector3: lapData.slice(sectorPoints * 2)
    };

    // Calculate metrics for each sector
    return Object.entries(sectors).reduce((acc, [sector, data]) => {
      const speeds = data.map(d => d.Speed);
      const throttles = data.map(d => d.Throttle);
      const brakes = data.map(d => d.Brake);

      // Find braking points (where brake > 0.5)
      const brakingPoints = data
        .filter((d, i) => d.Brake > 0.5 && (i === 0 || data[i - 1].Brake <= 0.5))
        .map(d => ({
          time: d.Time,
          speed: d.Speed,
          position: { x: d.X, y: d.Y }
        }));

      acc[sector] = {
        data,
        time: (data[data.length - 1].Time - data[0].Time) * 1000,
        minSpeed: Math.min(...speeds),
        maxSpeed: Math.max(...speeds),
        avgSpeed: speeds.reduce((a, b) => a + b, 0) / speeds.length,
        avgThrottle: throttles.reduce((a, b) => a + b, 0) / throttles.length,
        brakingPoints
      };
      return acc;
    }, {});
  };

  const sectors = calculateSectorMetrics(selectedLapData);
  const currentSectorData = sectors[`sector${selectedSector}`]?.data || [];

  const speedChartLines = [
    { dataKey: 'Speed', color: '#3B82F6', name: 'Speed' },
    { dataKey: 'Throttle', color: '#10B981', name: 'Throttle' },
    { dataKey: 'Brake', color: '#EF4444', name: 'Brake' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Advanced Analysis
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Detailed sector analysis and performance comparison
          </p>
        </div>

        {/* Lap Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Select Laps to Compare
          </h2>
          <LapSelector
            laps={lapStats}
            selectedLaps={selectedLaps}
            onSelectLap={setSelectedLaps}
          />
        </div>

        {/* Sector Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Sector Analysis
            </h2>
            <Popover className="relative">
              <Popover.Button className="text-gray-400 hover:text-gray-500">
                <InformationCircleIcon className="h-5 w-5" />
              </Popover.Button>
              <Popover.Panel className="absolute z-10 w-64 p-2 mt-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                Select a sector to analyze detailed performance metrics. The mini-map shows the approximate location of each sector.
              </Popover.Panel>
            </Popover>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Sector Buttons */}
            <div className="flex space-x-4">
              {[1, 2, 3].map((sector) => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    selectedSector === sector
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Sector {sector}
                </button>
              ))}
            </div>

            {/* Mini Track Map */}
            <div className="flex-1 h-32">
              <TrackMap
                data={telemetryData}
                selectedLaps={selectedLaps}
                width={400}
                height={128}
                showSectors={true}
                highlightSector={selectedSector}
              />
            </div>
          </div>

          {/* Sector Performance */}
          <div className="h-96">
            <LineChart
              data={currentSectorData}
              lines={speedChartLines}
              xDataKey="Time"
              height={400}
            />
          </div>

          {/* Sector Metrics */}
          {currentSectorData.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Sector Time',
                  value: sectors[`sector${selectedSector}`].time.toFixed(3),
                  unit: 's',
                  tooltip: 'Time taken to complete this sector'
                },
                {
                  title: 'Min Speed',
                  value: sectors[`sector${selectedSector}`].minSpeed.toFixed(1),
                  unit: 'km/h',
                  tooltip: 'Lowest speed recorded in this sector'
                },
                {
                  title: 'Max Speed',
                  value: sectors[`sector${selectedSector}`].maxSpeed.toFixed(1),
                  unit: 'km/h',
                  tooltip: 'Highest speed recorded in this sector'
                },
                {
                  title: 'Avg Throttle',
                  value: (sectors[`sector${selectedSector}`].avgThrottle * 100).toFixed(1),
                  unit: '%',
                  tooltip: 'Average throttle usage in this sector'
                }
              ].map((metric) => (
                <div key={metric.title} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {metric.title}
                    </h3>
                    <Popover className="relative">
                      <Popover.Button className="text-gray-400 hover:text-gray-500">
                        <InformationCircleIcon className="h-4 w-4" />
                      </Popover.Button>
                      <Popover.Panel className="absolute z-10 w-48 p-2 mt-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                        {metric.tooltip}
                      </Popover.Panel>
                    </Popover>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                      {metric.unit}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Comparison */}
        {selectedLaps.length > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Performance Comparison
              </h2>
              <Popover className="relative">
                <Popover.Button className="text-gray-400 hover:text-gray-500">
                  <InformationCircleIcon className="h-5 w-5" />
                </Popover.Button>
                <Popover.Panel className="absolute z-10 w-64 p-2 mt-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                  Compare detailed metrics between selected laps. Hover over metrics for more information.
                </Popover.Panel>
              </Popover>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedLaps.map((lapNumber) => {
                const lapData = getLapData(lapNumber);
                const sectorMetrics = calculateSectorMetrics(lapData);
                return (
                  <div key={lapNumber} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Lap {lapNumber}
                    </h3>
                    <div className="space-y-4">
                      {[1, 2, 3].map((sector) => (
                        <div key={sector} className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Sector {sector}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              {
                                label: 'Time',
                                value: sectorMetrics[`sector${sector}`].time.toFixed(3),
                                unit: 's',
                                tooltip: 'Time taken to complete this sector'
                              },
                              {
                                label: 'Min Speed',
                                value: sectorMetrics[`sector${sector}`].minSpeed.toFixed(1),
                                unit: 'km/h',
                                tooltip: 'Lowest speed recorded in this sector'
                              },
                              {
                                label: 'Max Speed',
                                value: sectorMetrics[`sector${sector}`].maxSpeed.toFixed(1),
                                unit: 'km/h',
                                tooltip: 'Highest speed recorded in this sector'
                              },
                              {
                                label: 'Avg Throttle',
                                value: (sectorMetrics[`sector${sector}`].avgThrottle * 100).toFixed(1),
                                unit: '%',
                                tooltip: 'Average throttle usage in this sector'
                              }
                            ].map((metric) => (
                              <div key={metric.label} className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-300">
                                  {metric.label}:
                                </span>
                                <Popover className="relative">
                                  <Popover.Button className="text-gray-900 dark:text-white">
                                    {metric.value}
                                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                                      {metric.unit}
                                    </span>
                                  </Popover.Button>
                                  <Popover.Panel className="absolute z-10 w-48 p-2 mt-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                                    {metric.tooltip}
                                  </Popover.Panel>
                                </Popover>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Track Map */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Track Map
            </h2>
            <Popover className="relative">
              <Popover.Button className="text-gray-400 hover:text-gray-500">
                <InformationCircleIcon className="h-5 w-5" />
              </Popover.Button>
              <Popover.Panel className="absolute z-10 w-64 p-2 mt-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                The track map shows your driving line with speed-based coloring. Warmer colors indicate higher speeds.
              </Popover.Panel>
            </Popover>
          </div>
          <div className="h-96">
            <TrackMap
              data={telemetryData}
              selectedLaps={selectedLaps}
              width={800}
              height={400}
              showSectors={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage; 