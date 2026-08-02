import React, { useRef } from 'react';

function FileUpload({ onUpload, isConverting }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="audio/*,video/*"
      />
      <button
        onClick={() => fileInputRef.current.click()}
        disabled={isConverting}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50"
      >
        Select File
      </button>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Supported formats: Audio and Video files
      </p>
    </div>
  );
}

export default FileUpload;
