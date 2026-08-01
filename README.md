# ViteConvert

A local video/audio converter powered by yt-dlp and FFmpeg.

## Features

- Convert YouTube videos to MP4
- Extract audio as MP3
- Quality selection
- Real-time conversion progress
- Automatic temporary file cleanup
- Local processing (files stay on your computer)

## Requirements

Before running, install:

- Node.js
- FFmpeg
- yt-dlp

## Installation

Clone the repository:

git clone <your-repo-url>

Enter the project:

cd viteconvert

Install dependencies:

cd server
npm install

cd ../client
npm install

## Running

Start backend:

cd server
node index.js

Start frontend:

cd client
npm run dev

Open:

http://localhost:5173
- Or whatever localhost the frontend terminal shows

## Notes

This project runs locally. Downloaded files are processed on your own machine and are not uploaded anywhere.

Users are responsible for ensuring they have permission to download and convert content.
