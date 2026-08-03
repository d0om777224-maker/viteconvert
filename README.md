# ViteConvert

A secure, high-performance full-stack web application that converts YouTube videos into downloadable MP3 or MP4 files.

## Features
- **Secure Processing**: Implements helmet security headers, CORS, and strict input validation.
- **Reliable Performance**: Uses a task queue to prevent server overload.
- **Automated Management**: Automatic temporary file cleanup.
- **Modern UI**: Clean, responsive, and dark-themed interface.
- **Container-Ready**: Includes Docker support for easy deployment.

## Requirements
- Node.js (v20+)
- FFmpeg
- yt-dlp

## Installation
```bash
git clone https://github.com/d0om777224-maker/viteconvert
cd viteconvert

# Install backend dependencies
cd server
npm install
npm install helmet express-rate-limit

# Install frontend dependencies
cd ../client
npm install
```

## Running
### Local Development
Start the backend:
```bash
cd server
node index.js
```
Start the frontend:
```bash
cd client
npm run dev
```

### Docker (Optional)
If you have Docker installed, you can launch the entire stack with:
```bash
docker compose up --build
```

## Security & Privacy
This application processes media locally. Input validation and security middleware are implemented to protect against common web vulnerabilities.
