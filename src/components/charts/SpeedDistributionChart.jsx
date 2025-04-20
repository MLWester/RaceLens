import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const SpeedDistributionChart = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Process and validate data
  const processedData = data.map(session => ({
    ...session,
    data: Array.isArray(session.data) ? session.data
      .map(point => ({
        time: typeof point.Time === 'number' ? point.Time : parseFloat(point.Time) || 0,
        speed: typeof point.Speed === 'number' ? point.Speed : parseFloat(point.Speed) || 0
      }))
      .filter(point => point.time > 0 && point.speed > 0) : [],
    name: session.name || 'Unknown Session',
    color: session.color || '#3B82F6'
  })).filter(session => session.data.length > 0);

  if (processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No valid data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          dataKey="time" 
          name="Time" 
          unit="s"
          domain={['dataMin', 'dataMax']}
          label={{ value: 'Time (s)', position: 'bottom' }}
        />
        <YAxis 
          type="number" 
          dataKey="speed" 
          name="Speed" 
          unit="km/h"
          domain={['dataMin', 'dataMax']}
          label={{ value: 'Speed (km/h)', angle: -90, position: 'left' }}
        />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          formatter={(value, name, props) => [value.toFixed(2), name]}
        />
        <Legend />
        {processedData.map((session) => (
          <Scatter
            key={session.name}
            name={session.name}
            data={session.data}
            fill={session.color}
            line={{ stroke: session.color, strokeWidth: 2 }}
            lineType="monotone"
            shape="circle"
            isAnimationActive={false}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}; 