import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

// Persistent analytics store
const DATA_FILE = path.join(process.cwd(), 'server', 'analytics-data.json');
function loadAnalytics() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      cta_click_ios_a2hs: parsed.cta_click_ios_a2hs || 0,
      cta_click_android_pwa: parsed.cta_click_android_pwa || 0,
      cta_click_desktop_bookmark: parsed.cta_click_desktop_bookmark || 0,
      events: Array.isArray(parsed.events) ? parsed.events : []
    };
  } catch {
    return { cta_click_ios_a2hs: 0, cta_click_android_pwa: 0, cta_click_desktop_bookmark: 0, events: [] };
  }
}
function saveAnalytics(state) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(state), 'utf-8');
  } catch (e) {
    console.error('❌ Failed to persist analytics:', e.message);
  }
}
const analytics = loadAnalytics();

function handleAnalyticsPost(req, res) {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    const { name } = body || {};
    console.log('📊 analytics event received:', { raw: req.body, parsedName: name });
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Missing event name' });
    }
    if (name in analytics) {
      analytics[name] += 1;
    }
    analytics.events.push({ name, ts: Date.now() });
    if (analytics.events.length > 1000) analytics.events.splice(0, analytics.events.length - 1000);
    saveAnalytics(analytics);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to record event' });
  }
}

// Receive analytics events (two routes to avoid ad blockers)
app.post('/api/analytics', handleAnalyticsPost);
app.post('/api/cta-analytics', handleAnalyticsPost);

// CTA stats JSON
app.get('/api/cta-stats', (_req, res) => {
  res.json({
    ios: analytics.cta_click_ios_a2hs,
    android: analytics.cta_click_android_pwa,
    desktop: analytics.cta_click_desktop_bookmark,
    total: analytics.cta_click_ios_a2hs + analytics.cta_click_android_pwa + analytics.cta_click_desktop_bookmark
  });
});

// Debug: list recent analytics events
app.get('/api/analytics/events', (_req, res) => {
  res.json({ events: analytics.events.slice(-100) });
});

// Simple CTA stats page
app.get('/cta', (_req, res) => {
  const ios = analytics.cta_click_ios_a2hs;
  const android = analytics.cta_click_android_pwa;
  const desktop = analytics.cta_click_desktop_bookmark;
  const total = ios + android + desktop;
  res.type('html').send(`
<!doctype html>
<html><head><meta charset="utf-8"><title>CTA Stats</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;padding:24px;color:#1a202c}
.card{max-width:560px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 6px 16px rgba(0,0,0,.06)}
.row{display:flex;justify-content:space-between;margin:8px 0}
.h{font-weight:600}
</style>
</head>
<body>
  <div class="card">
    <div class="row h"><div>CTA</div><div>Count</div></div>
    <div class="row"><div>iOS Add to Home Screen</div><div>${ios}</div></div>
    <div class="row"><div>Android Install App</div><div>${android}</div></div>
    <div class="row"><div>Desktop Bookmark</div><div>${desktop}</div></div>
    <hr />
    <div class="row h"><div>Total</div><div>${total}</div></div>
  </div>
</body></html>
  `);
});

// Function to resolve shortened URLs by following redirects (robust, manual loop)
async function resolveShortUrl(shortUrl) {
  console.log('🔗 Resolving shortened URL:', shortUrl);

  const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };

  async function follow(method) {
    let current = shortUrl;
    for (let i = 0; i < 10; i++) {
      const resp = await axios.request({
        url: current,
        method,
        // Do not auto-follow redirects; we want to read Location headers explicitly
        maxRedirects: 0,
        timeout: 15000,
        validateStatus: () => true,
        headers: commonHeaders
      });

      const status = resp.status || 0;
      const location = resp.headers?.location;

      // 2xx → final
      if (status >= 200 && status < 300) {
        return current;
      }
      // 3xx with Location → hop
      if (status >= 300 && status < 400 && location) {
        try {
          const absolute = new URL(location, current).href;
          current = absolute;
          continue;
        } catch {
          // malformed location; break
          break;
        }
      }
      // Anything else → stop
      break;
    }
    return current;
  }

  try {
    // Prefer HEAD chain
    const headFinal = await follow('HEAD');
    console.log('✅ HEAD chain final URL:', headFinal);
    // If HEAD did not move (still short) or seems not amazon, try GET chain
    if (/a\.co\//i.test(shortUrl) && headFinal === shortUrl) {
      const getFinal = await follow('GET');
      console.log('✅ GET chain final URL:', getFinal);
      return getFinal;
    }
    return headFinal;
  } catch (e) {
    console.error('❌ Redirect resolution failed, trying GET chain:', e.message);
    try {
      const getFinal = await follow('GET');
      console.log('✅ GET chain final URL:', getFinal);
      return getFinal;
    } catch (err) {
      console.error('❌ Both HEAD and GET chains failed:', err.message);
      throw new Error(`Could not resolve shortened URL: ${err.message}`);
    }
  }
}

// Function to extract ASIN from Amazon URL - with required priority
function extractAsinFromUrl(url) {
  console.log('🔍 Extracting ASIN from URL:', url);
  
  // ASIN extraction patterns in priority order
  const asinPatterns = [
    /\/dp\/([A-Z0-9]{10})/i,               // 1. /dp/ASIN
    /\/gp\/product\/([A-Z0-9]{10})/i,     // 2. /gp/product/ASIN
    /\/product\/([A-Z0-9]{10})/i,         // 3. /product/ASIN
    /[?&]asin=([A-Z0-9]{10})/i,            // 4. asin=ASIN query param
    
    // Additional common patterns for better coverage
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,      // mobile
    /\/d\/([A-Z0-9]{10})/i,               // direct /d/ASIN
    /\/([A-Z0-9]{10})(?:\/|\?|$)/i       // fallback: ASIN at end
  ];
  
  for (const pattern of asinPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      console.log('✅ ASIN found:', match[1]);
      return match[1];
    }
  }
  
  console.log('❌ No ASIN found in URL');
  return null;
}

// API endpoint to resolve shortened URLs
app.post('/api/resolve-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        success: false 
      });
    }
    
    console.log('📨 Received URL resolution request for:', url);
    
    // Check if it's a shortened URL that needs resolution (incl. a.co)
    const lower = String(url).toLowerCase();
    const needsResolution = lower.includes('amzn.to') ||
                           lower.includes('a.co/') ||
                           lower.includes('amazon.com/gp/r') || 
                           lower.includes('amazon.com/gp/redirect');
    
    let resolvedUrl = url;
    
    if (needsResolution) {
      resolvedUrl = await resolveShortUrl(url);
    }
    
    // Extract ASIN from the resolved URL
    const asin = extractAsinFromUrl(resolvedUrl);
    
    if (!asin) {
      return res.status(400).json({
        error: 'Could not extract ASIN from the resolved URL',
        success: false,
        resolvedUrl: resolvedUrl
      });
    }
    
    // Optional: Validate ASIN via Keepa if API key is configured
    try {
      const keepaKey = process.env.KEEPA_API_KEY;
      if (keepaKey) {
        const keepaUrl = `https://api.keepa.com/product?key=${keepaKey}&domain=1&asin=${asin}&history=0&stats=0`;
        const keepaResp = await axios.get(keepaUrl, { timeout: 15000 });
        if (!keepaResp.data || !Array.isArray(keepaResp.data.products) || keepaResp.data.products.length === 0) {
          return res.status(400).json({ error: 'Invalid ASIN or product not found on Keepa.', finalUrl: resolvedUrl, asin: asin });
        }
      }
    } catch (validationError) {
      console.error('❌ Keepa validation failed:', validationError.message);
      // If Keepa returns 4xx like 402/401, return a friendly message without blocking core flow
      if (validationError.response && validationError.response.status) {
        const status = validationError.response.status;
        if (status === 401 || status === 402) {
          return res.status(200).json({ finalUrl: resolvedUrl, asin: asin, warning: 'ASIN validation skipped due to Keepa account issue.' });
        }
      }
      return res.status(502).json({ error: 'Could not validate ASIN with Keepa at this time.', finalUrl: resolvedUrl, asin: asin });
    }

    // Return the resolved data in the specified format
    res.json({ finalUrl: resolvedUrl, asin: asin });
    
  } catch (error) {
    console.error('❌ Error resolving URL:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/resolve-url`);
});