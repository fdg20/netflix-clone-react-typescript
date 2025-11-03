# Stremio Integration Guide

## Overview

Stremio is an addon-based media center that aggregates video content from various sources. This guide explains how to integrate Stremio streaming into your Udongflix project.

## What is Stremio?

Stremio uses an **addon system** where addons provide:
- **Catalogs**: Lists of movies/TV shows
- **Metadata**: Information about content
- **Streams**: Direct streaming URLs
- **Subtitles**: Subtitle files

## Integration Options

### Option 1: Use Stremio Addon Protocol (Recommended)

Stremio addons expose their content via HTTP endpoints following a specific protocol. You can query these endpoints to get streaming URLs.

**Endpoint Format:**
- Movies: `/stream/movie/{imdbId}.json`
- TV Shows: `/stream/series/{imdbId}:{season}:{episode}.json`

**Example:**
```
https://v3-cinemeta.strem.io/stream/movie/tt0111161.json
```

### Option 2: Create Your Own Stremio Addon

You can create a custom Stremio addon that serves your content:

1. **Install Stremio Addon SDK:**
   ```bash
   npm install stremio-addon-sdk
   ```

2. **Create an addon** that provides streaming links
3. **Deploy** the addon to a server
4. **Query** the addon from your frontend

## How to Enable Stremio Integration

### Step 1: Enable Stremio in Configuration

Edit `src/utils/videoSources.ts`:

```typescript
export const USE_STREMIO = true; // Enable Stremio
export const USE_VIDSRC = false; // Disable Vidsrc if you prefer Stremio
```

### Step 2: Add Stremio Addon URLs

Edit `src/utils/stremio.ts` and add working addon URLs:

```typescript
export const STREMIO_ADDONS = [
  'https://v3-cinemeta.strem.io/manifest.json',
  'https://your-custom-addon.com/manifest.json',
  // Add more addon URLs here
];
```

### Step 3: Update WatchPage to Use Stremio

The integration is already set up! The system will:
1. Check if Stremio is enabled
2. Get IMDB ID from TMDB movie data
3. Query Stremio addons for streams
4. Use the best available stream

## Using Stremio Streams

### Automatic Integration

When you click play on a movie:
1. The system fetches movie details from TMDB (which includes IMDB ID)
2. If Stremio is enabled, it queries Stremio addons for streams
3. The best stream is selected and played

### Manual Stream Fetching

You can also fetch streams manually:

```typescript
import { getStremioStreams, getBestStremioStream } from 'src/utils/stremio';

// For a movie
const streams = await getStremioStreams('movie', 'tt0111161');
const bestStream = getBestStremioStream(streams);

// For a TV show episode
const streams = await getStremioStreams('series', 'tt0944947', 1, 1);
```

## Popular Stremio Addons

Here are some popular Stremio addons you can use:

1. **Cinemeta** - Official Stremio addon
   - URL: `https://v3-cinemeta.strem.io/manifest.json`
   - Provides metadata and streams

2. **Torrentio** - Popular community addon (requires setup)
   - Provides torrent-based streaming

3. **Custom Addons** - You can create your own

⚠️ **Note**: Some addons may have legal/ethical considerations. Only use addons that comply with your local laws and terms of service.

## Priority Order

The video player uses this priority:
1. **Stremio streams** (if enabled and IMDB ID available)
2. **Vidsrc embed** (if enabled)
3. **Custom video sources** from `MOVIE_VIDEO_SOURCES`
4. **TMDB trailers** from YouTube (fallback)
5. **Sample videos** (for demo/testing)

## Implementation Details

### Stremio Stream Format

Stremio addons return streams in this format:

```json
{
  "streams": [
    {
      "url": "https://example.com/video.m3u8",
      "title": "1080p",
      "behaviorHints": {
        "notWebReady": false
      }
    }
  ]
}
```

### Stream Selection

The system automatically:
- Filters out streams marked as `notWebReady`
- Prioritizes direct video URLs
- Selects the first available good quality stream

## Troubleshooting

### No Streams Found

1. **Check addon URLs**: Verify addon URLs are correct and accessible
2. **Check IMDB ID**: Ensure the movie has an IMDB ID in TMDB data
3. **Check CORS**: Some addons may block browser requests (you may need a proxy)
4. **Check addon status**: The addon might be down or changed URL

### CORS Issues

If you encounter CORS errors:
1. Create a backend proxy server
2. Use the proxy to fetch Stremio streams
3. Or use a CORS proxy service

### Timeout Issues

If requests timeout:
1. Increase `STREMIO_TIMEOUT` in `src/utils/stremio.ts`
2. Check addon response times
3. Consider caching responses

## Legal Considerations

⚠️ **Important**: 
- Ensure you have proper licensing rights for any content you stream
- Some Stremio addons may provide access to content without proper licensing
- Always comply with local copyright laws
- Only use addons that operate within legal boundaries

## Example: Custom Stremio Addon

If you want to create your own addon:

```javascript
const { addonBuilder } = require('stremio-addon-sdk');

const manifest = {
  id: 'com.udongflix.addon',
  version: '1.0.0',
  name: 'Udongflix Addon',
  resources: ['stream'],
  types: ['movie', 'series'],
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(({ type, id }) => {
  // Return streaming URLs for content
  return Promise.resolve({
    streams: [{
      url: 'https://your-video-server.com/movie.m3u8',
      title: 'HD Stream'
    }]
  });
});

module.exports = builder.getInterface();
```

## Next Steps

1. Enable Stremio in `src/utils/videoSources.ts`
2. Add working addon URLs
3. Test with a movie that has an IMDB ID
4. Deploy and test in production

## Resources

- [Stremio Addon SDK](https://github.com/Stremio/stremio-addon-sdk)
- [Stremio Addon Guide](https://stremio.github.io/stremio-addon-guide/)
- [Stremio Protocol Documentation](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/protocol.md)

