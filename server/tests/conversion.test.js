const request = require('supertest');
const app = require('../index');
const youtubeService = require('../services/youtube');
const ffmpegService = require('../services/ffmpeg');

// Mock the services to avoid real file operations during tests
jest.mock('../services/youtube');
jest.mock('../services/ffmpeg');

describe('POST /api/convert', () => {
  beforeEach(() => {
    youtubeService.downloadVideo.mockResolvedValue('fake/path/video.mp4');
    ffmpegService.convertToFormat.mockResolvedValue('fake/path/converted.mp4');
  });

  it('should reject invalid URLs', async () => {
    const res = await request(app)
      .post('/api/convert')
      .set('X-API-KEY', 'dev-local-key')
      .send({ url: 'not-a-valid-url' });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should accept valid YouTube URLs', async () => {
    const res = await request(app)
      .post('/api/convert')
      .set('X-API-KEY', 'dev-local-key')
      .send({ url: 'https://www.youtube.com/watch?v=validId' });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('jobId');
  });
});
