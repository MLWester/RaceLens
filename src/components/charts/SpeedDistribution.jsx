import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';

const SpeedDistribution = ({ data, width = 600, height = 400 }) => {
  const distributionData = useMemo(() => {
    if (!data || !data.length) return [];

    // Process the data to ensure all speeds are numbers
    const processedData = data.map(point => ({
      Speed: typeof point.Speed === 'number' ? point.Speed : parseFloat(point.Speed) || 0
    }));

    // Create speed bins (0-300 km/h in 10 km/h intervals)
    const bins = Array(30).fill(0);
    const binSize = 10;

    // Count frequency of speeds in each bin
    processedData.forEach(point => {
      const binIndex = Math.floor(point.Speed / binSize);
      if (binIndex >= 0 && binIndex < bins.length) {
        bins[binIndex]++;
      }
    });

    // Calculate the maximum frequency for scaling
    const maxFrequency = Math.max(...bins);

    // Create the scale for the height of bars
    const yScale = scaleLinear()
      .domain([0, maxFrequency])
      .range([0, height - 40]); // Leave space for labels

    // Create the distribution data
    return bins.map((count, index) => ({
      speedRange: `${index * binSize}-${(index + 1) * binSize}`,
      count,
      height: yScale(count),
      x: (width / bins.length) * index,
      y: height - yScale(count) - 40 // Start from bottom, leave space for labels
    }));
  }, [data, width, height]);

  if (!data || !data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No speed data available</p>
      </div>
    );
  }

  return (
    <svg width={width} height={height} className="w-full h-full">
      {/* Draw the bars */}
      {distributionData.map((bin, i) => (
        <g key={i}>
          <rect
            x={bin.x}
            y={bin.y}
            width={(width / distributionData.length) - 1}
            height={bin.height}
            fill="#3B82F6"
            opacity={0.7}
          />
          {/* Only show every 3rd label to prevent overcrowding */}
          {i % 3 === 0 && (
            <text
              x={bin.x}
              y={height - 10}
              className="text-xs fill-gray-600 dark:fill-gray-400"
              transform={`rotate(-45 ${bin.x},${height - 10})`}
            >
              {bin.speedRange}
            </text>
          )}
        </g>
      ))}
      {/* Y-axis label */}
      <text
        x={-height/2}
        y={15}
        transform="rotate(-90)"
        className="text-sm fill-gray-600 dark:fill-gray-400"
        textAnchor="middle"
      >
        Frequency
      </text>
      {/* X-axis label */}
      <text
        x={width/2}
        y={height - 5}
        className="text-sm fill-gray-600 dark:fill-gray-400"
        textAnchor="middle"
      >
        Speed (km/h)
      </text>
    </svg>
  );
};

export default SpeedDistribution; 