import json
import re
import time
from urllib.parse import urlparse
from urllib.request import urlopen, Request

import requests

def extract_asin(url_or_asin):
    """
    Extracts the ASIN from a given Amazon URL or returns it if already an ASIN.
    """
    asin_pattern = r'^[A-Z0-9]{10}$'
    if re.match(asin_pattern, url_or_asin):
        return url_or_asin

    parsed_url = urlparse(url_or_asin)
    asin = None

    if parsed_url.netloc == 'amzn.to':
        # Try to follow redirect
        try:
            req = Request(url_or_asin, method='HEAD')
            req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            with urlopen(req) as response:
                full_url = response.url
        except Exception as e:
            # Try to extract ASIN from the short URL path if possible
            path = parsed_url.path.strip('/')
            if path and len(path) >= 10:
                asin = path[:10]
            else:
                raise ValueError("Could not extract ASIN from amzn.to URL")
        else:
            # If we got a full URL from redirect, extract ASIN from it
            parsed = urlparse(full_url)
            path = parsed.path
            if 'dp/' in path:
                asin = path.split('dp/')[1].split('/')[0]
            elif 'gp/product/' in path:
                asin = path.split('gp/product/')[1].split('/')[0]
    else:
        # Handle regular Amazon URLs
        path = parsed_url.path
        if 'dp/' in path:
            asin = path.split('dp/')[1].split('/')[0]
        elif 'gp/product/' in path:
            asin = path.split('gp/product/')[1].split('/')[0]

    if not asin:
        raise ValueError("Could not extract ASIN from URL")

    if not re.match(asin_pattern, asin):
        raise ValueError(f"Invalid ASIN format: {asin}")

    return asin

def get_keepa_data(url_or_asin):
    keepa_key = 'fptdtn34t39ild7tst0cdapjfl17v698tmac34s7ksvi9vt6nkr1vu9jci81g4lq'
    domain = 1  # US

    asin = extract_asin(url_or_asin)
    print(f"Final ASIN: {asin}")

    # Use requests and the robust Keepa API pattern from keepa_sheet.py
    url = f'https://api.keepa.com/product?key={keepa_key}&domain={domain}&asin={asin}&stats=30&buybox=1'
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.get(url)
            response.raise_for_status()
            response_data = response.json()
            break
        except requests.exceptions.HTTPError as errh:
            print("Http Error:", errh)
            time.sleep(2)
            continue
        except requests.exceptions.ConnectionError as errc:
            print("Error Connecting:", errc)
            time.sleep(2)
            continue
        except requests.exceptions.Timeout as errt:
            print("Timeout Error:", errt)
            time.sleep(2)
            continue
        except requests.exceptions.RequestException as err:
            print("Something went wrong:", err)
            time.sleep(2)
            continue
    else:
        raise ValueError("Failed to fetch data from Keepa API after retries.")

    if 'products' not in response_data or not response_data['products']:
        raise ValueError("No product data returned from Keepa")

    product = response_data['products'][0]
    if 'stats' not in product or 'current' not in product['stats']:
        raise ValueError("No price data available")

    stats = product.get('stats', {})
    current = stats.get('current', [])
    avg30 = stats.get('avg30', [])
    max_in_interval = stats.get('maxInInterval', [])
    min_in_interval = stats.get('minInInterval', [])

    # Buybox current price (index 1 is AMAZON price, index 0 is often -1)
    buybox_current_price = current[1] if len(current) > 1 and current[1] != -1 else 'Not Available'
    
    # Buybox average 30-day price (index 1 is AMAZON price)
    buybox_avg30_price = avg30[1] if len(avg30) > 1 and avg30[1] != -1 else 'Not Available'
    
    # 30-day high price (maxInInterval index 1, second value of tuple)
    high_30_day = max_in_interval[1][1] if len(max_in_interval) > 1 and max_in_interval[1] and len(max_in_interval[1]) > 1 else 'Not Available'
    
    # 30-day low price (minInInterval index 1, second value of tuple)
    low_30_day = min_in_interval[1][1] if len(min_in_interval) > 1 and min_in_interval[1] and len(min_in_interval[1]) > 1 else 'Not Available'

    print(f"Buybox current price: {buybox_current_price}")
    print(f"Buybox 30-day avg price: {buybox_avg30_price}")
    print(f"30-day high price: {high_30_day}")
    print(f"30-day low price: {low_30_day}")

    if buybox_current_price == 'Not Available':
        return "Product out of stock"

    # Format prices for display (Keepa prices are in cents, convert to dollars)
    current_price_display = f"${buybox_current_price/100:.2f}" if isinstance(buybox_current_price, (int, float)) else buybox_current_price
    avg30_price_display = f"${buybox_avg30_price/100:.2f}" if isinstance(buybox_avg30_price, (int, float)) else buybox_avg30_price
    high_30_day_display = f"${high_30_day/100:.2f}" if isinstance(high_30_day, (int, float)) else high_30_day
    low_30_day_display = f"${low_30_day/100:.2f}" if isinstance(low_30_day, (int, float)) else low_30_day

    # Create price info string
    price_info = f"Buybox Current: {current_price_display}, \n30-Day Avg: {avg30_price_display}, \n30-Day High: {high_30_day_display}, \n30-Day Low: {low_30_day_display}"

    # Logic based on current price vs 30-day average
    if isinstance(buybox_current_price, (int, float)) and isinstance(buybox_avg30_price, (int, float)):
        # Calculate percentage difference
        price_diff_percent = ((buybox_avg30_price - buybox_current_price) / buybox_avg30_price) * 100
        
        if buybox_current_price < buybox_avg30_price:
            return f"👍 Good time to buy - {price_info}"
        elif abs(price_diff_percent) <= 5:  # Within 5% of average
            return f"👌 Decent time to buy - {price_info}"
        elif price_diff_percent < -5:  # Current price is more than 5% higher than average
            return f"Prices trending higher than average right now - \n{price_info}"
        else:
            return f"Not a good time to buy - {price_info}"
    else:
        return f"Unable to compare prices - {price_info}"


if __name__ == "__main__":
    try:
        result = get_keepa_data('B00891G9AC')
        print(f"Result: {result}\n")
    except Exception as e:
        print(f"Error: {e}\n")
    time.sleep(1)