import axios from 'axios';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001';

// Function to resolve shortened URLs using our backend API
const resolveShortUrl = async (shortUrl: string): Promise<string> => {
  console.log('🔗 Resolving shortened URL via backend:', shortUrl);
  
  try {
    // Call our backend API to resolve the URL
    const backendUrl = `${API_BASE.replace(/\/$/, '')}/api/resolve-url`;
    
    console.log('🌐 Calling backend API:', backendUrl);
    
    const response = await axios.post(backendUrl, {
      url: shortUrl
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const finalUrl = response.data?.finalUrl || response.data?.resolvedUrl;
    if (finalUrl) {
      const asin = response.data?.asin;
      console.log('✅ Backend resolved URL:', finalUrl);
      if (asin) console.log('✅ Backend extracted ASIN:', asin);
      return finalUrl;
    }
    throw new Error(response.data?.error || 'Backend failed to resolve URL');
    
  } catch (error) {
    console.error('❌ Backend URL resolution failed:', error);
    
    // If backend is not available, provide helpful instructions
    if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
      throw new Error(`Backend server is not running. Please:
1. Start the backend server: cd server && npm install && npm start
2. Or manually visit ${shortUrl} and copy the full Amazon URL
3. Or paste the 10-character ASIN directly`);
    }
    
    // Re-throw the error from backend
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    throw new Error('Could not resolve shortened URL. Please use the full Amazon URL or ASIN directly.');
  }
};

// Pure extractor: expects a final (possibly resolved) Amazon URL
export const extractAsinFromFinalUrl = (finalUrl: string): string | null => {
  // Priority order only, no network
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /\/d\/([A-Z0-9]{10})/i,
    /\/([A-Z0-9]{10})(?:\/|\?|$)/i
  ];
  for (const pattern of patterns) {
    const m = finalUrl.match(pattern);
    if (m && m[1]) return m[1];
  }
  return null;
};

export const extractAsin = async (url: string): Promise<string | null> => {
  console.log('🔍 Extracting ASIN from URL:', url);

  // Direct ASIN input support
  const directAsinRegex = /^([A-Z0-9]{10})$/i;
  const directMatch = url.match(directAsinRegex);
  if (directMatch) return directMatch[1];

  let processUrl = url;

  // Resolve shortlinks (incl. a.co)
  const lower = String(url).toLowerCase();
  const isShort = lower.includes('amzn.to') || lower.includes('a.co/') || lower.includes('amazon.com/gp/r') || lower.includes('amazon.com/gp/redirect');
  if (isShort) {
    processUrl = await resolveShortUrl(url);
  }

  return extractAsinFromFinalUrl(processUrl);
};

export const buildAffiliateUrl = (asin: string, tag: string): string => {
  return `https://www.amazon.com/dp/${asin}/?tag=${tag}/`;
};

