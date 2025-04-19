import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useTelemetry } from '../context/TelemetryContext';

const UploadPage = () => {
  const navigate = useNavigate();
  const { setTelemetryData, setSessionMetadata } = useTelemetry();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    await handleFiles(files);
  };

  const handleFileInput = async (e) => {
    const files = e.target.files;
    await handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      // TODO: Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setTelemetryData(data.telemetry);
      setSessionMetadata(data.metadata);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Upload Telemetry Data
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Drag and drop your iRacing telemetry CSV file or click to browse
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-12 text-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
          accept=".csv"
        />
        <div className="space-y-4">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Click to upload</span> or drag and drop
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">CSV files only</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadPage; 