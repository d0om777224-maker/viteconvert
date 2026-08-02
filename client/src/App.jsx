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
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const { jobId } = await startConversion(youtubeUrl, selectedFormat, selectedQuality);
      setJobs(prev => ({ ...prev, [jobId]: { progress: 0, status: 'Queued...', complete: false } }));
      startProgressSubscription(jobId);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
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
                    disabled={!youtubeUrl || loading}
                    className={`w-full py-3 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold rounded-lg transition`}
                  >
                    {loading ? 'Processing...' : 'Convert & Download'}
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
                {Object.entries(jobs).map(([id, job]) => {
                  const getStatusColor = (status) => {
                    if (status.includes('Error')) return 'text-red-500 bg-red-100 dark:bg-red-900/20';
                    if (status.includes('Complete')) return 'text-green-500 bg-green-100 dark:bg-green-900/20';
                    return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
                  };

                  return (
                    <div key={id} className="p-4 border dark:border-gray-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      <ProgressBar value={job.progress} isLoading={!job.complete && !job.error} />
                      {job.complete && (
                        <a href={`/api/download/${id}`} className="block text-center mt-3 py-2 text-sm font-bold bg-green-600 hover:bg-green-700 text-white rounded transition shadow-sm">
                          Download File
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
