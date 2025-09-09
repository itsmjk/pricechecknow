# KeepaASIN - Amazon Price Tracker

A React-based web application that tracks Amazon product prices using the Keepa API. Supports full Amazon URLs, mobile links, and shortened URLs (amzn.to).

## Features

- **URL Support**: Works with full Amazon URLs, mobile links, and shortened URLs (amzn.to)
- **Price Tracking**: Fetches current prices, 30-day averages, and price history from Keepa API
- **Backend URL Resolution**: Server-side resolution of shortened Amazon URLs
- **Modern UI**: Built with React, TypeScript, and Chakra UI
- **PWA Ready**: Progressive Web App with offline capabilities

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Keepa API key

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Start the backend server:**
   ```bash
   cd server
   npm start
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:5173`

## Usage

1. Paste any Amazon product URL (including shortened amzn.to links)
2. The system will automatically resolve shortened URLs and extract the ASIN
3. View current prices, 30-day averages, and price history
4. Get affiliate links for the products

## Supported URL Formats

- Full Amazon URLs: `https://www.amazon.com/dp/B0F6X4MPT4`
- Shortened URLs: `https://amzn.to/3JzKHNR`
- Mobile URLs: `https://amazon.com/gp/aw/d/B0F6X4MPT4`
- Direct ASINs: `B0F6X4MPT4`

## Configuration

### Keepa API Key
Set your Keepa API key in the frontend `.env` as `VITE_KEEPA_API_KEY` (for local dev / Netlify). For server validation (Render), set `KEEPA_API_KEY` in server env.
Frontend `.env` example:
```
VITE_API_BASE=/
VITE_KEEPA_API_KEY=your-keepa-api-key-here
```

### Amazon Affiliate Tag
Update your Amazon affiliate tag in `src/utils/keepaApi.ts`:
```typescript
const AMAZON_AFFILIATE_TAG = 'your-affiliate-tag-20';
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend Server

The backend server runs on port 3001 and provides URL resolution services:
- `POST /api/resolve-url` - Resolve shortened Amazon URLs
- `GET /api/health` - Health check endpoint

## Architecture

- **Frontend**: React + TypeScript + Vite + Chakra UI
- **Backend**: Express.js server for URL resolution
- **API**: Keepa API for price data
- **PWA**: Progressive Web App with service worker

## License

MIT License
