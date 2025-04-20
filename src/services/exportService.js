import { useSettings } from '../context/SettingsContext';

const exportService = {
  exportToCSV: (data, metadata = {}, settings = {}) => {
    const { convertSpeed, convertTemperature, convertPressure } = settings;

    // Prepare headers
    const headers = [
      'Time',
      'Speed',
      'Throttle',
      'Brake',
      'TireTempFL',
      'TireTempFR',
      'TireTempRL',
      'TireTempRR',
      'TirePressureFL',
      'TirePressureFR',
      'TirePressureRL',
      'TirePressureRR',
      'X',
      'Y'
    ];

    // Convert data according to user preferences
    const convertedData = data.map(point => ({
      ...point,
      Speed: convertSpeed ? convertSpeed(point.Speed) : point.Speed,
      TireTempFL: convertTemperature ? convertTemperature(point.TireTempFL) : point.TireTempFL,
      TireTempFR: convertTemperature ? convertTemperature(point.TireTempFR) : point.TireTempFR,
      TireTempRL: convertTemperature ? convertTemperature(point.TireTempRL) : point.TireTempRL,
      TireTempRR: convertTemperature ? convertTemperature(point.TireTempRR) : point.TireTempRR,
      TirePressureFL: convertPressure ? convertPressure(point.TirePressureFL) : point.TirePressureFL,
      TirePressureFR: convertPressure ? convertPressure(point.TirePressureFR) : point.TirePressureFR,
      TirePressureRL: convertPressure ? convertPressure(point.TirePressureRL) : point.TirePressureRL,
      TirePressureRR: convertPressure ? convertPressure(point.TirePressureRR) : point.TirePressureRR
    }));

    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    convertedData.forEach(point => {
      const row = headers.map(header => point[header]).join(',');
      csvContent += row + '\n';
    });

    // Add metadata if requested
    if (settings.exportPreferences?.includeMetadata) {
      const metadataContent = Object.entries(metadata)
        .map(([key, value]) => `# ${key}: ${value instanceof Date ? value.toISOString() : value}`)
        .join('\n');
      csvContent = metadataContent + '\n\n' + csvContent;
    }

    return csvContent;
  },

  exportToJSON: (data, metadata = {}, settings = {}) => {
    const { convertSpeed, convertTemperature, convertPressure } = settings;

    // Convert data according to user preferences
    const convertedData = data.map(point => ({
      ...point,
      Speed: convertSpeed ? convertSpeed(point.Speed) : point.Speed,
      TireTempFL: convertTemperature ? convertTemperature(point.TireTempFL) : point.TireTempFL,
      TireTempFR: convertTemperature ? convertTemperature(point.TireTempFR) : point.TireTempFR,
      TireTempRL: convertTemperature ? convertTemperature(point.TireTempRL) : point.TireTempRL,
      TireTempRR: convertTemperature ? convertTemperature(point.TireTempRR) : point.TireTempRR,
      TirePressureFL: convertPressure ? convertPressure(point.TirePressureFL) : point.TirePressureFL,
      TirePressureFR: convertPressure ? convertPressure(point.TirePressureFR) : point.TirePressureFR,
      TirePressureRL: convertPressure ? convertPressure(point.TirePressureRL) : point.TirePressureRL,
      TirePressureRR: convertPressure ? convertPressure(point.TirePressureRR) : point.TirePressureRR
    }));

    // Convert dates in metadata to ISO strings
    const processedMetadata = Object.entries(metadata).reduce((acc, [key, value]) => {
      acc[key] = value instanceof Date ? value.toISOString() : value;
      return acc;
    }, {});

    return JSON.stringify({
      metadata: processedMetadata,
      data: convertedData
    }, null, 2);
  },

  downloadFile: (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportData: (data, metadata = {}, format = 'csv', settings = {}) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `telemetry-data-${timestamp}.${format}`;

    let content, mimeType;
    if (format === 'csv') {
      content = exportService.exportToCSV(data, metadata, settings);
      mimeType = 'text/csv';
    } else if (format === 'json') {
      content = exportService.exportToJSON(data, metadata, settings);
      mimeType = 'application/json';
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }

    exportService.downloadFile(content, filename, mimeType);
  }
};

export default exportService; 