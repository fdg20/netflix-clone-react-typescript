/**
 * Video Source Configuration
 * 
 * This file manages video sources for movies. You can:
 * 1. Use Vidsrc API (integrated) - automatically provides full movies
 * 2. Add video URLs directly here for specific movies
 * 3. Integrate with a video hosting service (AWS S3, CloudFront, Mux, etc.)
 * 4. Use environment variables for video CDN URLs
 * 
 * Format: Movie ID -> Video URL or configuration
 */

export interface VideoSource {
  url: string;
  type: 'hls' | 'mp4' | 'youtube' | 'dash' | 'webm' | 'vidsrc';
  quality?: 'auto' | '1080p' | '720p' | '480p' | '360p';
}

/**
 * Vidsrc API Configuration
 * Vidsrc provides free movie/TV streaming via embed API
 * Documentation: https://vidsrcme.ru/api/
 */
export const USE_VIDSRC = true; // Enable/disable Vidsrc integration
export const VIDSRC_DOMAINS = [
  'vidsrc-embed.ru',
  'vidsrc-embed.su',
  'vidsrcme.su',
  'vsrc.su'
];

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
 * Get Vidsrc embed URL for a movie or TV show
 */
export function getVidsrcUrl(tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number): string {
  const domain = VIDSRC_DOMAINS[0]; // Use primary domain
  const baseUrl = `https://${domain}/embed`;
  
  if (mediaType === 'movie') {
    return `${baseUrl}/movie?tmdb=${tmdbId}&autoplay=1`;
  } else if (mediaType === 'tv') {
    if (season && episode) {
      return `${baseUrl}/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`;
    }
    return `${baseUrl}/tv?tmdb=${tmdbId}&autoplay=1`;
  }
  return `${baseUrl}/movie?tmdb=${tmdbId}&autoplay=1`;
}

/**
 * Get video source for a movie
 * Priority: 1. Vidsrc (if enabled), 2. Custom mapping, 3. Sample videos (for demo)
 */
export function getVideoSource(movieId: number, mediaType: 'movie' | 'tv' = 'movie'): VideoSource | null {
  // Priority 1: Use Vidsrc if enabled
  if (USE_VIDSRC) {
    return {
      url: getVidsrcUrl(movieId, mediaType),
      type: 'vidsrc',
      quality: 'auto'
    };
  }
  
  // Priority 2: Check if we have a custom source for this movie
  if (MOVIE_VIDEO_SOURCES[movieId]) {
    return MOVIE_VIDEO_SOURCES[movieId];
  }
  
  // Priority 3: For demo purposes, return a sample video
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

