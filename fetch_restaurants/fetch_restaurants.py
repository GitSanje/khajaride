import requests
import json
import time

BASE_API_URL = "https://foodmandu.com/webapi/api/Vendor/GetVendors1"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://foodmandu.com/",
    "Origin": "https://foodmandu.com"
}

# Define all delivery zones (example IDs)
DELIVERY_ZONES = {
    "Kathmandu": 1,
    "Lalitpur": 2,
    "Bhaktapur": 3
}

def fetch_restaurants_for_zone(delivery_zone_id, max_pages=20, page_size=50):
    """Fetch all restaurants for a single delivery zone"""
    all_restaurants = []

    for page in range(1, max_pages + 1):
        params = {
            "Cuisine": "",
            "DeliveryZoneId": delivery_zone_id,
            "IsFavorite": "false",
            "IsRecent": "false",
            "Keyword": "",
            "LocationLat": 0,
            "LocationLng": 0,
            "PageNo": page,
            "PageSize": page_size,
            "SortBy": 4,
            "VendorName": "",
            "VendorTags": "{}",
            "VendorTagsCSV": "",
            "search_by": "restaurant"
        }

        resp = requests.get(BASE_API_URL, headers=HEADERS,params=params)
        
        # Check if response is JSON
        if "application/json" not in resp.headers.get("Content-Type", ""):
            print(f"⚠️ Not JSON! Status: {resp.status_code}")
            print(resp.text[:300])
            break

        data = resp.json()
        vendors = data  

        if not vendors:
            print(f"No more data on page {page} for zone {delivery_zone_id}")
            break

        all_restaurants.extend(vendors)
        print(f"Fetched page {page} ({len(vendors)} restaurants) for zone {delivery_zone_id}")

        time.sleep(1)  # be polite, avoid rate-limiting

    return all_restaurants

def fetch_all_zones():
    """Fetch restaurants for all delivery zones"""
    all_data = {}
    for zone_name, zone_id in DELIVERY_ZONES.items():
        print(f"\nFetching restaurants for {zone_name} (zone ID: {zone_id})")
        all_data[zone_name] = fetch_restaurants_for_zone(zone_id)
    return all_data

if __name__ == "__main__":
    restaurants_data = fetch_all_zones()

    # Save to JSON
    with open("foodmandu_all_restaurants2.json", "w", encoding="utf-8") as f:
        json.dump(restaurants_data, f, ensure_ascii=False, indent=2)

    print("\n✅ Done! Data saved to 'foodmandu_all_restaurants2.json'")
