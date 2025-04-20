import { useTelemetry } from '../context/TelemetryContext';
import { useSettings } from '../context/SettingsContext';
import TireTemperatureChart from './charts/TireTemperatureChart';
import TirePressureChart from './charts/TirePressureChart';
import TireWearChart from './charts/TireWearChart';

const TireDataDisplay = ({ containerWidth = 800 }) => {
  const { telemetryData } = useTelemetry();
  const { convertTemperature, convertPressure } = useSettings();

  // Calculate chart dimensions based on container width
  const getChartDimensions = () => {
    const isMobile = containerWidth < 768;
    const chartWidth = isMobile ? containerWidth : (containerWidth - 24) / 2; // 24px for gap
    const chartHeight = Math.min(300, chartWidth * 0.6);
    return { width: chartWidth, height: chartHeight };
  };

  const prepareTireData = () => {
    // Get the raw data from the selected lap
    const lapData = telemetryData?.laps?.[1] || [];
    if (!Array.isArray(lapData) || lapData.length === 0) {
      return {
        temperatures: [],
        pressures: [],
        wear: []
      };
    }

    return {
      temperatures: lapData.map(point => ({
        timestamp: point.Time,
        frontLeft: convertTemperature(point.TireTempFL),
        frontRight: convertTemperature(point.TireTempFR),
        rearLeft: convertTemperature(point.TireTempRL),
        rearRight: convertTemperature(point.TireTempRR)
      })),
      pressures: lapData.map(point => ({
        timestamp: point.Time,
        frontLeft: convertPressure(point.TirePressureFL),
        frontRight: convertPressure(point.TirePressureFR),
        rearLeft: convertPressure(point.TirePressureRL),
        rearRight: convertPressure(point.TirePressureRR)
      })),
      wear: lapData.map(point => ({
        timestamp: point.Time,
        frontLeft: point.TireWearFL || 100,
        frontRight: point.TireWearFR || 100,
        rearLeft: point.TireWearRL || 100,
        rearRight: point.TireWearRR || 100
      }))
    };
  };

  const tireData = prepareTireData();
  const { width, height } = getChartDimensions();

  if (!telemetryData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No telemetry data available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
            Tire Temperatures
          </h3>
          <div className="w-full">
            <TireTemperatureChart
              data={tireData.temperatures}
              width={width}
              height={height}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
            Tire Pressures
          </h3>
          <div className="w-full">
            <TirePressureChart
              data={tireData.pressures}
              width={width}
              height={height}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
          Tire Wear
        </h3>
        <div className="w-full">
          <TireWearChart
            data={tireData.wear}
            width={containerWidth - 32} // Account for padding
            height={height}
          />
        </div>
      </div>
    </div>
  );
};

export default TireDataDisplay; 