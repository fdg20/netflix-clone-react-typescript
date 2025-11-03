import { Box, BoxProps } from "@mui/material";

interface VidsrcPlayerProps extends BoxProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
}

/**
 * Vidsrc Player Component
 * Embeds Vidsrc video player using their API
 * Documentation: https://vidsrcme.ru/api/
 */
export default function VidsrcPlayer({
  tmdbId,
  mediaType,
  season,
  episode,
  ...boxProps
}: VidsrcPlayerProps) {
  // Build Vidsrc embed URL based on media type
  const getVidsrcUrl = () => {
    const baseUrl = "https://vidsrc-embed.ru/embed";
    
    if (mediaType === "movie") {
      return `${baseUrl}/movie?tmdb=${tmdbId}&autoplay=1`;
    } else if (mediaType === "tv" && season && episode) {
      return `${baseUrl}/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`;
    } else {
      return `${baseUrl}/tv?tmdb=${tmdbId}&autoplay=1`;
    }
  };

  return (
    <Box
      component="iframe"
      src={getVidsrcUrl()}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      sx={{
        border: "none",
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        ...boxProps.sx,
      }}
      {...boxProps}
    />
  );
}

