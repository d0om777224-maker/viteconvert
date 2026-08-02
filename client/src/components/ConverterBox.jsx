import React, { useRef, useState } from 'react';

function ConverterBox({ onConvert, isConverting }) {
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState('mp3');
  const fileInputRef = useRef(null);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
      
      {/* Selection flow */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex flex-col items-center">
          <label className="text-sm text-gray-500 mb-2">Input</label>
          <div className="w-24 h-12 flex items-center justify-center border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-800 text-gray-400">
            Auto
          </div>
        </div>
        
        <div className="text-2xl text-gray-400 mt-6">→</div>
        
        <div className="flex flex-col items-center">
          <label className="text-sm text-gray-500 mb-2">Output</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-24 h-12 text-center rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          >
            <option value="mp3">MP3</option>
            <option value="wav">WAV</option>
            <option value="mp4">MP4</option>
            <option value="mov">MOV</option>
            <option value="mkv">MKV</option>
            <option value="avi">AVI</option>
            <option value="aac">AAC</option>
            <option value="flac">FLAC</option>
            <option value="m4a">M4A</option>
          </select>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="w-full">
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={isConverting}
          className="w-full py-3 mb-4 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
        >
          {file ? file.name : 'Click to select file'}
        </button>
        <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" />
      </div>

      <button
        onClick={() => onConvert(file, outputFormat)}
        disabled={!file || isConverting}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50"
      >
        Convert
      </button>
    </div>
  );
}

export default ConverterBox;
