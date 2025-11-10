import { CustomGenre } from "src/types/Genre";

export const API_ENDPOINT_URL = import.meta.env.VITE_APP_API_ENDPOINT_URL || "https://api.themoviedb.org/3";
export const TMDB_V3_API_KEY = (import.meta.env.VITE_APP_TMDB_V3_API_KEY || "").trim();
export const OMDB_API_KEY = (import.meta.env.VITE_APP_OMDB_API_KEY || "87a82b55").trim();
export const OMDB_API_URL = "https://www.omdbapi.com";

export const MAIN_PATH = {
  root: "",
  browse: "browse",
  genreExplore: "genre",
  watch: "watch",
};

export const ARROW_MAX_WIDTH = 60;
export const COMMON_TITLES: CustomGenre[] = [
  { name: "Popular", apiString: "popular" },
  { name: "Top Rated", apiString: "top_rated" },
  { name: "Now Playing", apiString: "now_playing" },
  { name: "Upcoming", apiString: "upcoming" },
];

export const YOUTUBE_URL = "https://www.youtube.com/watch?v=";
export const APP_BAR_HEIGHT = 70;

export const INITIAL_DETAIL_STATE = {
  id: undefined,
  mediaType: undefined,
  mediaDetail: undefined,
};
