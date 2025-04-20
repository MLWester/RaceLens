import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const uploadTelemetryFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // For local development, directly parse the file instead of uploading
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const telemetry = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const row = {};
          headers.forEach((header, index) => {
            const value = values[index];
            if (value === undefined || value === '') {
              row[header] = null;
            } else if (!isNaN(value)) {
              row[header] = parseFloat(value);
            } else {
              row[header] = value;
            }
          });
          return row;
        });

        resolve({
          telemetry,
          metadata: {
            filename: file.name,
            uploadDate: new Date(),
            trackName: 'Sample Track',
            carName: 'Sample Car'
          }
        });
      };
      reader.readAsText(file);
    });
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to upload file');
  }
};

export const validateTelemetryData = (data) => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid telemetry data format');
  }
  
  if (data.length === 0) {
    throw new Error('No telemetry data found');
  }

  // Validate required fields
  const requiredFields = ['Time', 'Speed', 'Throttle', 'Brake'];
  const firstRow = data[0];
  
  for (const field of requiredFields) {
    if (!(field in firstRow)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return true;
};

export const getSessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/sessions`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch sessions');
  }
};

export const getSession = async (sessionId) => {
  try {
    const response = await axios.get(`${API_URL}/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch session');
  }
}; 