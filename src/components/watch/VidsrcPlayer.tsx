import { Box, BoxProps } from "@mui/material";
import { useRef, useEffect } from "react";

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
 * 
 * Includes click prevention to block unwanted ad interactions
 */
export default function VidsrcPlayer({
  tmdbId,
  mediaType,
  season,
  episode,
  ...boxProps
}: VidsrcPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Prevent unwanted clicks in edge areas where ads might appear
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Block right-click context menu to prevent ad popups
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    container.addEventListener("contextmenu", handleContextMenu);

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...boxProps.sx,
      }}
    >
      {/* Protective overlays to block clicks in edge areas where ads typically appear */}
      {/* Top edge blocker */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8%",
          zIndex: 2,
          pointerEvents: "auto",
          cursor: "default",
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      />
      {/* Bottom edge blocker (where ads often appear) */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "12%",
          zIndex: 2,
          pointerEvents: "auto",
          cursor: "default",
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      />
      {/* Left edge blocker */}
      <Box
        sx={{
          position: "absolute",
          top: "8%",
          left: 0,
          bottom: "12%",
          width: "5%",
          zIndex: 2,
          pointerEvents: "auto",
          cursor: "default",
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      />
      {/* Right edge blocker */}
      <Box
        sx={{
          position: "absolute",
          top: "8%",
          right: 0,
          bottom: "12%",
          width: "5%",
          zIndex: 2,
          pointerEvents: "auto",
          cursor: "default",
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      />
      <Box
        ref={iframeRef}
        component="iframe"
        src={getVidsrcUrl()}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-forms"
        sx={{
          border: "none",
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />
    </Box>
  );
}

