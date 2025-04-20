import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelemetry } from '../context/TelemetryContext';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// Import CSV as a URL
const testDataUrl = new URL('../assets/test_telemetry.csv', import.meta.url).href;

const HomePage = () => {
  const navigate = useNavigate();
  const { telemetryData, setTelemetryData, setSessionMetadata } = useTelemetry();
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (file) => {
    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.trim().split('\n');
        
        // Extract metadata from comments
        const metadata = {
          filename: file.name,
          uploadDate: new Date(),
          sessionName: file.name.replace('.csv', ''),
          trackName: 'Unknown Track',
          carName: 'Unknown Car'
        };
        
        lines.forEach(line => {
          if (line.startsWith('# Track:')) {
            metadata.trackName = line.replace('# Track:', '').trim();
          } else if (line.startsWith('# Car:')) {
            metadata.carName = line.replace('# Car:', '').trim();
          }
        });

        // Find the header line (first non-comment line)
        const headerIndex = lines.findIndex(line => !line.startsWith('#'));
        if (headerIndex === -1) {
          throw new Error('No header line found in CSV file');
        }

        const headers = lines[headerIndex].split(',').map(h => h.trim());
        
        // Process only data lines (non-comment lines after header)
        const telemetry = lines.slice(headerIndex + 1)
          .filter(line => !line.startsWith('#') && line.trim().length > 0)
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
              const value = values[index];
              // Ensure numeric values for required fields
              if (['Time', 'Speed', 'Throttle', 'Brake', 'X', 'Y'].includes(header)) {
                row[header] = parseFloat(value) || 0;
              } else {
                row[header] = value;
              }
            });
            return row;
          });

        // Group data into laps based on X,Y coordinates
        const laps = {};
        let currentLap = 1;
        let lastX = null;
        let lastY = null;
        let lastTime = null;

        telemetry.forEach(point => {
          // Detect lap completion when position returns close to start (0,0)
          // and ensure we've moved away from start first (to avoid false triggers)
          if (lastX !== null && lastY !== null &&
              Math.abs(point.X) < 5 && Math.abs(point.Y) < 5 &&
              (Math.abs(lastX) > 20 || Math.abs(lastY) > 20) &&
              (!lastTime || point.Time - lastTime > 5)) { // Ensure minimum lap time
            currentLap++;
            lastTime = point.Time;
          }

          if (!laps[currentLap]) {
            laps[currentLap] = [];
          }
          laps[currentLap].push(point);

          lastX = point.X;
          lastY = point.Y;
        });

        // Calculate lap statistics
        const lapStats = Object.entries(laps).map(([lapNumber, lapData]) => {
          const speeds = lapData.map(d => d.Speed);
          const throttle = lapData.map(d => d.Throttle);
          const brake = lapData.map(d => d.Brake);
          
          return {
            lapNumber: parseInt(lapNumber),
            avgSpeed: speeds.reduce((a, b) => a + b, 0) / speeds.length,
            maxSpeed: Math.max(...speeds),
            avgThrottle: throttle.reduce((a, b) => a + b, 0) / throttle.length,
            avgBrake: brake.reduce((a, b) => a + b, 0) / brake.length,
            lapTime: lapData[lapData.length - 1].Time - lapData[0].Time,
          };
        });

        // Set the processed data
        setTelemetryData({
          rawData: telemetry,
          laps: laps,
          lapStats: lapStats,
          metadata: metadata
        });
        
        setSessionMetadata(metadata);
        navigate('/dashboard');
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTestData = async () => {
    try {
      const response = await fetch(testDataUrl);
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'test_telemetry.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading test data:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            RaceLens Telemetry Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Upload your telemetry data to get started
          </p>
        </div>

        <div className="flex flex-col items-center space-y-8">
          <FileUpload onFileSelect={handleFileSelect} />
          
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">or</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Try out the application with our sample telemetry data. This includes 3 laps of realistic racing data with speed, throttle, brake, and tire information.
            </p>
            <button
              onClick={handleDownloadTestData}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Download Sample Data
            </button>
          </div>
        </div>

        {telemetryData && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 