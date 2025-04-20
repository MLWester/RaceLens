const LapStatsCard = ({ title, value, unit, trend, description }) => {
  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return '↑';
    if (trend < 0) return '↓';
    return '→';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {value}
          {unit && <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">{unit}</span>}
        </p>
        {trend !== undefined && (
          <span className={`ml-2 flex items-baseline text-sm font-semibold ${getTrendColor(trend)}`}>
            {getTrendIcon(trend)} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
};

export default LapStatsCard; 