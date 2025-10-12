package utils

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

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
		ID           *string  `json:"id"`
		EmailAddresses        []ClerkEmail `json:"email_addresses"`
		PhoneNumbers  []ClerkPhoneNumber `json:"phone_numbers"`
		ProfileImage *string `json:"image_url"`
		Username     string  `json:"username"`
		PrimaryEmailAddressID string       `json:"primary_email_address_id"`
		PrimaryPhoneNumberID   string       `json:"primary_phone_number_id"`
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


//-----------------------------------BULK VENDOR INSERTION-----------------



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

	for _, raw:= range vendorMapVendors {
       vendorMap, ok := raw.(map[string]interface{})
	   if !ok {
			continue
		}

		v := vendor.VendorBulkInput{
			
			Vendor: vendor.Vendor{
				ID: strconv.Itoa(getInt(vendorMap, "Id")),
				Name:              getString(vendorMap, "Name"),
				About:             "",
				Cuisine:           getString(vendorMap, "Cuisine"),
				Rating:            getFloat(vendorMap, "VendorRating"),
				DeliveryAvailable: getBool(vendorMap, "AcceptsDeliveryOrder"),
				PickupAvailable:   getBool(vendorMap, "AcceptsTakeoutOrder"),
				IsFeatured:        getBool(vendorMap, "IsFeaturedVendor"),
				PromoText:         getString(vendorMap, "PromoText"),
				VendorNotice:      getString(vendorMap, "VendorNotice"),
				OpeningHours:      getStringPtr(vendorMap, "OpeningHours"),
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

