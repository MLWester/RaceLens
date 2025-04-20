import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const TireWearChart = ({ data, width, height }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No wear data available</p>
      </div>
    );
  }

  return (
    <LineChart width={width} height={height} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="timestamp" 
        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
      />
      <YAxis label={{ value: 'Wear (%)', angle: -90, position: 'insideLeft' }} />
      <Tooltip 
        labelFormatter={(value) => new Date(value).toLocaleTimeString()}
        formatter={(value) => [`${value.toFixed(1)}%`, 'Wear']}
      />
      <Legend />
      <Line
        type="monotone"
        dataKey="frontLeft"
        name="Front Left"
        stroke="#3B82F6"
        strokeWidth={2}
        dot={false}
      />
      <Line
        type="monotone"
        dataKey="frontRight"
        name="Front Right"
        stroke="#10B981"
        strokeWidth={2}
        dot={false}
      />
      <Line
        type="monotone"
        dataKey="rearLeft"
        name="Rear Left"
        stroke="#F59E0B"
        strokeWidth={2}
        dot={false}
      />
      <Line
        type="monotone"
        dataKey="rearRight"
        name="Rear Right"
        stroke="#EF4444"
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  );
};

export default TireWearChart; 