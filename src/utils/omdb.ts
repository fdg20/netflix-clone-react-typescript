/**
 * OMDB API Integration
 * 
 * OMDB (Open Movie Database) provides enhanced movie metadata including:
 * - IMDB ratings
 * - Rotten Tomatoes scores
 * - Metacritic scores
 * - Additional metadata
 * 
 * Documentation: http://www.omdbapi.com/
 */

import { OMDB_API_KEY, OMDB_API_URL } from "src/constant";

export interface OMDBMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

/**
 * Fetch movie data from OMDB API using IMDB ID
 * @param imdbId IMDB ID (e.g., "tt3896198")
 * @returns Promise with OMDB movie data or null if not found
 */
export async function getOMDBMovieByImdbId(imdbId: string): Promise<OMDBMovie | null> {
  if (!imdbId) {
    return null;
  }

  // Format IMDB ID (ensure it starts with "tt")
  const formattedImdbId = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;

  try {
    const response = await fetch(
      `${OMDB_API_URL}/?i=${formattedImdbId}&apikey=${OMDB_API_KEY}`
    );

    if (!response.ok) {
      console.error(`OMDB API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: OMDBMovie = await response.json();

    // Check if response is valid
    if (data.Response === 'False') {
      console.warn(`OMDB API: ${data.Error || 'Movie not found'}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching OMDB data:', error);
    return null;
  }
}

/**
 * Search for a movie by title
 * @param title Movie title
 * @param year Optional year to narrow search
 * @returns Promise with OMDB movie data or null if not found
 */
export async function getOMDBMovieByTitle(
  title: string,
  year?: string
): Promise<OMDBMovie | null> {
  if (!title) {
    return null;
  }

  try {
    const yearParam = year ? `&y=${year}` : '';
    const response = await fetch(
      `${OMDB_API_URL}/?t=${encodeURIComponent(title)}${yearParam}&apikey=${OMDB_API_KEY}`
    );

    if (!response.ok) {
      console.error(`OMDB API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: OMDBMovie = await response.json();

    // Check if response is valid
    if (data.Response === 'False') {
      console.warn(`OMDB API: ${data.Error || 'Movie not found'}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching OMDB data:', error);
    return null;
  }
}

