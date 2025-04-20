import { useState } from 'react';
import BarChart from './charts/BarChart';

const metrics = {
  avgSpeed: {
    label: 'Average Speed',
    unit: 'km/h',
    getValue: (session) => session.avgSpeed,
    description: 'Average speed across the session'
  },
  maxSpeed: {
    label: 'Maximum Speed',
    unit: 'km/h',
    getValue: (session) => session.maxSpeed,
    description: 'Peak speed achieved during the session'
  },
  bestLapTime: {
    label: 'Best Lap Time',
    unit: 's',
    getValue: (session) => session.bestLapTime,
    description: 'Fastest lap time achieved'
  },
  consistency: {
    label: 'Consistency',
    unit: '%',
    getValue: (session) => session.consistency,
    description: 'Lap time consistency score'
  },
  avgThrottle: {
    label: 'Average Throttle',
    unit: '%',
    getValue: (session) => session.avgThrottle,
    description: 'Average throttle application'
  },
  avgBrake: {
    label: 'Average Brake',
    unit: '%',
    getValue: (session) => session.avgBrake,
    description: 'Average brake application'
  }
};

const SessionComparison = ({ sessions }) => {
  const [selectedMetric, setSelectedMetric] = useState('avgSpeed');
  const [selectedSessions, setSelectedSessions] = useState([]);

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No sessions available for comparison</p>
      </div>
    );
  }

  // Handle session selection
  const toggleSession = (sessionId) => {
    setSelectedSessions(prev => {
      if (prev.includes(sessionId)) {
        return prev.filter(id => id !== sessionId);
      }
      return [...prev, sessionId].slice(-3); // Limit to 3 sessions
    });
  };

  // Filter sessions based on selection
  const sessionsToCompare = selectedSessions.length > 0
    ? sessions.filter(session => selectedSessions.includes(session.id))
    : sessions;

  // Prepare data for bar chart
  const barChartData = sessionsToCompare.map(session => ({
    label: session.name,
    value: metrics[selectedMetric].getValue(session),
    color: session.color
  }));

  return (
    <div className="space-y-8">
      {/* Session Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map(session => (
          <div
            key={session.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedSessions.includes(session.id)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
            onClick={() => toggleSession(session.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">{session.name}</h3>
              <span className="text-sm text-gray-500">
                {new Date(session.date).toLocaleDateString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600 dark:text-gray-300">
                Best Lap: {session.bestLapTime.toFixed(3)}s
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Max Speed: {session.maxSpeed.toFixed(1)} km/h
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Metric Selection and Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {metrics[selectedMetric].label} Comparison
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {metrics[selectedMetric].description}
              </p>
            </div>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
            >
              {Object.entries(metrics).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="h-64">
            <BarChart data={barChartData} />
          </div>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Detailed Analysis
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                {sessionsToCompare.map(session => (
                  <th key={session.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {session.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(metrics).map(([key, { label, unit, getValue }]) => (
                <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {label}
                  </td>
                  {sessionsToCompare.map(session => (
                    <td key={session.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getValue(session).toFixed(2)} {unit}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SessionComparison; 