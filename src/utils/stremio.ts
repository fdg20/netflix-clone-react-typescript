/**
 * Stremio API Integration
 * 
 * Stremio uses an addon-based system for streaming content.
 * This module provides functions to fetch streaming links from Stremio addons.
 * 
 * Documentation: https://github.com/Stremio/stremio-addon-sdk
 * Addon Protocol: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/protocol.md
 */

export interface StremioStream {
  url: string;
  title: string;
  name?: string;
  behaviorHints?: {
    bingeGroup?: string;
    notWebReady?: boolean;
  };
  subtitles?: Array<{
    url: string;
    lang: string;
    id?: string;
  }>;
}

export interface StremioStreamResponse {
  streams: StremioStream[];
}

/**
 * Popular Stremio Addon URLs (these provide streaming links)
 * You can add your own addon URLs here
 */
export const STREMIO_ADDONS = [
  // Official Stremio addons
  'https://v3-cinemeta.strem.io/manifest.json',
  // Community addons (you may need to find working ones)
  // Add more addon URLs here
];

/**
 * Stremio Configuration
 */
export const USE_STREMIO = false; // Set to true to enable Stremio
export const STREMIO_TIMEOUT = 10000; // 10 seconds timeout for requests

/**
 * Get Stremio stream URL for a movie or TV show
 * 
 * @param type - 'movie' or 'series'
 * @param imdbId - IMDB ID (e.g., 'tt0111161')
 * @param season - Season number (for TV shows)
 * @param episode - Episode number (for TV shows)
 * @returns Promise with stream URLs or null
 */
export async function getStremioStreams(
  type: 'movie' | 'series',
  imdbId: string,
  season?: number,
  episode?: number
): Promise<StremioStream[] | null> {
  if (!USE_STREMIO) {
    return null;
  }

  try {
    // Build the stream resource URL
    let resourceUrl = '';
    
    if (type === 'movie') {
      resourceUrl = `/stream/movie/${imdbId}.json`;
    } else if (type === 'series' && season !== undefined && episode !== undefined) {
      resourceUrl = `/stream/series/${imdbId}:${season}:${episode}.json`;
    } else {
      return null;
    }

    // Try each addon until we get a response
    for (const addonUrl of STREMIO_ADDONS) {
      try {
        const addonBase = addonUrl.replace('/manifest.json', '');
        const streamUrl = `${addonBase}${resourceUrl}`;
        
        // Create timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), STREMIO_TIMEOUT);
        
        const response = await fetch(streamUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const data: StremioStreamResponse = await response.json();
          if (data.streams && data.streams.length > 0) {
            return data.streams;
          }
        }
      } catch (error) {
        console.warn(`Stremio addon ${addonUrl} failed:`, error);
        continue; // Try next addon
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching Stremio streams:', error);
    return null;
  }
}

/**
 * Get best quality stream from Stremio streams
 * Prioritizes direct video URLs over external services
 */
export function getBestStremioStream(streams: StremioStream[]): StremioStream | null {
  if (!streams || streams.length === 0) {
    return null;
  }

  // Filter out streams that need special handling
  const webReadyStreams = streams.filter(
    stream => !stream.behaviorHints?.notWebReady
  );

  if (webReadyStreams.length > 0) {
    // Prioritize streams with better titles/names
    return webReadyStreams[0];
  }

  return streams[0];
}

/**
 * Convert IMDB ID to Stremio format
 * Stremio uses IMDB IDs in format: tt1234567
 */
export function formatImdbId(imdbId: string | number): string {
  const id = String(imdbId);
  return id.startsWith('tt') ? id : `tt${id}`;
}

/**
 * Get Stremio stream URL for TMDB movie ID
 * Note: This requires converting TMDB ID to IMDB ID first
 */
export async function getStremioStreamForTmdb(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number
): Promise<string | null> {
  // First, we need to get the IMDB ID from TMDB
  // This would typically be done via a TMDB API call
  // For now, this is a placeholder - you'll need to implement TMDB -> IMDB conversion
  
  // Example: Fetch IMDB ID from TMDB API
  // const tmdbResponse = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=YOUR_KEY`);
  // const tmdbData = await tmdbResponse.json();
  // const imdbId = tmdbData.imdb_id;
  
  // Then use the IMDB ID to get Stremio streams
  // const streams = await getStremioStreams(mediaType === 'movie' ? 'movie' : 'series', imdbId, season, episode);
  
  // For now, return null as this requires additional setup
  return null;
}

