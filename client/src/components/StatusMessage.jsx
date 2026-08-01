import React from 'react';

function StatusMessage({ message, type = 'info' }) {
  if (!message) return null;

  const baseClasses = 'p-3 rounded-lg text-sm font-medium';
  
  const typeClasses = {
    info: 'bg-blue-900/30 text-blue-300 border border-blue-800',
    success: 'bg-green-900/30 text-green-300 border border-green-800',
    error: 'bg-red-900/30 text-red-300 border border-red-800',
    warning: 'bg-yellow-900/30 text-yellow-300 border border-yellow-800',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      {message}
    </div>
  );
}

export default StatusMessage;