import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelemetry } from '../context/TelemetryContext';
import LineChart from '../components/charts/LineChart';
import LapStatsCard from '../components/LapStatsCard';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { telemetryData, sessionMetadata, getLapStats } = useTelemetry();
  const [selectedLap, setSelectedLap] = useState(null);

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
      setSelectedLap(bestLap.lapNumber);
    }
  }, [telemetryData, getLapStats, navigate]);

  const lapStats = useMemo(() => {
    if (!telemetryData) return [];
    return getLapStats();
  }, [telemetryData, getLapStats]);

  const bestLap = useMemo(() => {
    if (lapStats.length === 0) return null;
    return lapStats.reduce((best, current) => 
      current.lapTime < best.lapTime ? current : best
    );
  }, [lapStats]);

  const avgLapTime = useMemo(() => {
    if (lapStats.length === 0) return 0;
    return lapStats.reduce((sum, lap) => sum + lap.lapTime, 0) / lapStats.length;
  }, [lapStats]);

  // Prepare data for the speed chart
  const speedChartData = useMemo(() => {
    if (!selectedLap || !telemetryData?.laps?.[selectedLap]) return [];
    
    return telemetryData.laps[selectedLap].map(point => ({
      Time: parseFloat(point.Time) || 0,
      Speed: parseFloat(point.Speed) || 0,
      Throttle: parseFloat(point.Throttle) || 0,
      Brake: parseFloat(point.Brake) || 0
    }));
  }, [telemetryData, selectedLap]);

  const speedChartLines = [
    { dataKey: 'Speed', color: '#3B82F6', name: 'Speed (km/h)' },
    { dataKey: 'Throttle', color: '#10B981', name: 'Throttle (%)' },
    { dataKey: 'Brake', color: '#EF4444', name: 'Brake (%)' },
  ];

  // Prepare data for lap times chart
  const lapTimesChartData = useMemo(() => {
    return lapStats.map(lap => ({
      lapNumber: lap.lapNumber,
      lapTime: parseFloat(lap.lapTime) || 0
    }));
  }, [lapStats]);

  const lapTimesChartLines = [
    { dataKey: 'lapTime', color: '#3B82F6', name: 'Lap Time (s)' }
  ];

  if (!telemetryData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Session Overview
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Analyzing telemetry data from your session
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <LapStatsCard
            title="Best Lap Time"
            value={bestLap ? bestLap.lapTime.toFixed(3) : '-'}
            unit="s"
            description="Fastest lap of the session"
          />
          <LapStatsCard
            title="Average Lap Time"
            value={avgLapTime.toFixed(3)}
            unit="s"
            description="Mean lap time across all laps"
          />
          <LapStatsCard
            title="Top Speed"
            value={bestLap ? bestLap.maxSpeed.toFixed(1) : '-'}
            unit="km/h"
            description="Maximum speed achieved"
          />
          <LapStatsCard
            title="Total Laps"
            value={lapStats.length}
            description="Number of completed laps"
          />
        </div>

        {/* Speed Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Speed Analysis
          </h2>
          <div className="h-96">
            <LineChart
              data={speedChartData}
              lines={speedChartLines}
              xDataKey="Time"
              height={400}
            />
          </div>
        </div>

        {/* Lap Times Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Lap Times
          </h2>
          <div className="h-96">
            <LineChart
              data={lapTimesChartData}
              lines={lapTimesChartLines}
              xDataKey="lapNumber"
              height={400}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 