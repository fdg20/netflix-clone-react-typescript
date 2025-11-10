import { Box, BoxProps } from "@mui/material";
import { useRef, useEffect, useState } from "react";

/**
 * Vidsrc Player Component
 * Embeds Vidsrc video player using their API
 * Documentation: https://vidsrcme.ru/api/
 */
interface VidsrcPlayerProps extends BoxProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  onError?: () => void;
  onLoad?: () => void;
}

export default function VidsrcPlayer({
  tmdbId,
  mediaType,
  season,
  episode,
  onError,
  onLoad,
  ...boxProps
}: VidsrcPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);

  // Vidsrc domains to try (fallback if one fails)
  const VIDSRC_DOMAINS = [
    'vidsrc-embed.ru',
    'vidsrc-embed.su',
    'vidsrcme.su',
    'vsrc.su'
  ];

  // Build Vidsrc embed URL based on media type
  const getVidsrcUrl = (domainIndex: number = 0) => {
    const domain = VIDSRC_DOMAINS[domainIndex] || VIDSRC_DOMAINS[0];
    const baseUrl = `https://${domain}/embed`;
    
    if (mediaType === "movie") {
      return `${baseUrl}/movie?tmdb=${tmdbId}&autoplay=1`;
    } else if (mediaType === "tv" && season && episode) {
      return `${baseUrl}/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`;
    } else {
      return `${baseUrl}/tv?tmdb=${tmdbId}&autoplay=1`;
    }
  };

  // Handle iframe load and error with domain fallback
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let loadTimeout: ReturnType<typeof setTimeout>;
    let errorCheckTimeout: ReturnType<typeof setTimeout>;

    const handleLoad = () => {
      onLoad?.();
      // Check for error messages after iframe loads
      // Note: Cross-origin restrictions may prevent direct access
      errorCheckTimeout = setTimeout(() => {
        // Try to detect error by checking iframe title or other accessible properties
        try {
          // Some Vidsrc domains may show error pages - we can detect via title
          if (iframe.title && (iframe.title.includes('Error') || iframe.title.includes('Not Found'))) {
            handleError();
          }
        } catch (e) {
          // Cross-origin restrictions - expected
        }
      }, 3000);
    };

    const handleError = () => {
      // Try next domain
      if (currentDomainIndex < VIDSRC_DOMAINS.length - 1) {
        setCurrentDomainIndex(currentDomainIndex + 1);
      } else {
        // All domains failed
        onError?.();
      }
    };

    // Timeout fallback - if no load event in 12 seconds, try next domain or error
    loadTimeout = setTimeout(() => {
      if (currentDomainIndex < VIDSRC_DOMAINS.length - 1) {
        setCurrentDomainIndex(currentDomainIndex + 1);
      } else {
        onError?.();
      }
    }, 12000);

    // Listen for postMessage from iframe (if Vidsrc sends error messages)
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Vidsrc domains
      if (VIDSRC_DOMAINS.some(domain => event.origin.includes(domain))) {
        if (event.data && typeof event.data === 'object') {
          if (event.data.type === 'error' || event.data.error || 
              event.data.message?.toLowerCase().includes('unavailable') ||
              event.data.message?.toLowerCase().includes('not found')) {
            handleError();
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('message', handleMessage);
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
      clearTimeout(loadTimeout);
      if (errorCheckTimeout) clearTimeout(errorCheckTimeout);
    };
  }, [currentDomainIndex, onError, onLoad]);


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
      <Box
        ref={iframeRef}
        component="iframe"
        src={getVidsrcUrl(currentDomainIndex)}
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

