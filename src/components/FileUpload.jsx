import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

const FileUpload = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = useCallback((file) => {
    console.log('File received:', file);
    
    // Check if file is CSV (either by extension or type)
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a CSV file');
      return;
    }

    setError(null);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    console.log('File dropped:', file);
    
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
    
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center space-y-2">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Drag and drop your telemetry file here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to browse
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Only CSV files are supported
            </p>
          </div>
        </label>
      </div>
      {error && (
        <div className="mt-4 text-center text-red-500 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
};

export default FileUpload; 