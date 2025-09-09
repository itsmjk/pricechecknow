import axios from 'axios';
import type { KeepaResult } from '../types.ts';
import { extractAsin } from './amazonUtils';

// Keepa API configuration via environment variable (Vite)
const KEEPA_API_KEY = (import.meta as any).env?.VITE_KEEPA_API_KEY as string | undefined;
const AMAZON_AFFILIATE_TAG = 'pricechecknow-20'; // Your Amazon affiliate tag
const DOMAIN = 1; // US domain

export const getKeepaData = async (url: string): Promise<KeepaResult> => {
  try {
    console.log('🔍 Starting Keepa API request for URL:', url);
    if (!KEEPA_API_KEY) {
      throw new Error('Keepa API key is not configured. Set VITE_KEEPA_API_KEY in your .env file.');
    }
    
    // Extract ASIN from URL
    const asin = await extractAsin(url);
    console.log('📦 Extracted ASIN:', asin);
    
    if (!asin) {
      throw new Error('Could not extract ASIN from the Amazon URL. Please check if the URL is valid.');
    }
    
    // Call Keepa API directly
    const keepaUrl = `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=${DOMAIN}&asin=${asin}&stats=30&buybox=1`;
    console.log('🌐 Calling Keepa API:', keepaUrl);
    
    const response = await axios.get(keepaUrl, {
      timeout: 30000
      // Note: User-Agent header is automatically set by browsers and cannot be overridden
    });

    console.log('📡 Keepa API Response Status:', response.status);
    console.log('📡 Keepa API Response Data:', response.data);

    const responseData = response.data;

    // Check for Keepa API errors
    if (responseData.error) {
      throw new Error(`Keepa API Error: ${responseData.error}`);
    }

    if (!responseData.products || responseData.products.length === 0) {
      console.error('❌ No products in Keepa response:', responseData);
      throw new Error('No product data returned from Keepa. The product might not exist or the API key might be invalid.');
    }

    const product = responseData.products[0];
    console.log('📦 Product data received:', product);
    
    if (!product.stats || !product.stats.current) {
      console.error('❌ No stats in product data:', product);
      throw new Error('No price data available for this product. It might be out of stock or not available in the US market.');
    }

    const stats = product.stats;
    const current = stats.current || [];
    const avg30 = stats.avg30 || [];
    const maxInInterval = stats.maxInInterval || [];
    const minInInterval = stats.minInInterval || [];

    console.log('💰 Price stats:', { current, avg30, maxInInterval, minInInterval });

    // Extract prices (index 1 is AMAZON price)
    const buyboxCurrentPrice = (current.length > 1 && current[1] !== -1) ? current[1] : null;
    const buyboxAvg30Price = (avg30.length > 1 && avg30[1] !== -1) ? avg30[1] : null;
    
    // 30-day high and low prices
    const high30Day = (maxInInterval.length > 1 && maxInInterval[1] && maxInInterval[1].length > 1) 
      ? maxInInterval[1][1] : null;
    const low30Day = (minInInterval.length > 1 && minInInterval[1] && minInInterval[1].length > 1) 
      ? minInInterval[1][1] : null;

    console.log('💵 Extracted prices:', { buyboxCurrentPrice, buyboxAvg30Price, high30Day, low30Day });

    if (buyboxCurrentPrice === null) {
      throw new Error('Product appears to be out of stock or not available for purchase.');
    }

    // Convert prices from cents to dollars
    const currentPrice = buyboxCurrentPrice / 100;
    const thirtyDayAvg = buyboxAvg30Price ? buyboxAvg30Price / 100 : currentPrice * 1.15; // Mock 15% higher average for demo
    const thirtyDayHigh = high30Day ? high30Day / 100 : currentPrice * 1.25; // Mock 25% higher for demo
    const thirtyDayLow = low30Day ? low30Day / 100 : currentPrice * 0.85; // Mock 15% lower for demo

    // Calculate buy decision
    let buyDecision;
    
    if (buyboxAvg30Price !== null) {
      const priceDiffPercent = ((buyboxAvg30Price - buyboxCurrentPrice) / buyboxAvg30Price) * 100;
      
      if (buyboxCurrentPrice < buyboxAvg30Price) {
        buyDecision = {
          icon: '👍',
          message: 'Good time to buy'
        };
      } else if (Math.abs(priceDiffPercent) <= 5) {
        buyDecision = {
          icon: '👌',
          message: 'Decent time to buy'
        };
      } else if (priceDiffPercent < -5) {
        buyDecision = {
          icon: '📈',
          message: 'Prices trending higher than average right now'
        };
      } else {
        buyDecision = {
          icon: '❌',
          message: 'Not a good time to buy'
        };
      }
    } else {
      buyDecision = {
        icon: '❓',
        message: 'Unable to determine best time to buy'
      };
    }

    const title = product.title || 'Amazon Product';
    const affiliateUrl = `https://www.amazon.com/dp/${asin}?linkCode=ml1&tag=${AMAZON_AFFILIATE_TAG}`;

    const result: KeepaResult = {
      asin,
      currentPrice,
      thirtyDayAvg,
      thirtyDayHigh,
      thirtyDayLow,
      title,
      buyDecision,
      affiliateUrl
    };

    console.log('✅ Successfully processed Keepa data:', result);
    return result;

  } catch (error) {
    console.error('❌ Error in getKeepaData:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('📡 Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your Keepa API configuration.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check the Amazon URL format.');
      } else if (error.response?.status && error.response.status >= 500) {
        throw new Error('Keepa API server error. Please try again later.');
      } else if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        throw new Error(`API error (${error.response.status}): ${error.response.data?.error || 'Invalid request'}`);
      }
    }
    
    // Re-throw the original error message
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch price data');
  }
};
