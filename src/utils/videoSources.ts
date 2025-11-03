/**
 * Video Source Configuration
 * 
 * This file manages video sources for movies. You can:
 * 1. Add video URLs directly here for specific movies
 * 2. Integrate with a video hosting service (AWS S3, CloudFront, Mux, etc.)
 * 3. Use environment variables for video CDN URLs
 * 
 * Format: Movie ID -> Video URL or configuration
 */

export interface VideoSource {
  url: string;
  type: 'hls' | 'mp4' | 'youtube' | 'dash' | 'webm';
  quality?: 'auto' | '1080p' | '720p' | '480p' | '360p';
}

// Video source mapping - Add your movie IDs and their video URLs here
// Example format: movieId -> VideoSource
export const MOVIE_VIDEO_SOURCES: Record<number, VideoSource> = {
  // Example: Add your movie sources here
  // 550: {
  //   url: 'https://your-cdn.com/movies/fight-club.m3u8',
  //   type: 'hls',
  //   quality: 'auto'
  // },
};

// Fallback to sample videos for demonstration
const SAMPLE_VIDEOS: VideoSource[] = [
  {
    url: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    type: 'hls',
    quality: 'auto'
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'mp4',
    quality: '1080p'
  },
];

/**
 * Get video source for a movie
 * Priority: 1. Custom mapping, 2. Sample videos (for demo)
 */
export function getVideoSource(movieId: number): VideoSource | null {
  // Check if we have a custom source for this movie
  if (MOVIE_VIDEO_SOURCES[movieId]) {
    return MOVIE_VIDEO_SOURCES[movieId];
  }
  
  // For demo purposes, return a sample video
  // In production, you would return null or fetch from your video hosting service
  const randomSample = SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
  return randomSample;
}

/**
 * Get video source type for Video.js
 */
export function getVideoJsType(source: VideoSource): string {
  switch (source.type) {
    case 'hls':
      return 'application/x-mpegURL';
    case 'mp4':
      return 'video/mp4';
    case 'dash':
      return 'application/dash+xml';
    case 'webm':
      return 'video/webm';
    case 'youtube':
      return 'video/youtube';
    default:
      return 'video/mp4';
  }
}

/**
 * Check if video source is available for a movie
 */
export function hasVideoSource(movieId: number): boolean {
  return !!MOVIE_VIDEO_SOURCES[movieId] || true; // For demo, always return true
}

