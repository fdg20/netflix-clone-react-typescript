# Video Hosting Setup Guide

## Overview

The video player now supports multiple video sources including:
- **Vidsrc API** (✅ Integrated) - Free movie/TV streaming via embed API
- **HLS streams** (`.m3u8`) - Best for adaptive streaming
- **MP4 videos** - Direct video files
- **DASH streams** - Alternative adaptive streaming
- **YouTube videos** - Trailers and teasers from TMDB

## How to Add Full Movies

### Option 1: Vidsrc API (✅ Already Integrated)

**Vidsrc is already integrated and enabled by default!** It automatically provides full movies and TV shows using TMDB IDs.

- **Status**: ✅ Active (enabled by default)
- **API Documentation**: https://vidsrcme.ru/api/
- **How it works**: Automatically fetches full movies from Vidsrc when you click play
- **To disable**: Set `USE_VIDSRC = false` in `src/utils/videoSources.ts`

The Vidsrc integration:
- Uses TMDB movie IDs automatically
- Provides full movies, not just trailers
- Supports both movies and TV shows
- Includes built-in player controls
- Works immediately without configuration

### Option 2: Direct Video URLs (Quick Setup)

Edit `src/utils/videoSources.ts` and add your movie video URLs:

```typescript
export const MOVIE_VIDEO_SOURCES: Record<number, VideoSource> = {
  550: { // Movie ID from TMDB
    url: 'https://your-cdn.com/movies/fight-club.m3u8',
    type: 'hls',
    quality: 'auto'
  },
  238: { // The Godfather
    url: 'https://your-cdn.com/movies/godfather.mp4',
    type: 'mp4',
    quality: '1080p'
  },
};
```

### Option 2: Video Hosting Services

#### AWS S3 + CloudFront
1. Upload videos to S3 bucket
2. Enable CloudFront distribution
3. Use CloudFront URL in `MOVIE_VIDEO_SOURCES`

#### Mux
1. Sign up at https://mux.com
2. Upload videos via API or dashboard
3. Get playback URLs and add to `MOVIE_VIDEO_SOURCES`

#### Vimeo
1. Upload videos to Vimeo
2. Get direct video URLs
3. Add to `MOVIE_VIDEO_SOURCES`

#### Cloudflare Stream
1. Upload videos to Cloudflare Stream
2. Get streaming URLs
3. Add to `MOVIE_VIDEO_SOURCES`

### Option 3: Environment Variables

You can also use environment variables for video CDN base URLs:

```typescript
// In videoSources.ts
const VIDEO_CDN_BASE = import.meta.env.VITE_VIDEO_CDN_BASE_URL || '';

export function getVideoSource(movieId: number): VideoSource | null {
  if (VIDEO_CDN_BASE) {
    return {
      url: `${VIDEO_CDN_BASE}/${movieId}.m3u8`,
      type: 'hls',
      quality: 'auto'
    };
  }
  // ... rest of logic
}
```

## Video Format Recommendations

### For Best Quality & Performance:
- **HLS (.m3u8)** - Recommended for production
  - Adaptive bitrate streaming
  - Works on all devices
  - Supports multiple quality levels

### For Simplicity:
- **MP4** - Good for smaller files
  - Direct playback
  - No transcoding needed
  - Works everywhere

## Example Setup

```typescript
// src/utils/videoSources.ts
export const MOVIE_VIDEO_SOURCES: Record<number, VideoSource> = {
  // Popular movies
  550: {
    url: 'https://cdn.example.com/fight-club.m3u8',
    type: 'hls',
    quality: 'auto'
  },
  
  // Add more movies here
  238: {
    url: 'https://cdn.example.com/godfather.m3u8',
    type: 'hls',
    quality: 'auto'
  },
};
```

## Priority Order

The video player uses this priority:
1. **Custom video source** from `MOVIE_VIDEO_SOURCES` (full movies)
2. **TMDB trailers** from YouTube (fallback)
3. **Sample videos** (for demo/testing)

## Legal Note

⚠️ **Important**: Make sure you have proper licensing rights to stream any movies. Only use videos you own or have permission to stream.

