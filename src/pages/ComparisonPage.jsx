import { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import SessionComparison from '../components/SessionComparison';
import LoadingSpinner from '../components/LoadingSpinner';
import exportService from '../services/exportService';

const ComparisonPage = () => {
  const { telemetryData, getLapStats } = useTelemetry();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!telemetryData || !telemetryData.laps) {
      setError('No telemetry data available');
      setLoading(false);
      return;
    }

    try {
      const lapStats = getLapStats();
      const bestLap = lapStats.reduce((best, current) => 
        current.lapTime < best.lapTime ? current : best
      );

      // Calculate average throttle and brake
      const avgThrottle = lapStats.reduce((sum, lap) => sum + lap.avgThrottle, 0) / lapStats.length;
      const avgBrake = lapStats.reduce((sum, lap) => sum + lap.avgBrake, 0) / lapStats.length;

      // Process telemetry data into session format
      const processedSession = {
        id: '1',
        name: telemetryData.metadata?.sessionName || 'Current Session',
        date: new Date(),
        data: telemetryData.laps[bestLap.lapNumber] || [],
        avgSpeed: bestLap.avgSpeed || 0,
        maxSpeed: bestLap.maxSpeed || 0,
        bestLapTime: bestLap.lapTime || 0,
        consistency: calculateConsistency(lapStats) || 0,
        avgThrottle: avgThrottle || 0,
        avgBrake: avgBrake || 0,
        color: '#3B82F6'
      };

      setSessions([processedSession]);
      setLoading(false);
    } catch (err) {
      console.error('Error processing telemetry data:', err);
      setError('Error processing telemetry data');
      setLoading(false);
    }
  }, [telemetryData, getLapStats]);

  const calculateConsistency = (lapStats) => {
    if (!lapStats || lapStats.length < 2) return 0;
    
    const lapTimes = lapStats.map(lap => lap.lapTime);
    const avgLapTime = lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length;
    const variance = lapTimes.reduce((acc, time) => acc + Math.pow(time - avgLapTime, 2), 0) / lapTimes.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to percentage where lower is better (100% - coefficient of variation)
    return Math.max(0, 100 - (stdDev / avgLapTime * 100));
  };

  const handleExport = async (format) => {
    if (!telemetryData) {
      setError('No data to export');
      return;
    }

    try {
      await exportService.exportData(telemetryData.rawData, telemetryData.metadata, format);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Session Analysis
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Compare and analyze your racing sessions
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => handleExport('csv')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Export JSON
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="p-6">
            <SessionComparison sessions={sessions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage; 