import requests
import json
import time

BASE_API_URL = "https://foodmandu.com/webapi/api/v2/Product/GetVendorProductsBySubCategoryV2?VendorId={}"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://foodmandu.com/",
    "Origin": "https://foodmandu.com"
}


def extract_vendor_ids(json_file_path):
    with open(json_file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    vendor_ids = []
    for zone, vendors in data.items():
        for vendor in vendors:
            vendor_ids.append(vendor["Id"])
    return vendor_ids

def extract_menu_items_for_vendor(vendor_id):
    url = BASE_API_URL.format(vendor_id)
    resp = requests.get(url, headers=HEADERS)
    if "application/json" not in resp.headers.get("Content-Type", ""):
        print(f"⚠️ Not JSON for Vendor {vendor_id}! Status: {resp.status_code}")
        print(resp.text[:300])
        return None

    data = resp.json()
    return data

def fetch_menu_items_for_all_vendors(vendor_ids, delay=1):
    all_menu_items = {}

    for idx, vendor_id in enumerate(vendor_ids):
        print(f"Fetching menu for Vendor ID: {vendor_id} ({idx + 1}/{len(vendor_ids)})")
        menu_data = extract_menu_items_for_vendor(vendor_id)
        if menu_data is not None:
            all_menu_items[vendor_id] = menu_data
        time.sleep(delay)  # Be polite and avoid hitting the server too hard

    return all_menu_items


if __name__ == "__main__":
    # all_menu_items = fetch_menu_items_for_all_vendors(extract_vendor_ids("foodmandu_all_restaurants.json")[1000:])
    
    # # Save to JSON
    # with open("foodmandu_all_menu_items2.json", "w", encoding="utf-8") as f:
    #     json.dump(all_menu_items, f, ensure_ascii=False, indent=2)

    # print("\n✅ Done! Data saved to 'foodmandu_all_menu_items2.json'")
    print(len(extract_vendor_ids("foodmandu_all_restaurants.json")))