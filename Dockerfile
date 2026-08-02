# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Stage 2: Backend
FROM node:20-slim
# Install dependencies
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip nodejs \
    && pip3 install yt-dlp --upgrade --break-system-packages \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/ .

# Copy built frontend into the server's public folder
COPY --from=frontend-build /app/client/dist ./public
RUN ls -la /app/public 

EXPOSE 3001
CMD ["node", "index.js"]
