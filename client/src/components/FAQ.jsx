import React from 'react';

function FAQ() {
  const questions = [
    {
      q: 'What formats are supported?',
      a: 'We support MP3, WAV, AAC, FLAC, M4A for audio, and MP4, MOV, MKV, AVI for video.'
    },
    {
      q: 'Is there a file limit?',
      a: 'Yes, YouTube videos are limited to a maximum duration of 2 hours.'
    },
    {
      q: 'Are my files safe?',
      a: 'Yes! Files are stored in a temporary directory and are automatically deleted after processing is complete.'
    },
    {
      q: 'Is this free?',
      a: 'Yes, ViteConvert is completely free to use.'
    }
  ];

  return (
    <div className="space-y-4">
      {questions.map((item, index) => (
        <details key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <summary className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
            {item.q}
          </summary>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export default FAQ;
