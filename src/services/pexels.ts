import Config from 'react-native-config';

const API_KEY = Config.PEXELS_API_KEY || '';
const BASE_URL = 'https://api.pexels.com/v1';

// In-memory cache to avoid repeated API calls
const imageCache = new Map<string, string>();

async function fetchPexelsImage(query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/search?query=${encodeURIComponent(
        query + ' food'
      )}&per_page=3&orientation=landscape`,
      {
        headers: { Authorization: API_KEY },
      }
    );

    if (!response.ok) {
      console.log('[Pexels] API error:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const url = data.photos[0].src.medium;
      console.log('[Pexels] Found image for:', query);
      return url;
    }

    return null;
  } catch (error) {
    console.error('[Pexels] Search failed:', error);
    return null;
  }
}

export async function searchFoodImage(query: string, keywords?: string[]): Promise<string | null> {
  if (!API_KEY) {
    console.log('[Pexels] No API key configured');
    return null;
  }

  // Check cache first
  const cacheKey = query.toLowerCase().trim();
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // Try main search term first
  let url = await fetchPexelsImage(query);

  // If no result, try each keyword
  if (!url && keywords && keywords.length > 0) {
    for (const keyword of keywords) {
      console.log('[Pexels] Trying keyword fallback:', keyword);
      url = await fetchPexelsImage(keyword);
      if (url) break;
    }
  }

  if (url) {
    imageCache.set(cacheKey, url);
    return url;
  }

  console.log('[Pexels] No photos found for:', query, keywords);
  return null;
}
