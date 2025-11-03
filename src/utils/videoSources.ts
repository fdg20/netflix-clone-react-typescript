/**
 * Video Source Configuration
 * 
 * This file manages video sources for movies. You can:
 * 1. Add video URLs directly here for specific movies
 * 2. Integrate with a video hosting service (AWS S3, CloudFront, Mux, etc.)
 * 3. Use environment variables for video CDN URLs
 * 4. Use Stremio for streaming (if enabled)
 * 
 * Format: Movie ID -> Video URL or configuration
 */

export interface VideoSource {
  url: string;
  type: 'hls' | 'mp4' | 'youtube' | 'dash' | 'webm' | 'stremio';
  quality?: 'auto' | '1080p' | '720p' | '480p' | '360p';
}

/**
 * Stremio Configuration
 * Stremio uses addon-based streaming system
 * Documentation: https://github.com/Stremio/stremio-addon-sdk
 */
export const USE_STREMIO = false; // Enable/disable Stremio integration

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
 * Get Stremio stream URL for a movie/TV show using IMDB ID
 * This is an async function that fetches streams from Stremio addons
 */
export async function getStremioVideoSource(
  imdbId: string | null | undefined,
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number
): Promise<VideoSource | null> {
  if (!USE_STREMIO || !imdbId) {
    return null;
  }

  try {
    const { getStremioStreams, getBestStremioStream, formatImdbId } = await import('./stremio');
    const formattedImdbId = formatImdbId(imdbId);
    const stremioType = mediaType === 'movie' ? 'movie' : 'series';
    
    const streams = await getStremioStreams(stremioType, formattedImdbId, season, episode);
    
    if (streams && streams.length > 0) {
      const bestStream = getBestStremioStream(streams);
      if (bestStream) {
        return {
          url: bestStream.url,
          type: 'stremio',
          quality: 'auto'
        };
      }
    }
  } catch (error) {
    console.error('Error fetching Stremio stream:', error);
  }
  
  return null;
}

/**
 * Get video source for a movie
 * Priority: 1. Custom mapping, 2. Returns null (so TMDB trailers can be used)
 */
export function getVideoSource(movieId: number, mediaType: 'movie' | 'tv' = 'movie'): VideoSource | null {
  // Check if we have a custom source for this movie
  if (MOVIE_VIDEO_SOURCES[movieId]) {
    return MOVIE_VIDEO_SOURCES[movieId];
  }
  
  // Return null to allow TMDB trailers to be used as fallback
  // In production, you would return null or fetch from your video hosting service
  return null;
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

