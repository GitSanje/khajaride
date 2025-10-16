package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
)

func getString(m map[string]interface{}, key string) string {
	if val, ok := m[key]; ok {
		if s, ok := val.(string); ok {
			return s
		}
	}
	return ""
}
func getStringPtr(m map[string]interface{}, key string) *string {
	str := getString(m, key)
	if str == "" {
		return nil
	}
	return &str
}
func getStringPtrFrom(m map[string]interface{}, key string) *string {
	return getStringPtr(m, key)
}

func getFloat(m map[string]interface{}, key string) float64 {
	if val, ok := m[key]; ok {
		switch v := val.(type) {
		case float64:
			return v
		case int:
			return float64(v)
		}
	}
	return 0
}

func getBool(m map[string]interface{}, key string) bool {
	if val, ok := m[key]; ok {
		if b, ok := val.(bool); ok {
			return b
		}
	}
	return false
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
func getInt(m map[string]interface{}, key string) int {
	if val, ok := m[key]; ok {
		switch v := val.(type) {
		case float64:
			return int(v)
		case int:
			return v
		}
	}
	return 0
}

func main() {
	vendorMapData, err := loadVendors("new_vendors.json")
	if err != nil {
		fmt.Println("Error loading vendors:", err)
		return
	}

	menuVendorData, err := mergeMenus("foodmandu_all_menu_items.json", vendorMapData)
	if err != nil {
		fmt.Println("Error merging menu and vendor data:", err)
		return
	}

	if err := writeJSONFile("new_menu_vendor.json", menuVendorData); err != nil {
		fmt.Println("Error writing output file:", err)
		return
	}

	fmt.Printf("✅ Successfully generated denormalized dataset with %d menu items.\n", len(menuVendorData))
}

func loadVendors(path string) (map[string]interface{}, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var root map[string]interface{}
	if err := json.NewDecoder(file).Decode(&root); err != nil {
		return nil, err
	}

	rawVendors, ok := root["vendors"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid vendor structure")
	}

	vendorMapData := make(map[string]interface{}, len(rawVendors))
	for _, v := range rawVendors {
		vendorMap, ok := v.(map[string]interface{})
		if !ok {
			continue
		}

		vID := strconv.Itoa(getInt(vendorMap, "Id"))
		vendorMapData[vID] = map[string]interface{}{
			"id":                vID,
			"name":              getString(vendorMap, "Name"),
			"about":             getString(vendorMap, "About"),
			"cuisine":           getString(vendorMap, "Cuisine"),
			"cuisine_tags":      getString(vendorMap, "CuisineTags"),
			"vendor_type":       getString(vendorMap, "VendorType"),
			"rating":            getFloat(vendorMap, "VendorRating"),
			"favorite_count":    getInt(vendorMap, "FavoriteCount"),
			"is_open":           getBool(vendorMap, "IsOpen"),
			"is_featured":       getBool(vendorMap, "IsFeaturedVendor"),
			"delivery_available": getBool(vendorMap, "AcceptsDeliveryOrder"),
			"pickup_available":   getBool(vendorMap, "AcceptsTakeoutOrder"),
			"delivery_fee":      getFloat(vendorMap, "DeliveryFee"),
			"min_order_amount":  getFloat(vendorMap, "MinOrderAmount"),
			"promo_text":        getString(vendorMap, "PromoText"),
			"vendor_notice":     getString(vendorMap, "VendorNotice"),
			"location": map[string]float64{
				"lat": getFloat(vendorMap, "LocationLat"),
				"lon": getFloat(vendorMap, "LocationLng"),
			},
			"street_address": getString(vendorMap, "Address1"),
			"city":           getString(vendorMap, "City"),
			"state":          getString(vendorMap, "State"),
			"zip_code":       getString(vendorMap, "ZipCode"),
			"opening_hours":       getString(vendorMap, "OpeningHours"),
			"vendor_listing_image_name":getString(vendorMap, "VendorListingWebImageName"),
			"vendor_logo_image_name":getString(vendorMap, "VendorLogoImageName"),

		}
	}

	return vendorMapData, nil
}

func mergeMenus(path string, vendorMapData map[string]interface{}) ([]map[string]interface{}, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var menuData map[string]interface{}
	if err := json.NewDecoder(file).Decode(&menuData); err != nil {
		return nil, err
	}

	menuVendorData := make([]map[string]interface{},0)
	uniqueMenuItemId := make(map[int]struct{}, 50000)

	for vendorID, menuItems := range menuData {
		categoryList, ok := menuItems.([]interface{})
		if !ok {
			continue
		}

		for _, c := range categoryList {
			category, ok := c.(map[string]interface{})
			if !ok {
				continue
			}

			cID := getInt(category, "categoryId")
			cName := getString(category, "category")

			items, ok := category["items"].([]interface{})
			if !ok {
				continue
			}

			for _, item := range items {
				itemMap, ok := item.(map[string]interface{})
				if !ok {
					continue
				}

				itemID := getInt(itemMap, "productId")
				if _, exists := uniqueMenuItemId[itemID]; exists {
					continue
				}
				uniqueMenuItemId[itemID] = struct{}{}

				menuVendorItem :=  map[string]interface{}{
					"menu_id":           strconv.Itoa(itemID),
					"menu_name":         getString(itemMap, "name"),
					"menu_description":  getString(itemMap, "productDesc"),
					"base_price":   getFloat(itemMap, "price"),
					"keywords":     getString(itemMap, "Keyword"),
					"tags":         getString(itemMap, "itemDisplayTag"),
					"is_available": true,
					"is_popular":   false,
					"category": map[string]interface{}{
						"id":   strconv.Itoa(cID),
						"name": cName,
					},
					"vendor":    vendorMapData[vendorID],
				}


				menuVendorData = append(menuVendorData, menuVendorItem)
			}
		}
	}
	return menuVendorData, nil
}

func writeJSONFile(path string, data interface{}) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	return encoder.Encode(data)
}
