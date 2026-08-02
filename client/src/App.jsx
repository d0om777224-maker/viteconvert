import React, { useState, useEffect, useRef } from 'react';
import ProgressBar from './components/ProgressBar';
import StatusMessage from './components/StatusMessage';
import ConverterBox from './components/ConverterBox';
import { startConversion, uploadAndConvert, subscribeToProgress } from './services/api';

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('mp3');
  const [selectedQuality, setSelectedQuality] = useState('best');
  const [isConverting, setIsConverting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadJobId, setDownloadJobId] = useState(null);
  const [activeTab, setActiveTab] = useState('youtube');
  const [darkMode, setDarkMode] = useState(true);

  const unsubscribeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const handleUrlChange = (event) => {
    setYoutubeUrl(event.target?.value ?? '');
    if (errorMessage) setErrorMessage('');
    setDownloadJobId(null);
  };

  const handleFormatChange = (event) => {
    const format = event.target.value;
    setSelectedFormat(format);
    if (format === 'mp3' || format === 'wav') {
      setSelectedQuality('audio');
    } else {
      setSelectedQuality('best');
    }
    setDownloadJobId(null);
  };

  const handleQualityChange = (event) => {
    setSelectedQuality(event.target.value);
    setDownloadJobId(null);
  };

  const handleDownloadClick = async () => {
    if (!youtubeUrl) {
      setErrorMessage('Please enter a YouTube URL.');
      return;
    }

    setIsConverting(true);
    setDownloadProgress(0);
    setStatusMessage('Requesting conversion...');
    setErrorMessage('');
    setDownloadJobId(null);

    try {
      const { jobId } = await startConversion(youtubeUrl, selectedFormat, selectedQuality);
      startProgressSubscription(jobId);
    } catch (err) {
      setErrorMessage(err.message);
      setIsConverting(false);
    }
  };

  const handleFileUpload = async (file, format) => {
    setIsConverting(true);
    setDownloadProgress(0);
    setStatusMessage('Uploading and converting...');
    setErrorMessage('');
    setDownloadJobId(null);

    try {
      const { jobId } = await uploadAndConvert(file, format);
      startProgressSubscription(jobId);
    } catch (err) {
      setErrorMessage(err.message);
      setIsConverting(false);
    }
  };

  const startProgressSubscription = (jobId) => {
    unsubscribeRef.current = subscribeToProgress(
      jobId,
      (data) => {
        setDownloadProgress(data.progress);
        setStatusMessage(data.status);

        if (data.complete) {
          setIsConverting(false);
          setDownloadJobId(data.jobId);
          setStatusMessage('Conversion complete! Ready for download.');
        }

        if (data.error) {
          setErrorMessage(data.error);
          setIsConverting(false);
        }
      },
      (err) => {
        setErrorMessage(err);
        setIsConverting(false);
      }
    );
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 transition-colors duration-300 relative">
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-gray-200">
          ViteConvert
        </h1>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-4 py-2 ${activeTab === 'youtube' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
          >
            YouTube
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 ${activeTab === 'upload' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
          >
            File Upload
          </button>
        </div>

        {activeTab === 'youtube' && (
          <>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Convert YouTube videos to MP3 or MP4 with ease.
            </p>

            <div className="mb-4">
              <label
                htmlFor="youtube-url"
                className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                YouTube URL
              </label>

              <input
                type="url"
                id="youtube-url"
                value={youtubeUrl}
                onChange={handleUrlChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isConverting}
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format
              </label>
              <select
                value={selectedFormat}
                onChange={handleFormatChange}
                disabled={isConverting}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mp3">MP3 (Audio)</option>
                <option value="wav">WAV (Audio - Lossless)</option>
                <option value="mp4">MP4 (Video)</option>
                <option value="webm">WebM (Video)</option>
              </select>
            </div>
            
            {['mp4', 'webm'].includes(selectedFormat) && (
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Quality</label>
                <select
                  value={selectedQuality}
                  onChange={handleQualityChange}
                  disabled={isConverting}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                >
                  <option value="best">Best Quality</option>
                  <option value="1080">1080p</option>
                  <option value="720">720p</option>
                  <option value="480">480p</option>
                </select>
              </div>
            )}
          </>
        )}

        {activeTab === 'upload' && (
          <ConverterBox onConvert={handleFileUpload} isConverting={isConverting} />
        )}

        {errorMessage && (
          <StatusMessage message={errorMessage} type="error" />
        )}

        {downloadJobId ? (

          <a
            href={`http://localhost:3001/api/download/${downloadJobId}`}
            className="w-full flex justify-center items-center py-3 px-6 mt-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-lg transition duration-200"
          >
            Download File
          </a>

        ) : activeTab === 'youtube' && (

          <button
            onClick={handleDownloadClick}
            disabled={isConverting || !youtubeUrl}
            className="w-full flex justify-center items-center py-3 px-6 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {isConverting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>

                Processing...
              </>
            ) : (
              'Convert'
            )}

          </button>

        )}

        {(isConverting || downloadJobId) && (
          <>
            <ProgressBar
              value={downloadProgress}
              isLoading={isConverting}
            />

            {statusMessage && (
              <StatusMessage
                message={statusMessage}
                type="info"
              />
            )}
          </>
        )}

      </div>
    </div>
  </div>
  );
}

export default App;
