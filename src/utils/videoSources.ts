/**
 * Video Source Configuration
 * 
 * This file manages video sources for movies. You can:
 * 1. Add video URLs directly here for specific movies
 * 2. Integrate with a video hosting service (AWS S3, CloudFront, Mux, etc.)
 * 3. Use environment variables for video CDN URLs
 * 4. Use Stremio for streaming (if enabled)
 * 5. Use Vidsrc API for free movie/TV streaming (if enabled)
 * 
 * Format: Movie ID -> Video URL or configuration
 */

export interface VideoSource {
  url: string;
  type: 'hls' | 'mp4' | 'youtube' | 'dash' | 'webm' | 'stremio' | 'vidsrc';
  quality?: 'auto' | '1080p' | '720p' | '480p' | '360p';
  // For Vidsrc, we store the embed URL and metadata
  tmdbId?: number;
  imdbId?: string;
  season?: number;
  episode?: number;
}

/**
 * Vidsrc Configuration
 * Vidsrc provides free movie/TV streaming via embed API
 * Documentation: https://vidsrcme.ru/api/
 */
export const USE_VIDSRC = true; // Enable/disable Vidsrc integration (enabled by default)

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
 * Get Vidsrc embed URL for a movie/TV show
 * Vidsrc supports both IMDB and TMDB IDs
 * Documentation: https://vidsrcme.ru/api/
 */
export function getVidsrcVideoSource(
  tmdbId: number,
  imdbId: string | null | undefined,
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number
): VideoSource | null {
  if (!USE_VIDSRC || !tmdbId) {
    return null;
  }

  // Vidsrc domains (will be used by VidsrcPlayer component)
  const domain = 'vidsrc-embed.ru';
  let embedUrl = '';
  
  if (mediaType === 'movie') {
    // Prefer IMDB ID if available, otherwise use TMDB
    if (imdbId) {
      embedUrl = `https://${domain}/embed/movie?imdb=${imdbId}&autoplay=1`;
    } else {
      embedUrl = `https://${domain}/embed/movie?tmdb=${tmdbId}&autoplay=1`;
    }
  } else {
    // TV show
    if (season !== undefined && episode !== undefined) {
      // Episode
      if (imdbId) {
        embedUrl = `https://${domain}/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}&autoplay=1`;
      } else {
        embedUrl = `https://${domain}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`;
      }
    } else {
      // TV show (no specific episode)
      if (imdbId) {
        embedUrl = `https://${domain}/embed/tv?imdb=${imdbId}&autoplay=1`;
      } else {
        embedUrl = `https://${domain}/embed/tv?tmdb=${tmdbId}&autoplay=1`;
      }
    }
  }

  return {
    url: embedUrl,
    type: 'vidsrc',
    quality: 'auto',
    tmdbId,
    imdbId: imdbId || undefined,
    season,
    episode,
  };
}

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
 * Returns custom video source if available, otherwise null
 * Note: Trailers are no longer used as fallback - only full movie sources are allowed
 */
export function getVideoSource(movieId: number, mediaType: 'movie' | 'tv' = 'movie'): VideoSource | null {
  // Check if we have a custom source for this movie
  if (MOVIE_VIDEO_SOURCES[movieId]) {
    return MOVIE_VIDEO_SOURCES[movieId];
  }
  
  // Return null if no custom source is available
  // The watch page will show an error message instead of falling back to trailers
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

