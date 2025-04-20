import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelemetry } from '../context/TelemetryContext';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import { uploadTelemetryFile, validateTelemetryData } from '../services/api';

const UploadPage = () => {
  const navigate = useNavigate();
  const { setTelemetryData, setSessionMetadata, setIsLoading, setError } = useTelemetry();
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = async (file) => {
    try {
      setIsLoading(true);
      setUploadError(null);
      setError(null);

      console.log('Processing file:', file);
      const data = await uploadTelemetryFile(file);
      console.log('Received data:', data);

      // Validate the received data
      validateTelemetryData(data.telemetry);
      
      // Update context with parsed data
      setTelemetryData(data.telemetry);
      setSessionMetadata(data.metadata);
      
      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload and process file. Please try again.');
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Upload Telemetry Data
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Drag and drop your iRacing telemetry CSV file or click to browse
          </p>
        </div>

        <FileUpload onFileSelect={handleFileUpload} />

        {uploadError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            {uploadError}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage; 