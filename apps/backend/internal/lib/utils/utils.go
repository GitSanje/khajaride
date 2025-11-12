package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/gitSanje/khajaride/internal/model/coupon"
	"github.com/gitSanje/khajaride/internal/model/user"
	"github.com/gitSanje/khajaride/internal/model/vendor"
)

func PrintJSON(v interface{}) {
	json, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		fmt.Println("Error marshalling to JSON:", err)
		return
	}
	fmt.Println("JSON:", string(json))
}

// --- helper functions ---

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

// ---------- Interfaces & Structs ----------
type HasValue interface {
	GetValue() string
	GetID() string
}

type ClerkEmail struct {
	ID           string `json:"id"`
	EmailAddress string `json:"email_address"`
}

func (c ClerkEmail) GetValue() string { return c.EmailAddress }
func (c ClerkEmail) GetID() string    { return c.ID }

type ClerkPhoneNumber struct {
	ID          string `json:"id"`
	PhoneNumber string `json:"phone_number"`
}

func (c ClerkPhoneNumber) GetValue() string { return c.PhoneNumber }
func (c ClerkPhoneNumber) GetID() string    { return c.ID }

// ---------- Generic Helper ----------
func findPrimaryValue[T HasValue](data []T, primaryID string) string {
	for _, item := range data {
		if item.GetID() == primaryID {
			return item.GetValue()
		}
	}
	return ""
}

// MapClerkUserToCreateUser maps the "data" field from a Clerk webhook payload to CreateUserPayload
func MapClerkUserToCreateUser(data json.RawMessage) (*user.CreateUserPayload, error) {

	var clerkUser struct {
		ID                    *string            `json:"id"`
		EmailAddresses        []ClerkEmail       `json:"email_addresses"`
		PhoneNumbers          []ClerkPhoneNumber `json:"phone_numbers"`
		ProfileImage          *string            `json:"image_url"`
		Username              string             `json:"username"`
		PrimaryEmailAddressID string             `json:"primary_email_address_id"`
		PrimaryPhoneNumberID  string             `json:"primary_phone_number_id"`
	}

	// Unmarshal only the data portion
	if err := json.Unmarshal(data, &clerkUser); err != nil {
		return nil, fmt.Errorf("failed to unmarshal Clerk user data: %w", err)
	}

	email := findPrimaryValue(clerkUser.EmailAddresses, clerkUser.PrimaryEmailAddressID)
	phoneNumber := findPrimaryValue(clerkUser.PhoneNumbers, clerkUser.PrimaryPhoneNumberID)

	return &user.CreateUserPayload{
		ID:             clerkUser.ID,
		Email:          email,
		Username:       clerkUser.Username,
		PhoneNumber:    strPtr(phoneNumber),
		Password:       nil,
		Role:           "user",
		ProfilePicture: clerkUser.ProfileImage,
	}, nil
}

//-------------------- FOODMANDU VENDOR AND MENU TRANFORM FOR DB SCHEMA-----------------

func TransformFoodManduVendors(flatJSON []byte) ([]vendor.VendorBulkInput, error) {

	var vendorMapData map[string]interface{}
	if err := json.Unmarshal(flatJSON, &vendorMapData); err != nil {
		return nil, fmt.Errorf("failed to unmarshal: %w", err)
	}

	vendorMapVendors, ok := vendorMapData["vendors"].([]interface{})
	if !ok {
		return nil, fmt.Errorf(`key "vendors" not found or not an array`)
	}
	vendors := make([]vendor.VendorBulkInput, 0, len(vendorMapVendors))

	for _, raw := range vendorMapVendors {
		vendorMap, ok := raw.(map[string]interface{})
		if !ok {
			continue
		}

		v := vendor.VendorBulkInput{

			Vendor: vendor.Vendor{
				ID:                 strconv.Itoa(getInt(vendorMap, "Id")),
				Name:               getString(vendorMap, "Name"),
				About:              nil,
				Cuisine:            getString(vendorMap, "Cuisine"),
				Rating:             getFloat(vendorMap, "VendorRating"),
				DeliveryAvailable:  getBool(vendorMap, "AcceptsDeliveryOrder"),
				PickupAvailable:    getBool(vendorMap, "AcceptsTakeoutOrder"),
				IsFeatured:         getBool(vendorMap, "IsFeaturedVendor"),
				PromoText:          getStringPtrFrom(vendorMap, "PromoText"),
				VendorNotice:       getStringPtrFrom(vendorMap, "VendorNotice"),
				OpeningHours:       getStringPtr(vendorMap, "OpeningHours"),
				VendorListingImage: getStringPtrFrom(vendorMap, "VendorListingWebImageName"),
				VendorLogoImage:    getStringPtrFrom(vendorMap, "VendorCoverImageName"),
				VendorType:         getStringPtrFrom(vendorMap, "VendorType"),
				CuisineTags: strings.Split(
					strings.TrimSpace(getString(vendorMap, "CuisineTags")),
					"|",
				),
			},
			Address: &vendor.VendorAddress{
				StreetAddress: getString(vendorMap, "Address1"),
				City:          "", // optional, if not in JSON
				State:         "",
				ZipCode:       "",
				Latitude:      getFloat(vendorMap, "LocationLat"),
				Longitude:     getFloat(vendorMap, "LocationLng"),
			},
		}
		vendors = append(vendors, v)
	}

	return vendors, nil
}

func TransformFoodManduMenuItems(flatJSON []byte) ([]vendor.MenuItem, []vendor.MenuCategory, []vendor.VendorCategoryLink, error) {
	var rawMenuData map[string]interface{}

	if err := json.Unmarshal(flatJSON, &rawMenuData); err != nil {
		return nil, nil, nil, fmt.Errorf("failed to unmarshal: %w", err)
	}

	// Deduplication sets
	uniqueCategoryId := make(map[int]struct{})
	uniqueMenuItemId := make(map[int]struct{})
	vendorCategorySet := make(map[string]map[string]struct{})

	// Result containers
	uniqueCategories := make([]vendor.MenuCategory, 0)
	menuItems := make([]vendor.MenuItem, 0)

	for vendorId, menuItemsByCategory := range rawMenuData {
		categoryList, ok := menuItemsByCategory.([]interface{})
		if !ok {
			continue
		}

		for _, c := range categoryList {
			categoryWithItems, ok := c.(map[string]interface{})
			if !ok {
				continue
			}

			// --- Extract category info ---
			idFloat, ok := categoryWithItems["categoryId"].(float64)
			if !ok {
				continue
			}
			cId := int(idFloat)

			// --- Add unique category ---
			if _, exists := uniqueCategoryId[cId]; !exists {
				uniqueCategoryId[cId] = struct{}{}
				category := vendor.MenuCategory{
					ID:          strconv.Itoa(cId),
					Name:        getString(categoryWithItems, "category"),
					Description: getString(categoryWithItems, "categoryDesc"),
				}
				uniqueCategories = append(uniqueCategories, category)
			}

			// --- Track vendor–category link ---
			if _, ok := vendorCategorySet[vendorId]; !ok {
				vendorCategorySet[vendorId] = make(map[string]struct{})
			}
			vendorCategorySet[vendorId][strconv.Itoa(cId)] = struct{}{}

			// --- Extract menu items under this category ---
			itemsList, ok := categoryWithItems["items"].([]interface{})
			if !ok {
				continue
			}

			for _, mi := range itemsList {
				itemMap, ok := mi.(map[string]interface{})
				if !ok {
					continue
				}

				itemId := getInt(itemMap, "productId")
				if _, exists := uniqueMenuItemId[itemId]; !exists {

					uniqueMenuItemId[itemId] = struct{}{}

					mItem := vendor.MenuItem{
						ID:          strconv.Itoa(itemId),
						Name:        getString(itemMap, "name"),
						VendorID:    vendorId,
						Description: getString(itemMap, "productDesc"),
						Image:       getString(itemMap, "ProductImage"),
						BasePrice:   getFloat(itemMap, "price"),
						OldPrice:    getFloat(itemMap, "oldprice"),
						Keywords:    getString(itemMap, "Keyword"),
						Tags: strings.Split(
							strings.TrimSpace(getString(itemMap, "itemDisplayTag")),
							"/",
						),
						CategoryID: strconv.Itoa(cId),
					}

					menuItems = append(menuItems, mItem)
				}
			}
		}
	}

	// --- Construct vendor-category links ---
	vendorCategories := make([]vendor.VendorCategoryLink, 0)
	for vendorID, cats := range vendorCategorySet {
		for categoryID := range cats {
			vendorCategories = append(vendorCategories, vendor.VendorCategoryLink{
				VendorID:   vendorID,
				CategoryID: categoryID,
			})
		}
	}

	return menuItems, uniqueCategories, vendorCategories, nil
}

//-------------------- FOODMANDU VENDOR AND MENU TRANFORM FOR ES-----------------

func TransformFoodManduVendorsForES(flatJSON []byte) ([]map[string]interface{}, error) {
	var rawVendorData map[string]interface{}
	if err := json.Unmarshal(flatJSON, &rawVendorData); err != nil {
		return nil, fmt.Errorf("failed to unmarshal: %w", err)
	}

	vendorList, ok := rawVendorData["vendors"].([]interface{})
	if !ok {
		return nil, fmt.Errorf(`key "vendors" not found or not an array`)
	}

	vendors := make([]map[string]interface{}, 0, len(vendorList))

	for _, raw := range vendorList {
		vendorMap, ok := raw.(map[string]interface{})
		if !ok {
			continue
		}

		v := map[string]interface{}{
			"id":                 strconv.Itoa(getInt(vendorMap, "Id")),
			"name":               getString(vendorMap, "Name"),
			"about":              getString(vendorMap, "About"),
			"cuisine":            getString(vendorMap, "Cuisine"),
			"cuisine_tags":       getString(vendorMap, "CuisineTags"),
			"vendor_type":        getString(vendorMap, "VendorType"),
			"rating":             getFloat(vendorMap, "VendorRating"),
			"favorite_count":     getInt(vendorMap, "FavoriteCount"),
			"is_open":            getBool(vendorMap, "IsOpen"),
			"is_featured":        getBool(vendorMap, "IsFeaturedVendor"),
			"delivery_available": getBool(vendorMap, "AcceptsDeliveryOrder"),
			"pickup_available":   getBool(vendorMap, "AcceptsTakeoutOrder"),
			"delivery_fee":       getFloat(vendorMap, "DeliveryFee"),
			"min_order_amount":   getFloat(vendorMap, "MinOrderAmount"),
			"promo_text":         getString(vendorMap, "PromoText"),
			"vendor_notice":      getString(vendorMap, "VendorNotice"),
			"location": map[string]interface{}{
				"lat": getFloat(vendorMap, "LocationLat"),
				"lon": getFloat(vendorMap, "LocationLng"),
			},
			"street_address": getString(vendorMap, "Address1"),
			"city":           getString(vendorMap, "City"),
			"state":          getString(vendorMap, "State"),
			"zip_code":       getString(vendorMap, "ZipCode"),
		}

		vendors = append(vendors, v)
	}

	return vendors, nil
}

func TransformFoodManduMenuItemsForES(flatJSON []byte) ([]map[string]interface{}, error) {
	var rawMenuData map[string]interface{}
	if err := json.Unmarshal(flatJSON, &rawMenuData); err != nil {
		return nil, fmt.Errorf("failed to unmarshal: %w", err)
	}

	menuItems := make([]map[string]interface{}, 0)
	uniqueMenuItemId := make(map[int]struct{})

	for VendorId, menuItemsByCategory := range rawMenuData {
		categoryList, ok := menuItemsByCategory.([]interface{})
		if !ok {
			continue
		}

		for _, c := range categoryList {
			categoryWithItems, ok := c.(map[string]interface{})
			if !ok {
				continue
			}

			itemsList, ok := categoryWithItems["items"].([]interface{})
			if !ok {
				continue
			}

			cId := getInt(categoryWithItems, "categoryId")
			cName := getString(categoryWithItems, "category") 

			for _, mi := range itemsList {
				itemMap, ok := mi.(map[string]interface{})
				if !ok {
					continue
				}

				itemId := getInt(itemMap, "productId")
				if _, exists := uniqueMenuItemId[itemId]; exists {
					continue
				}
				uniqueMenuItemId[itemId] = struct{}{}

				menuItem := map[string]interface{}{
					"id":          strconv.Itoa(itemId),
					"vendor_id":   VendorId,
					"name":        getString(itemMap, "name"),
					"description": getString(itemMap, "productDesc"),
					"base_price":  getFloat(itemMap, "price"),
					"keywords":    getString(itemMap, "Keyword"),
					"tags":        getString(itemMap, "itemDisplayTag"),
					"is_available": true, 
					"is_popular":   false, 
					"is_vegetarian": false,
					"is_vegan":     false,
					"is_gluten_free": false,
					"spicy_level":   0,
					"portion_size":  "",
					"category": map[string]interface{}{
						"id":   strconv.Itoa(cId),
						"name": cName,
					},
				}

				menuItems = append(menuItems, menuItem)
			}
		}
	}

	return menuItems, nil
}



//-- ==================================================
//-- Business calc functions 
//-- ==================================================
func round2(v float64) float64 {
	return math.Round(v*100) / 100
}

func EstimateDeliveryTime(distanceKm float64) string {
	base := 15 // minutes
	perKm := 2 // minutes per km
	total := int(math.Ceil(float64(base) + distanceKm*float64(perKm)))
	return fmt.Sprintf("%d min", total)
}

func ComputeDeliveryFee(distanceKm float64) float64 {

	if distanceKm <= 0 {
		return 0
	}
	baseFee := 50 // Base delivery fee in rupees
	perKmFee := 10 // Fee per kilometer

	// convert ints to float64 for calculations and for round2
	if distanceKm <= 1 {
		return round2(float64(baseFee))
	}
	fee := float64(baseFee) + (distanceKm-1.0)*float64(perKmFee)
	return round2(fee)
}

// apply coupon to the subtotal (and optionally vendor-specific)
func ApplyCoupon(c coupon.Coupon, subtotal float64, vendorID string,userUsageCount int) (float64, error) {
	if c.Code == "" || !c.IsActive {
		return 0, nil
	}
	if c.EndDate != nil && time.Now().After(*c.EndDate) {
		return 0, errors.New("coupon expired")
	}
	if c.VendorID != nil && *c.VendorID != vendorID {
		return 0, errors.New("coupon not applicable to this vendor")
	}
	if c.MinOrderAmount > 0 && subtotal < c.MinOrderAmount {
		return 0, errors.New("order too small for coupon")
	}
	if userUsageCount >= c.PerUserLimit {
        return 0, fmt.Errorf("you’ve already used this coupon")
    }
	switch c.DiscountType {
	case "flat":
		amt := c.DiscountValue
		if amt > subtotal {
			amt = subtotal
		}
		return round2(amt), nil
	case "percent":
		amt := subtotal * (c.DiscountValue / 100.0)
		if ( amt > *c.MaxDiscountAmount){
			amt = *c.MaxDiscountAmount
		}
		return round2(amt), nil
	default:
		return 0, errors.New("unknown coupon type")
	}
}