import React from 'react';

function ProgressBar({ value, isLoading = false }) {
  const isIndeterminate = isLoading && value === 0 && value !== 100;
  
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden mb-4">
      {isIndeterminate ? (
        <div className="h-2 bg-blue-500 animate-pulse" />
      ) : (
        <div className="h-2 bg-green-500 transition-all duration-500" style={{ width: `${value}%` }} />
      )}
    </div>
  );
}

export default ProgressBar;