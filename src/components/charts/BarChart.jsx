import { useMemo } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { max } from 'd3-array';

const BarChart = ({ data, width = '100%', height = '100%', margin = { top: 20, right: 20, bottom: 30, left: 40 } }) => {
  const { bars, xScale, yScale } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return { bars: [], xScale: null, yScale: null };

    // Convert percentage width/height to numbers
    const containerWidth = typeof width === 'string' ? 600 : width;
    const containerHeight = typeof height === 'string' ? 400 : height;
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = containerHeight - margin.top - margin.bottom;

    // Ensure all values are numbers
    const processedData = data.map(d => ({
      ...d,
      value: typeof d.value === 'number' ? d.value : parseFloat(d.value) || 0,
      label: d.label || 'Unknown'
    }));

    const xScale = scaleBand()
      .domain(processedData.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = scaleLinear()
      .domain([0, max(processedData, d => d.value) * 1.1]) // Add 10% padding to top
      .range([innerHeight, 0]);

    const bars = processedData.map((d, i) => ({
      x: xScale(d.label),
      y: yScale(d.value),
      width: xScale.bandwidth(),
      height: innerHeight - yScale(d.value),
      value: d.value,
      label: d.label,
      color: d.color || '#3B82F6'
    }));

    return { bars, xScale, yScale };
  }, [data, width, height, margin]);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Convert percentage dimensions to viewport units
  const finalWidth = typeof width === 'string' ? '100%' : width;
  const finalHeight = typeof height === 'string' ? '100%' : height;

  return (
    <div style={{ width: finalWidth, height: finalHeight }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${finalWidth} ${finalHeight}`} preserveAspectRatio="xMidYMid meet">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Bars */}
          {bars.map((bar, i) => (
            <g key={i}>
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={bar.color}
                rx={4}
              />
              <text
                x={bar.x + bar.width / 2}
                y={bar.y - 5}
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-gray-300"
              >
                {bar.value.toFixed(1)}
              </text>
            </g>
          ))}

          {/* X-axis */}
          <g transform={`translate(0,${height - margin.top - margin.bottom})`}>
            {data.map((d, i) => (
              <text
                key={i}
                x={xScale(d.label) + xScale.bandwidth() / 2}
                y={20}
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-gray-300"
              >
                {d.label}
              </text>
            ))}
          </g>

          {/* Y-axis */}
          <g>
            {yScale && yScale.ticks(5).map((tick, i) => (
              <g key={i} transform={`translate(0,${yScale(tick)})`}>
                <line
                  x1={-5}
                  x2={0}
                  stroke="currentColor"
                  className="text-gray-300 dark:text-gray-600"
                />
                <text
                  x={-10}
                  y={0}
                  dy="0.32em"
                  textAnchor="end"
                  className="text-xs fill-gray-600 dark:fill-gray-300"
                >
                  {tick}
                </text>
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
};

export default BarChart; 