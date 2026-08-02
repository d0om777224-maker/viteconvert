import React, { useState, useEffect, useRef } from 'react';
import ProgressBar from './components/ProgressBar';
import StatusMessage from './components/StatusMessage';
import ConverterBox from './components/ConverterBox';
import FAQ from './components/FAQ';
import { startConversion, uploadAndConvert, subscribeToProgress } from './services/api';

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('mp3');
  const [selectedQuality, setSelectedQuality] = useState('best');
  const [jobs, setJobs] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('youtube');
  const [darkMode, setDarkMode] = useState(true);

  const unsubscribeRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(unsubscribeRef.current).forEach(unsub => unsub());
    };
  }, []);

  const handleUrlChange = (event) => {
    setYoutubeUrl(event.target?.value ?? '');
    if (errorMessage) setErrorMessage('');
  };

  const handleFormatChange = (event) => {
    const format = event.target.value;
    setSelectedFormat(format);
    if (format === 'mp3' || format === 'wav') {
      setSelectedQuality('audio');
    } else {
      setSelectedQuality('best');
    }
  };

  const handleQualityChange = (event) => {
    setSelectedQuality(event.target.value);
  };

  const handleDownloadClick = async () => {
    if (!youtubeUrl) {
      setErrorMessage('Please enter a YouTube URL.');
      return;
    }

    try {
      const { jobId } = await startConversion(youtubeUrl, selectedFormat, selectedQuality);
      setJobs(prev => ({ ...prev, [jobId]: { progress: 0, status: 'Queued...', complete: false } }));
      startProgressSubscription(jobId);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleFileUpload = async (file, format) => {
    try {
      const { jobId } = await uploadAndConvert(file, format);
      setJobs(prev => ({ ...prev, [jobId]: { progress: 0, status: 'Queued...', complete: false } }));
      startProgressSubscription(jobId);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const startProgressSubscription = (jobId) => {
    unsubscribeRef.current[jobId] = subscribeToProgress(
      jobId,
      (data) => {
        setJobs(prev => ({ ...prev, [jobId]: data }));
      },
      (err) => {
        setErrorMessage(err);
      }
    );
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">ViteConvert</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <main className="container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="flex space-x-4 mb-6 border-b dark:border-gray-700">
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
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`px-4 py-2 ${activeTab === 'faq' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                >
                  FAQ
                </button>
              </div>

              {activeTab === 'youtube' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">YouTube URL</label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={handleUrlChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format & Quality</label>
                    <div className="grid grid-cols-2 gap-4">
                      <select value={selectedFormat} onChange={handleFormatChange} className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border dark:border-gray-600">
                        <option value="mp3">MP3 (Audio)</option>
                        <option value="wav">WAV (Lossless)</option>
                        <option value="mp4">MP4 (Video)</option>
                        <option value="webm">WebM (Video)</option>
                      </select>
                      {['mp4', 'webm'].includes(selectedFormat) && (
                        <select value={selectedQuality} onChange={handleQualityChange} className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border dark:border-gray-600">
                          <option value="best">Best</option>
                          <option value="1080">1080p</option>
                          <option value="720">720p</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadClick}
                    disabled={!youtubeUrl}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                  >
                    Convert & Download
                  </button>
                </>
              )}

              {activeTab === 'upload' && (
                <ConverterBox onConvert={handleFileUpload} isConverting={false} />
              )}

              {activeTab === 'faq' && (
                <FAQ />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4">Activity Feed</h2>
            {Object.keys(jobs).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-10">No active conversions.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(jobs).map(([id, job]) => (
                  <div key={id} className="p-3 border dark:border-gray-700 rounded-lg">
                    <ProgressBar value={job.progress} isLoading={!job.complete && !job.error} />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{job.status}</p>
                    {job.complete && (
                      <a href={`http://localhost:3001/api/download/${id}`} className="block text-center mt-2 py-1 text-sm bg-green-600 text-white rounded">Download</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
