import { useMemo } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineChart = ({ data, lines, xDataKey, height = 400, showGrid = true }) => {
  const processedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map(point => {
      const processed = { ...point };
      // Ensure all numeric values are properly parsed
      Object.keys(processed).forEach(key => {
        if (typeof processed[key] === 'string') {
          const parsed = parseFloat(processed[key]);
          if (!isNaN(parsed)) {
            processed[key] = parsed;
          }
        }
      });
      return processed;
    });
  }, [data]);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={processedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey={xDataKey}
            type="number"
            scale="linear"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
              name={line.name || line.dataKey}
              isAnimationActive={false}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart; 