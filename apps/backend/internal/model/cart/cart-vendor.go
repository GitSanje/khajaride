package cart

import "github.com/gitSanje/khajaride/internal/model"


type CartVendor struct {
	model.Base
	CartSessionID       string   `json:"cartSessionId" db:"cart_session_id"`
	VendorID            string   `json:"vendorId" db:"vendor_id"`
	Subtotal            *float64  `json:"subtotal" db:"subtotal"`
	DeliveryCharge      *float64 `json:"deliveryCharge,omitempty" db:"delivery_charge"` // nullable, TBD
	VendorServiceCharge float64  `json:"vendorServiceCharge" db:"vendor_service_charge"`
	VAT                 float64  `json:"vat" db:"vat"`
	VendorDiscount      float64  `json:"vendorDiscount" db:"vendor_discount"`
	Total               *float64  `json:"total" db:"total"`
	
}
