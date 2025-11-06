package vendor

import "github.com/gitSanje/khajaride/internal/model"


type Vendor struct {
	model.Base
	ID                    string `json:"id" db:"id"`
	VendorUserID         *string `json:"vendorUserId" db:"vendor_user_id"`
	Name                  string   `json:"name" db:"name"`
	About                 string   `json:"about" db:"about"`
	Cuisine               string   `json:"cuisine" db:"cuisine"`
	Phone                 *string  `json:"phone" db:"phone"`
	Rating                float64  `json:"rating" db:"rating"`
	ReviewCount           int      `json:"reviewCount" db:"review_count"`
	DeliveryAvailable     bool     `json:"deliveryAvailable" db:"delivery_available"`
	PickupAvailable       bool     `json:"pickupAvailable" db:"pickup_available"`
	GroupOrderAvailable   bool     `json:"groupOrderAvailable" db:"group_order_available"`
	DeliveryFee           float64  `json:"deliveryFee" db:"delivery_fee"`
	MinOrderAmount        float64  `json:"minOrderAmount" db:"min_order_amount"`
	DeliveryTimeEstimate  string   `json:"deliveryTimeEstimate" db:"delivery_time_estimate"`
	IsOpen                bool     `json:"isOpen" db:"is_open"`
	OpeningHours          *string  `json:"openingHours" db:"opening_hours"` 
	VendorListingImage    *string  `json:"vendorListingImage" db:"vendor_listing_image_name"`
	VendorLogoImage       *string  `json:"vendorLogoImage" db:"vendor_logo_image_name"`
	VendorType            *string  `json:"vendorType" db:"vendor_type"`
	FavoriteCount         int      `json:"favoriteCount" db:"favorite_count"`
	IsFeatured            bool     `json:"isFeatured" db:"is_featured"`
	CuisineTags           []string `json:"cuisineTags" db:"cuisine_tags"`
	PromoText             *string   `json:"promoText" db:"promo_text"`
	VendorNotice          *string   `json:"vendorNotice" db:"vendor_notice"`
	VendorServiceCharge   float64  `json:"vendorServiceCharge" db:"vendor_service_charge"`
	VAT                   float64  `json:"vat" db:"vat"`
	VendorDiscount        float64  `json:"vendorDiscount" db:"vendor_discount"`
}


type Category struct {
	CategoryId  string `json:"categoryId"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Items       []MenuItem `json:"items"`
}
type VendorPopulated struct {
	Vendor
	Address    *VendorAddress         `json:"address,omitempty"`
	Categories []Category `json:"categories"`
}

type VendorBulkInput struct{
	Vendor
	Address    *VendorAddress         `json:"address,omitempty"`
}

type VendorCategoryLink struct {
	VendorID   string
	CategoryID string
}


