import Config from 'react-native-config';

const API_KEY = Config.PEXELS_API_KEY || '';
const BASE_URL = 'https://api.pexels.com/v1';

// In-memory cache to avoid repeated API calls
const imageCache = new Map<string, string>();

export async function searchFoodImage(query: string): Promise<string | null> {
  if (!API_KEY) {
    console.log('[Pexels] No API key configured');
    return null;
  }

  // Check cache first
  const cacheKey = query.toLowerCase().trim();
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search?query=${encodeURIComponent(
        query + ' dish'
      )}&per_page=1&orientation=landscape`,
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
      imageCache.set(cacheKey, url);
      return url;
    }

    console.log('[Pexels] No photos found for:', query);
    return null;
  } catch (error) {
    console.error('Pexels search failed:', error);
    return null;
  }
}
