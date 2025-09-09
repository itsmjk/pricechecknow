import { extractAsin, extractAsinFromFinalUrl } from './amazonUtils';

describe('extractAsin', () => {
  it('extracts from /dp/ASIN', async () => {
    await expect(extractAsin('https://www.amazon.com/dp/B08N5WRWNW')).resolves.toBe('B08N5WRWNW');
  });

  it('extracts from /gp/product/ASIN', async () => {
    await expect(extractAsin('https://www.amazon.com/gp/product/B07FZ8S74R')).resolves.toBe('B07FZ8S74R');
  });

  it('respects priority order (dp over query)', async () => {
    await expect(extractAsin('https://www.amazon.com/dp/B07FZ8S74R?asin=B08N5WRWNW')).resolves.toBe('B07FZ8S74R');
  });

  it('extracts from /product/ASIN', async () => {
    await expect(extractAsin('https://www.amazon.com/product/B0CXYZABCD')).resolves.toBe('B0CXYZABCD');
  });

  it('extracts from asin query param', async () => {
    await expect(extractAsin('https://www.amazon.com/some/path?asin=B0CXYZABCD')).resolves.toBe('B0CXYZABCD');
  });

  it('extracts from mobile m.amazon.com', async () => {
    await expect(extractAsin('https://m.amazon.com/gp/aw/d/B08N5WRWNW')).resolves.toBe('B08N5WRWNW');
  });

  it('handles direct ASIN input', async () => {
    await expect(extractAsin('B08N5WRWNW')).resolves.toBe('B08N5WRWNW');
  });
});

describe('extractAsinFromFinalUrl priority', () => {
  it('prefers /dp over /gp/product and query', () => {
    expect(extractAsinFromFinalUrl('https://www.amazon.com/dp/B07FZ8S74R?asin=B08N5WRWNW')).toBe('B07FZ8S74R');
  });
  it('falls back to /gp/product over /product and query', () => {
    expect(extractAsinFromFinalUrl('https://www.amazon.com/gp/product/B07FZ8S74R?asin=B08N5WRWNW')).toBe('B07FZ8S74R');
  });
  it('uses /product when /dp and /gp/product are absent', () => {
    expect(extractAsinFromFinalUrl('https://www.amazon.com/product/B0CXYZABCD')).toBe('B0CXYZABCD');
  });
  it('uses asin query when no path pattern present', () => {
    expect(extractAsinFromFinalUrl('https://www.amazon.com/some/path?asin=B0CXYZABCD&ref=something')).toBe('B0CXYZABCD');
  });
});


